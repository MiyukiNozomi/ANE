import { AUTH_DATA_FOLDER } from "$env/static/private";
import { mkdirSync } from "fs";
import type { AccountInfo } from "./backend-types";
import sharp from "sharp";
import path from "path";

mkdirSync(AUTH_DATA_FOLDER, {
  recursive: true,
});

export async function encodeAndStoreUserPicture(
  image: File,
  user: AccountInfo
) {
  const sharpImg = sharp(await image.bytes());
  const imageDimensions = await sharpImg.metadata();
  const imageSize =
    Math.min(imageDimensions.height, imageDimensions.width) > 300
      ? 300
      : Math.min(imageDimensions.height, imageDimensions.width);

  const outPth = path.join(AUTH_DATA_FOLDER, `${user.name}.webp`);

  sharpImg
    .webp({
      quality: 50,
    })
    .resize({
      kernel: "cubic",
      width: imageSize,
      height: imageSize,
    })
    .toFile(outPth);
}
