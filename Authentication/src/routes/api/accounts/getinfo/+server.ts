import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
} from "$lib/shared/safetyConstants";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { z } from "zod";
import type { APIResponse, ClientSideAccount } from "$lib/client/API/apiTypes";
import { db } from "$lib/server/db";
import { accountToClientInfo } from "$lib/server/schema";

const requestData = z.union([
  z.object({
    username: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
  }),
  z.object({
    accountId: z.number().positive(),
  }),
]);

export const POST: RequestHandler = async ({ request, locals }) => {
  const jsonReq = await request.json();
  const parsedData = requestData.safeParse(jsonReq);
  if (parsedData.error) {
    return error(400);
  }

  const data = parsedData.data;

  let account =
    "accountId" in data
      ? await db.accounts.whereFirst({ id: data.accountId })
      : await db.accounts.whereFirst({ username: data.username });

  return json({
    error: Boolean(account) ? undefined : "ERR_ACCOUNT_DOES_NOT_EXIST",
    data: Boolean(account) ? accountToClientInfo(account!) : undefined,
  } satisfies APIResponse<ClientSideAccount>);
};
