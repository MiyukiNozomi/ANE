import { Backend } from "$lib/server/services";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  USERNAME_SAFETY_REGEX,
} from "$lib/shared/safety";

let requestData = z.object({
  username: z
    .string()
    .min(MIN_USERNAME_LENGTH)
    .max(MAX_USERNAME_LENGTH)
    .optional(),
  accountId: z.string().optional(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    if (dev) console.log(obj.error);
    return error(
      400,
      "Your request contains issues: \n" +
        obj.error.issues.map((v) => ` - [${v.code}] ${v.message}`).join("\n"),
    );
  }

  const { username, accountId } = obj.data;
  if (
    (accountId == null || accountId == undefined) &&
    (!username || !USERNAME_SAFETY_REGEX.test(username))
  ) {
    if (dev) console.log("Bad params: ", obj.data);
    return error(400, "You need to provide either an accountId or a username.");
  }

  const res = await Backend.getAccount(
    accountId ? { userId: accountId } : { username: username!! },
  );

  if (dev) console.log(res);
  return json(res);
};
