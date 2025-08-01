import {
  asLocalResponse,
  isUsernameValid,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
} from "$lib/server/backend";
import { Backend } from "$lib/server/backend-api";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";

let requestData = z.object({
  username: z
    .string()
    .min(MIN_USERNAME_LENGTH)
    .max(MAX_USERNAME_LENGTH)
    .optional(),
  accountId: z.number().optional(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  // the need for a try catch here is to ensure exceptions from zod will result in a 400 and not a 5xx

  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    if (dev) console.log(obj.error);
    return error(
      400,
      "Your request contains issues: \n" +
        obj.error.issues.map((v) => ` - [${v.code}] ${v.message}`).join("\n")
    );
  }

  const { username, accountId } = obj.data;
  if (
    (accountId == null || accountId == undefined) &&
    (!username || !isUsernameValid(username))
  ) {
    if (dev) console.log("Bad params: ", obj.data);
    return error(400, "You need to provide either an accountId or a username.");
  }

  const backendResponse = await Backend.getAccount(username, accountId);
  if (!backendResponse) return error(500, "miyuki.gov.nt");
  return json(asLocalResponse(backendResponse));
};
