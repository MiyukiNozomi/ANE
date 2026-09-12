import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import mime from "mime-types";
import path from "path";

import { createServer, ServerResponse } from "http";
import {
  CURRENT_STORAGE_FOLDER,
  IS_DEV_MODE,
  MAX_AGE,
  MIPMAP_JSON_PATH,
  PORT,
} from "./constants";

/**
 *  Galatea, the stubborn "Screw third parties" microservice.
 *
 * Some people will say "wait, it loads it all into memory!?", yes. it does.
 * You might think that's insane, but in pratice? it isnt. the entire tree will not go over a gigabyte, this isnt
 * serving user files, only images, fonts and sounds.
 *
 * It's actually much cheaper than having to constantly go into the SSD and request the file.
 * We also keep memory allocation to a minimum.
 * Requesting a file no longer loads an entire buffer just for one request, the files are static; and we're also immune to LFI attacks
 * because, guess what? after initializing we never read files from the disk.
 */

async function init() {
  let imageMipmaps = JSON.parse(readFileSync(MIPMAP_JSON_PATH).toString());

  if (!existsSync(CURRENT_STORAGE_FOLDER)) {
    console.error(
      CURRENT_STORAGE_FOLDER +
        " does not exist. did you run prebuild.js first?",
    );
    process.exit(-1);
  }

  let availableFiles: Record<string, Buffer> = {};
  let availableFolders: Record<
    string,
    Array<{
      filename: string;
      isDirectory: boolean;
      size: number;
    }>
  > = {};

  const readFilesRecursive = (pth: string) => {
    if (statSync(pth).isDirectory()) {
      let lst = new Array<(typeof availableFolders)[string][number]>();
      readdirSync(pth).forEach((v) => {
        const vPath = path.join(pth, v);
        const stat = statSync(vPath);

        lst.push({
          filename: v,
          isDirectory: stat.isDirectory(),
          size: stat.size,
        });
        readFilesRecursive(vPath);
      });
      availableFolders[
        "/" +
          (pth == CURRENT_STORAGE_FOLDER
            ? ""
            : pth.substring(CURRENT_STORAGE_FOLDER.length - 1))
      ] = lst.sort((a, b) => +b.isDirectory - +a.isDirectory);
    } else {
      availableFiles["/" + pth.substring(CURRENT_STORAGE_FOLDER.length - 1)] =
        readFileSync(pth);
    }
  };
  readFilesRecursive(CURRENT_STORAGE_FOLDER);

  return {
    mainPage: readFileSync("./index.html")
      .toString()
      .replace(
        "{script-here}",
        readFileSync("./galatea-scripts.html").toString(),
      ),
    directoryListPage: readFileSync("./directory.html").toString(),
    imageMipmaps,
    availableFiles,
    availableFolders,
  };
}

init().then(
  ({
    mainPage,
    directoryListPage,
    imageMipmaps,
    availableFiles,
    availableFolders,
  }) => {
    async function replyImageResized(
      res: ServerResponse,
      path: string,
      width: number,
      height: number,
    ) {
      const mipmaps = imageMipmaps[path];
      let targetPath: string | null = null;

      if (mipmaps && !isNaN(width) && !isNaN(height)) {
        let lowestDistance = Number.MAX_SAFE_INTEGER;

        for (const mipmap of mipmaps) {
          let left = isNaN(width) ? 0 : Math.pow(width - mipmap.w, 2);
          let right = isNaN(height) ? 0 : Math.pow(height - mipmap.h, 2);

          let distance = Math.sqrt(left + right);

          if (IS_DEV_MODE)
            console.log(
              `Distance from [${mipmap.w}, ${mipmap.h}] to [${width}, ${height}] is ${distance}`,
            );

          if (distance < lowestDistance) {
            targetPath = mipmap.path;
            lowestDistance = distance;
          }
        }
      }

      if (targetPath)
        targetPath = targetPath.substring(CURRENT_STORAGE_FOLDER.length);

      if (IS_DEV_MODE) {
        console.log("Chosen image: " + (targetPath ?? path));
      }

      const buff = availableFiles[targetPath ?? path];

      if (!buff) {
        res.writeHead(400);
        return res.end();
      }

      res.writeHead(200, {
        "content-type": "image/webp",
        "cache-control": IS_DEV_MODE ? "no-cache" : "max-age=302800",
      });
      res.write(buff);
      res.end();
    }

    const server = createServer(async (req, res) => {
      // this should be fine? i kinda dislike this but it's only used to parse the url, so whatever.
      const url = new URL(
        req.url?.startsWith("/") ? req.url : "/" + req.url,
        "http://localhost",
      );
      let pathname = path.normalize(url.pathname);

      console.log(req.method, pathname, req.headers["user-agent"]);

      // more of an easter egg to be honest. previously we didnt load everything at the start
      // so this was needed.
      // but its a really bad solution to LFI.. so, yeah.
      // Only keeping it as an easter egg of old Galatea.
      if (pathname.includes("..") || req.url?.includes("%00")) {
        res.writeHead(403, {
          "content-type": "text/plain; charset=utf-8",
        });
        res.write(
          "俺の返答はこれだ：NO（ノー）だ。マジでNO、消え失せろ！てか、お前ボットか？だったら…くたばれ！",
        );
        return res.end();
      } else if (pathname == "/favicon.ico") {
        res.writeHead(303, { location: "/favicon.webp" });
        return res.end();
      } else if (pathname == "/") {
        if (IS_DEV_MODE) {
          // no cache on devmode.
          res.writeHead(200);
        } else {
          res.writeHead(200, {
            "content-type": "text/html; charset=utf-8",
            "cache-control": MAX_AGE,
          });
        }
        res.write(mainPage);
        return res.end();
      }

      // compatibility only with the other microservices while i update them one by one.
      // actually? not all microservices use this anymore.
      // the old galatea was express-based, which was awful for CPU usage..
      // and in some older microservices, they still use /dl.
      // either way, its not really expensive nor does it introduce a vulnerability, so we're fine.
      if (pathname.startsWith("/dl")) {
        pathname = pathname.substring(3);
      }

      // Since the filesystem has been told to politly fuck-off after the init() function,
      // we have to normalize input paths (so we can find them in the records)
      if (pathname.endsWith("/") && pathname.length > 1)
        pathname = pathname.substring(0, pathname.length - 1);

      if (availableFolders[pathname]) {
        let list = availableFolders[pathname]
          .map(({ size, isDirectory, filename }) => {
            return `<pre><a href="${path.join(url.pathname, filename)}">drwxr-xr-x    4 root wheel      ${(isDirectory
              ? "[DIR]"
              : size.toString()
            ).padStart(8, " ")} ${filename}</a></pre>`;
          })
          .join("\n");

        res.writeHead(200, {
          "content-type": "text/html",
          "cache-control": MAX_AGE,
        });

        res.write(
          directoryListPage
            .replace("{list}", list)
            .replaceAll("{path}", url.pathname)
            .replace(
              "{script-here}",
              readFileSync("./galatea-scripts.html").toString(),
            ),
        );
        return res.end();
      } else if (availableFiles[pathname]) {
        const mimeType = mime.lookup(pathname) || "application/octet-stream";

        if (url.searchParams.has("width") || url.searchParams.has("height")) {
          return await replyImageResized(
            res,
            pathname,
            parseInt(url.searchParams.get("width") ?? "#"),
            parseInt(url.searchParams.get("height") ?? "#"),
          );
        }

        res.writeHead(200, {
          "content-type": mimeType,
          "cache-control": MAX_AGE,
        });
        res.write(availableFiles[pathname]);
        res.end();
      } else {
        res.writeHead(404);
        return res.end();
      }
    });

    server.on("listening", () => console.log(`Server launched at ${PORT}`));

    server.listen(PORT);
  },
);
