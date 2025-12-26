import type { AccountSession, APIResponse } from "$lib/client/API/apiTypes";
import { db } from "$lib/server/db";
import { createSessionWithAccountInfo } from "$lib/server/keystores";
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from "$lib/shared/safetyConstants";
import { error, json } from "@sveltejs/kit";
import { argon2id, hash } from "argon2";
import { z } from "zod";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";

const requestData = z.object({
  username: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  const jsonReq = await request.json();
  const parsedData = requestData.safeParse(jsonReq);
  if (parsedData.error) {
    return error(400);
  }

  const { username, password } = parsedData.data;

  if (Boolean(await db.accounts.whereFirst({ username })))
    return json({ error: "ERR_ACCOUNT_EXISTS" } satisfies APIResponse<any>);

  let userId = (await db.accounts.insert({
    username,
    passwordHash: await hash(password, { type: argon2id }),
  })) as number;

  let sessionInfo = await createSessionWithAccountInfo(userId, "ROOT");

  if (!sessionInfo) {
    console.error(
      "Somehow, registration session creation failed: ",
      parsedData.data,
    );
    return error(500);
  }

  if (dev) console.log("Successfull registration: ", sessionInfo);

  return json({
    data: sessionInfo,
  } satisfies APIResponse<AccountSession>);
};
