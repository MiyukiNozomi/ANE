import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    if (!locals.account)
        return redirect(302, "/sign?redir=/home/settings");
    return redirect(302, "/home/settings");
}) satisfies PageServerLoad;