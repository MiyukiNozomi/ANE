import { Backend } from '$lib/server/backend-api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, request, params }) => {
    const accountInfo = await Backend.getAccount(params.username);
    if (!accountInfo || accountInfo.error)
        return error(404);
    return redirect(302, `/home/uid/${accountInfo.data?.id}`);
}) satisfies PageServerLoad;