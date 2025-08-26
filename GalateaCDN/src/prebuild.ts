import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import path from "path";
import sharp from "sharp";
import {
  CURRENT_STORAGE_FOLDER,
  DEFAULT_CDN_FOLDER,
  ImageScales,
  IS_DEV_MODE,
  MIPMAP_JSON_PATH,
} from "./constants";

console.log("copying default folder.");

const IS_FORCE_MODE = process.argv.includes("--force");

// we start generating mipmaps from 2 times the scale of the image.
// Maximum is 8K for obvious reasons.
const MAX_SCALE = 8192;
const MIN_SCALE = 30;

if (IS_FORCE_MODE)
  console.log(
    "⚠️⚠️⚠️ '--force' parameter used! ALL mipmaps will be REGENERATED!"
  );

const IMAGES_FOLDER = path.join(CURRENT_STORAGE_FOLDER, "images");

cpSync(DEFAULT_CDN_FOLDER, CURRENT_STORAGE_FOLDER, {
  recursive: true,
});

let mipmapInfo: Record<string, ImageScales[]> = {};

async function convertImage(fullPath: string, outputPath: string) {
  let promises = new Array<Promise<any>>();

  let fileBuff = readFileSync(fullPath);
  let imgSharp = sharp(fileBuff);

  // original image
  promises.push(
    imgSharp
      .webp({
        quality: 100,
      })
      .toFile(outputPath)
  );

  if (!fullPath.startsWith(IMAGES_FOLDER)) {
    return console.log(
      "⚠️  Skipping mipmap generation of " +
        fullPath +
        " (not inside of " +
        IMAGES_FOLDER +
        ")"
    );
  }

  let size = await imgSharp.metadata();

  let list = new Array<ImageScales>();

  let w = Math.min(MAX_SCALE, size.width * 2);
  let h = Math.min(MAX_SCALE, size.height * 2);

  //mipmapping
  console.log("ℹ️  Generating mipmaps for " + fullPath);

  mkdirSync(path.join(CURRENT_STORAGE_FOLDER, "mipmaps"), {
    recursive: true,
  });

  for (
    ;
    w >= MIN_SCALE && h >= MIN_SCALE;
    w = Math.floor(w / 2), h = Math.floor(h / 2)
  ) {
    if (IS_DEV_MODE) {
      console.log("🔍 Generate scale: " + w + "x" + h);
    }

    const outPath = outputPath
      .replace(".webp", `-${w}x${h}.webp`)
      .replace("images/", "mipmaps/");

    if (existsSync(outPath) && !IS_FORCE_MODE) {
      console.log(
        "⚠️  Skipping mipmap of resolution '" +
          w +
          "x" +
          h +
          "' generation at " +
          outPath +
          " (already generated, mipmaps are expensive!)"
      );
      continue;
    }

    mkdirSync(path.dirname(outPath), {
      recursive: true,
    });

    promises.push(
      imgSharp
        .resize({
          kernel: "mks2021",
          width: w,
          height: h,
        })
        .webp({
          quality: 100,
        })
        .toFile(outPath)
    );

    list.push({
      path: outPath,
      w,
      h,
    });
  }

  mipmapInfo[outputPath] = list;

  return Promise.all(promises);
}

console.log("ℹ️  Processing images in default/");
async function convertPngToWebpRecursively(dir: string) {
  let entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively dive into subdirectory
      await convertPngToWebpRecursively(fullPath);
    } else if (
      entry.isFile() &&
      path.extname(entry.name).toLowerCase() === ".png"
    ) {
      const outputFileName = path.basename(entry.name, ".png") + ".webp";
      const outputPath = path.join(dir, outputFileName);

      await convertImage(fullPath, outputPath);
      rmSync(fullPath);
      console.log(`✅ Converted: ${fullPath} → ${outputPath}`);
      console.log(`✅ Removed ${fullPath}`);
    }
  }
}

convertPngToWebpRecursively(CURRENT_STORAGE_FOLDER)
  .catch((err) => console.error(`❌ Error converting:`, err))
  .then((_) => {
    writeFileSync(MIPMAP_JSON_PATH, JSON.stringify(mipmapInfo));
    console.log("ℹ️  Mipmap information file stored.");
  });
