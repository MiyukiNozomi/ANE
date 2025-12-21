import { redirect, text } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/services";
import { redirectToLoginPage } from "$lib/server/tools";

export const load = (async ({ locals, request }) => {
  if (!locals.account) return redirectToLoginPage(request.url);
  const securityInfo = await Backend.getSecurityInfo(locals.sessionToken!);
  if ("error" in securityInfo) {
    return text(securityInfo.error, {
      status: 500,
    });
  }
  return { accountSecurityInfo: securityInfo.object };
}) satisfies PageServerLoad;
