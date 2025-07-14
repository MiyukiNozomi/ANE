import express from "express";
import { cpSync, existsSync, readdir, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import serveFavicon from "serve-favicon";
import serveIndex from "serve-index";

import cors from "cors";

const DEFAULT_CDN_FOLDER = "./default";
const CURRENT_STORAGE_FOLDER = "~/storage";

if (readdirSync(CURRENT_STORAGE_FOLDER).length == 0) {
    console.log(CURRENT_STORAGE_FOLDER + " is empty, copying default folder instead.");
    cpSync(DEFAULT_CDN_FOLDER, CURRENT_STORAGE_FOLDER, {
        recursive: true,
    });
}

const app = express();

app.use(cors({
    origin: "*"
}));

const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/dl", express.static(CURRENT_STORAGE_FOLDER, {
    cacheControl: true
}));

app.use("/dl", serveIndex(CURRENT_STORAGE_FOLDER, {
    stylesheet: path.join(__dirname, "filelist-index.css")
}));

app.use(serveFavicon(path.join(CURRENT_STORAGE_FOLDER, "galatea.png")));

app.listen(port, () => {
    console.log(`CDN Launched at ${port}`);
})