import { cpSync, existsSync, readdirSync, readFileSync, statSync } from "fs";
import mime from "mime-types";
import path from "path";

import { CURRENT_STORAGE_FOLDER, MAX_AGE, PORT } from "./constants";
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

async function replyImageResized(
  res: ServerResponse,
  image: Buffer,
  width: number,
  height: number
) {
  const finalImage = await sharp(image)
    .webp({
      quality: 50,
    })
    .resize({
      fit: "contain",
      width: isNaN(width) ? undefined : width,
      height: isNaN(height) ? undefined : height,
      kernel: "mks2021",
    })
    .toBuffer();

  res.writeHead(200, {
    "content-type": "image/webp",
    "cache-control": "max-age=302800",
  });
  res.write(finalImage);
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

  const file = readFileSync(pathname);
  const mimeType = mime.lookup(pathname) || "application/octet-stream";

  if (url.searchParams.has("width") || url.searchParams.has("height")) {
    return await replyImageResized(
      res,
      file,
      parseInt(url.searchParams.get("width") ?? "#"),
      parseInt(url.searchParams.get("height") ?? "#")
    );
  }

  res.writeHead(200, {
    "content-type": mimeType,
    "cache-control": MAX_AGE,
  });
  res.write(file);
  res.end();
});

server.on("listening", () => console.log(`Server launched at ${PORT}`));

server.listen(PORT);
