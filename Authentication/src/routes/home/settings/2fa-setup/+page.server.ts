import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/services";
import { text } from "@sveltejs/kit";
import { redirectToLoginPage } from "$lib/server/tools";

export const load = (async ({ locals, request }) => {
  if (!locals.account) return redirectToLoginPage(request.url);

  const securityInfo = await Backend.getSecurityInfo(locals.sessionToken!);
  if ("error" in securityInfo) {
    return text(securityInfo.error, {
      status: 500,
    });
  }

  if (securityInfo.object.has2FA) {
    return redirect(302, "/home/settings#danger-zone");
  }

  const twofactorSetup = await Backend.twoFactorEnableStep1(locals.account.id);
  if ("error" in twofactorSetup) {
    return text(twofactorSetup.error, {
      status: 500,
    });
  }

  return { sharedSecret: twofactorSetup.object["shared-secret"] };
}) satisfies PageServerLoad;
