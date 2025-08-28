import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { encodeAndStoreUserPicture } from "$lib/server/profilePictures";

export const PUT: RequestHandler = async ({ locals, request }) => {
  if (!locals.sessionToken || !locals.account) return error(401);

  const formData = await request.formData();
  const inputImage = formData.get("inputImage");

  if (!inputImage || !(inputImage instanceof File)) {
    return error(
      400,
      "This endpoint only takes image uploads in `inputImage`!"
    );
  }

  try {
    await encodeAndStoreUserPicture(inputImage, locals.account);
  } catch (err) {
    console.error(err);
    return json({ ok: false });
  }

  return json({ ok: true });
};
