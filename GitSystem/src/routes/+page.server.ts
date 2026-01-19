import { db } from "$lib/server/db";
import { RepositoryInfo } from "$lib/server/git";
import { NEWEST_COMMITS } from "$lib/server/git/fs/loader";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  await RepositoryInfo.revalidate();

  const sortedCommits = NEWEST_COMMITS.sort((a, b) => b.rawDate - a.rawDate);

  return {
    latestProjects: (
      await Promise.all(
        sortedCommits.map(
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
    newestCommits: sortedCommits,
  };
}) satisfies PageServerLoad;
