import { mkdirSync } from "fs";
import sharp from "sharp";
import path from "path";
import { PROFILE_PICTURE_STORE_FOLDER } from "./constants";
import type { Account } from "./schema";

mkdirSync(PROFILE_PICTURE_STORE_FOLDER, {
  recursive: true,
});

export async function encodeAndStoreUserPicture(image: File, user: Account) {
  const sharpImg = sharp(await image.bytes());
  const imageDimensions = await sharpImg.metadata();
  const imageSize =
    Math.min(imageDimensions.height, imageDimensions.width) > 300
      ? 300
      : Math.min(imageDimensions.height, imageDimensions.width);

  const outPth = path.join(
    PROFILE_PICTURE_STORE_FOLDER,
    `${user.username}.webp`,
  );

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
