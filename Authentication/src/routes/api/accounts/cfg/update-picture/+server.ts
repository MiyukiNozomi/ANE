import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { encodeAndStoreUserPicture } from "$lib/server/profilePictures";
import type { APIOk, APIResponse } from "$lib/client/API/apiTypes";

export const PUT: RequestHandler = async ({ locals, request }) => {
  if (!locals.session) return error(401);
  if (locals.session.session.isThirdPartySession) return error(403);

  const formData = await request.formData();
  const inputImage = formData.get("inputImage");

  if (!inputImage || !(inputImage instanceof File)) {
    return error(
      400,
      "This endpoint only takes image uploads in `inputImage`!",
    );
  }

  try {
    await encodeAndStoreUserPicture(inputImage, locals.session.account);
  } catch (err) {
    console.error(err);
    return json({
      error: "ERR_BAD_PROFILE_PICTURE_FORMAT",
    } satisfies APIResponse<null>);
  }
  return json({ data: true } satisfies APIOk);
};
