"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const serve_index_1 = __importDefault(require("serve-index"));
const cors_1 = __importDefault(require("cors"));
const DEFAULT_CDN_FOLDER = "./default";
const config = require("./config.json");
if ((0, fs_1.readdirSync)(config.storageFolder).length == 0) {
    console.log(config.storageFolder + " is empty, copying default folder instead.");
    (0, fs_1.cpSync)(DEFAULT_CDN_FOLDER, config.storageFolder, {
        recursive: true,
    });
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*"
}));
const port = 3000;
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
app.use("/dl", express_1.default.static(config.storageFolder, {
    cacheControl: true
}));
app.use("/dl", (0, serve_index_1.default)(config.storageFolder, {
    stylesheet: path_1.default.join(__dirname, "filelist-index.css")
}));
app.use((0, serve_favicon_1.default)(path_1.default.join(config.storageFolder, "galatea.png")));
app.listen(port, () => {
    console.log(`CDN Launched at ${port}`);
});
