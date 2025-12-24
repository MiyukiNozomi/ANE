import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { encodeAndStoreUserPicture } from "$lib/server/profilePictures";
import type { APIOk, APIResponse } from "$lib/client/API/apiTypes";
import z from "zod";
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  USERNAME_SAFETY_REGEX,
} from "$lib/shared/safetyConstants";
import { db } from "$lib/server/db";

let requestData = z.object({
  displayName: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.session) return error(401);
  if (locals.session.session.isThirdPartySession) return error(403);

  let data = requestData.safeParse(await request.json());
  if (data.error) return error(400);

  db.accounts.updateDisplayName(
    locals.session.account.id,
    data.data.displayName,
  );

  return json({ data: true } satisfies APIOk);
};
