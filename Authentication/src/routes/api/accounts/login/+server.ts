import type {
  APIError,
  APIResponse,
  ClientSideAccount,
} from "$lib/client/API/apiTypes";
import { db } from "$lib/server/db";
import { createSessionWithAccountInfo } from "$lib/server/keystores";
import { TimeBasedOTP } from "$lib/server/totp";
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from "$lib/shared/safetyConstants";
import { error, json } from "@sveltejs/kit";
import { verify } from "argon2";
import { z } from "zod";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";

const requestData = z.object({
  username: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  totpCode: z.string().max(32).optional(),
});

export const POST: RequestHandler = async ({ request, cookies }) => {
  const jsonReq = await request.json();
  const parsedData = requestData.safeParse(jsonReq);
  if (parsedData.error) {
    return error(400);
  }

  const { username, password, totpCode } = parsedData.data;

  let account = await db.accounts.whereFirst({ username });
  if (!account)
    return json({
      error: "ERR_ACCOUNT_DOES_NOT_EXIST",
    } satisfies APIError);

  if (!(await verify(account.passwordHash, password))) {
    return json({
      error: "ERR_ACCOUNT_INCORRECT_PASSWORD",
    } satisfies APIError);
  }

  if (account.totpSecret) {
    if (!totpCode)
      return json({
        error: "ERR_ACCOUNT_TWOFACTOR_REQUIRED",
      });

    if (!TimeBasedOTP.verify(totpCode, account.totpSecret, 2))
      return json({
        error: "ERR_ACCOUNT_INCORRECT_TWOFACTOR",
      });
  }

  let sessionInfo = await createSessionWithAccountInfo(account.id, "ROOT");

  if (!sessionInfo) {
    console.error(
      "Somehow, registration session creation failed: ",
      parsedData.data,
    );
    return error(500);
  }

  cookies.set("authorization", sessionInfo.sessionInfo.id, {
    path: "/",
    secure: !dev,
    httpOnly: true,
    sameSite: "lax",
  });

  if (dev) console.log("Successful login: ", sessionInfo);

  return json({
    data: sessionInfo.accountInfo,
  } satisfies APIResponse<ClientSideAccount>);
};
