import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/services";
import { dev } from "$app/environment";
import { redirectToLoginPage } from "$lib/server/tools";

export const load = (async ({ locals, request, params }) => {
  if (!locals.account) {
    return redirectToLoginPage(request.url);
  }

  const reqInfo = await Backend.getAuthorizationStatus({ id: params.reqCode });
  if (dev) {
    console.log(reqInfo);
  }

  if ("error" in reqInfo) {
    return {};
  }

  return {
    reqInfo: reqInfo.object,
  };
}) satisfies PageServerLoad;
