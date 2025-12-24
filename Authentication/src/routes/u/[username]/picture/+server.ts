import { join } from "path";
import type { RequestHandler } from "./$types";
import { PROFILE_PICTURE_STORE_FOLDER } from "$lib/server/constants";
import { existsSync, statSync } from "fs";
import { USERNAME_SAFETY_REGEX } from "$lib/shared/safetyConstants";
import { createReadableStream } from "@sveltejs/kit/node";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
  if (USERNAME_SAFETY_REGEX.test(params.username)) {
    let path = join(PROFILE_PICTURE_STORE_FOLDER, params.username + ".webp");

    if (existsSync(path) && statSync(path).isFile()) {
      return new Response(createReadableStream(path));
    }
  }
  return redirect(
    302,
    "https://galatea.ane.jp.net/dl/images/default-profile.webp",
  );
};
