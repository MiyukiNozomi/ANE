import { db } from "$lib/server/db";
import { NEWEST_COMMITS } from "$lib/server/git/fs/loader";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  return {
    latestProjects: (
      await Promise.all(
        NEWEST_COMMITS.map(
          async (v) =>
            await db.repositories.whereFirst({
              authorUsername: v.project.authorUsername,
              name: v.project.name,
            }),
        ),
      )
    ).filter((v) => v != null),
    newestCommits: NEWEST_COMMITS,
  };
}) satisfies PageServerLoad;
