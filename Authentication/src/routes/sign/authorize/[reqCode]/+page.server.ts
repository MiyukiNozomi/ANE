import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Backend } from '$lib/server/backend-api';
import { dev } from '$app/environment';
import { redirectToLoginPage } from '$lib/server/tools';

export const load = (async ({ locals, request, params }) => {
    if (!locals.account) {
        return redirectToLoginPage(request.url);
    }

    const reqInfo = await Backend.getAuthorizationStatus(undefined, params.reqCode);
    if (dev) {
        console.log(reqInfo);
    }

    if (!reqInfo || reqInfo.error) {
        return {
        };
    }

    return {
        reqInfo: {
            realm: reqInfo.data!.realm,
            reqCode: reqInfo.data?.reqCode,
            status: reqInfo.data?.sessionStatus
        }
    };
}) satisfies PageServerLoad;