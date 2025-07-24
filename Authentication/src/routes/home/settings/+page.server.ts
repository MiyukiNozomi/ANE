import { redirect, text } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Backend } from '$lib/server/backend-api';

export const load = (async ({ locals, request }) => {
    if (!locals.account)
        return redirect(302, "/sign?redir=" + encodeURI(request.url));
    const securityInfo = await Backend.getSecurityInfo(locals.sessionToken!);
    if (!securityInfo || securityInfo.error) {
        console.log(securityInfo?.error);
        return text("Error: miyuki.gov.nt returned an error or is unreachable. this is internal, there's nothing you can do besides report this to miyuki@ane.jp.net", {
            status: 500
        });
    }
    return { accountSecurityInfo: securityInfo.data! };
}) satisfies PageServerLoad;