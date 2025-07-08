import express from "express";
import { cpSync, existsSync, readdir, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import serveFavicon from "serve-favicon";
import serveIndex from "serve-index";

const DEFAULT_CDN_FOLDER = "./default";

const config: {
    storageFolder: string,
} = require("./config.json");

if (readdirSync(config.storageFolder).length == 0) {
    console.log(config.storageFolder + " is empty, copying default folder instead.");
    cpSync(DEFAULT_CDN_FOLDER, config.storageFolder, {
        recursive: true,
    });
}

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/dl", express.static(config.storageFolder, {
    cacheControl: true
}));

app.use("/dl", serveIndex(config.storageFolder, {
    stylesheet: path.join(__dirname, "filelist-index.css")
}));

app.use(serveFavicon(path.join(config.storageFolder, "galatea.png")));

app.listen(port, () => {
    console.log(`CDN Launched at ${port}`);
})