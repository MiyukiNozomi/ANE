import { db } from "$lib/server/db";
import { RepositoryInfo } from "$lib/server/git";
import { NEWEST_COMMITS } from "$lib/server/git/fs/loader";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  await RepositoryInfo.revalidate();

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
    )
      .filter((v) => v != null)
      .filter((v, i, arr) => arr.indexOf(v) == i),
    newestCommits: NEWEST_COMMITS,
  };
}) satisfies PageServerLoad;
