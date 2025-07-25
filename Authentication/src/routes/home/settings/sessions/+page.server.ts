import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Backend } from '$lib/server/backend-api';
import { text } from '@sveltejs/kit';

export const load = (async ({ locals, request }) => {
    if (!locals.account)
        return redirect(302, "/sign?redir=" + encodeURI(request.url));



    return {};
}) satisfies PageServerLoad;