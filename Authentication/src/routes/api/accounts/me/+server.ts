import type { RequestHandler } from "./$types";
import type { APIResponse, ClientSideAccount } from "$lib/client/API/apiTypes";
import { accountToClientInfo } from "$lib/server/schema";
import { json, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, request }) => {
  if (!locals.session) return error(401, "You are not authorized.");
  return json({
    data: accountToClientInfo(locals.session.account),
  } satisfies APIResponse<ClientSideAccount>);
};
