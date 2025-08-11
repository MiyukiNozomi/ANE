import type { PageServerLoad } from "./$types";

export const load = (async ({locals}) => {
  if (!locals.session)
    
  return {};
}) satisfies PageServerLoad;
