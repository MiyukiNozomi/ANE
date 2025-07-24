import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    return { isUserSessionValid: locals.account != null };
}) satisfies PageServerLoad;