import os from "os";
import path from "path";
import { cpSync, readdir, rmSync } from "fs";
import sharp from "sharp";
import { CURRENT_STORAGE_FOLDER, DEFAULT_CDN_FOLDER } from "./constants";

console.log("copying default folder.");
cpSync(DEFAULT_CDN_FOLDER, CURRENT_STORAGE_FOLDER, {
    recursive: true,
});

console.log("Processing images in default/")
function convertPngToWebpRecursively(dir: string) {
    readdir(dir, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`❌ Error reading directory: ${dir}`, err);
            return;
        }

        entries.forEach(entry => {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Recursively dive into subdirectory
                convertPngToWebpRecursively(fullPath);
            } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.png') {
                const outputFileName = path.basename(entry.name, '.png') + '.webp';
                const outputPath = path.join(dir, outputFileName);

                sharp(fullPath)
                    .webp({
                        quality: 50
                    })
                    .toFile(outputPath)
                    .then(() => {
                        console.log(`✅ Converted: ${fullPath} → ${outputPath}`);
                        rmSync(fullPath);
                        console.log(`✅ Removed ${fullPath}`);
                    })
                    .catch(err => {
                        console.error(`❌ Error converting ${fullPath}:`, err);
                    });
            }
        });
    });
}
convertPngToWebpRecursively(CURRENT_STORAGE_FOLDER);