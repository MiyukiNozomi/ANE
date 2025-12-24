import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  return { isSignedIn: Boolean(locals.session) };
}) satisfies PageServerLoad;
