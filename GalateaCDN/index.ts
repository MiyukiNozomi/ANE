import express from "express";

import { cpSync, existsSync } from "fs";
import path from "path";

import serveFavicon from "serve-favicon";
import serveIndex from "serve-index";

import cors from "cors";
import { CURRENT_STORAGE_FOLDER } from "./constants";

if (!existsSync(CURRENT_STORAGE_FOLDER)) {
    console.error(CURRENT_STORAGE_FOLDER + ' does not exist. did you run prebuild.js first?');
    process.exit(-1);
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
    stylesheet: path.join(__dirname, "filelist-index.css"),

    template: path.join(__dirname, "directory.html")
}));

app.use(serveFavicon(path.join(CURRENT_STORAGE_FOLDER, "galatea.webp")));

app.listen(port, () => {
    console.log(`CDN Launched at ${port}`);
})