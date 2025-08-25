import { cpSync, existsSync, readdirSync, readFileSync, statSync } from "fs";
import mime from "mime-types";
import path from "path";

import {
  CURRENT_STORAGE_FOLDER,
  ImageScales,
  IS_DEV_MODE,
  MAX_AGE,
  PORT,
} from "./constants";
import { createServer, ServerResponse } from "http";
import sharp from "sharp";

if (!existsSync(CURRENT_STORAGE_FOLDER)) {
  console.error(
    CURRENT_STORAGE_FOLDER + " does not exist. did you run prebuild.js first?"
  );
  process.exit(-1);
}

const homepage = readFileSync("./index.html").toString();
const directoryPage = readFileSync("./directory.html").toString();

const imageMipmaps: Record<string, ImageScales[]> = JSON.parse(
  readFileSync(path.join(__dirname, "mipmaps.info.json")).toString()
);

async function replyImageResized(
  res: ServerResponse,
  path: string,
  width: number,
  height: number
) {
  const mipmaps = imageMipmaps[path];
  let targetPath: string | null = null;

  if (mipmaps) {
    let lowestDistance = Number.MAX_SAFE_INTEGER;

    for (const mipmap of mipmaps) {
      let left = isNaN(width) ? 0 : Math.pow(width - mipmap.w, 2);
      let right = isNaN(height) ? 0 : Math.pow(height - mipmap.h, 2);

      let distance = Math.sqrt(left + right);

      if (IS_DEV_MODE)
        console.log(
          `Distance from [${mipmap.w}, ${mipmap.h}] to [${width}, ${height}] is ${distance}`
        );

      if (distance < lowestDistance) {
        targetPath = mipmap.path;
        lowestDistance = distance;
      }
    }
  }

  if (IS_DEV_MODE) {
    console.log("Chosen image: " + (targetPath ?? path));
  }

  res.writeHead(200, {
    "content-type": "image/webp",
    "cache-control": "max-age=302800",
  });
  res.write(readFileSync(targetPath ?? path));
  res.end();
}

const server = createServer(async (req, res) => {
  // this should be fine? i kinda dislike this but it's only used to parse the url, so whatever.
  const url = new URL(
    "http://localhost" + (req.url?.startsWith("/") ? req.url : "/" + req.url)
  );
  let pathname = path.normalize(url.pathname);

  console.log(req.method, pathname, req.headers["user-agent"]);

  if (pathname.includes("..") || req.url?.includes("%00")) {
    console.log("Request has been denied!");
    res.writeHead(403);
    res.write(
      "俺の返答はこれだ：NO（ノー）だ。マジでNO、消え失せろ！てか、お前ボットか？だったら…くたばれ！"
    );
    return res.end();
  }

  if (pathname == "/") {
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": MAX_AGE,
    });
    res.write(homepage);
    return res.end();
  }

  // compatibility only with the other microservices while i update them one by one.
  if (pathname.startsWith("/dl/")) {
    pathname = pathname.substring(3);
  }

  if (pathname == "/favicon.ico") {
    res.writeHead(303, { location: "/favicon.webp" });
    return res.end();
  }

  pathname = path.join(CURRENT_STORAGE_FOLDER, pathname);

  if (!existsSync(pathname)) {
    res.writeHead(404);
    return res.end();
  }

  if (statSync(pathname).isDirectory()) {
    let list = readdirSync(pathname)
      .map((v) => ({ st: statSync(path.join(pathname, v)), name: v }))
      .sort((a, b) => +b.st.isDirectory() - +a.st.isDirectory())
      .map(({ st, name }) => {
        return `<a href="${path.join(url.pathname, name)}">${
          st.isFile() ? "&#128196;" : "&#128193;"
        } ${name}</a>`;
      })
      .join("\n");

    res.writeHead(200, {
      "content-type": "text/html",
      "cache-control": MAX_AGE,
    });

    res.write(
      directoryPage.replace("{list}", list).replaceAll("{path}", url.pathname)
    );

    return res.end();
  }

  const mimeType = mime.lookup(pathname) || "application/octet-stream";

  if (url.searchParams.has("width") || url.searchParams.has("height")) {
    return await replyImageResized(
      res,
      pathname,
      parseInt(url.searchParams.get("width") ?? "#"),
      parseInt(url.searchParams.get("height") ?? "#")
    );
  }
  const file = readFileSync(pathname);

  res.writeHead(200, {
    "content-type": mimeType,
    "cache-control": MAX_AGE,
  });
  res.write(file);
  res.end();
});

server.on("listening", () => console.log(`Server launched at ${PORT}`));

server.listen(PORT);
