import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Backend } from '$lib/server/backend-api';

export const load = (async ({ locals, params, request }) => {
    let id = 0;
    id = parseInt(params.id);
    if (isNaN(id)) error(400);

    const account = await Backend.getAccount(undefined, id);
    if (!account || account.error)
        return error(404);

    return { homeAccountInfo: account.data! };
}) satisfies PageServerLoad;