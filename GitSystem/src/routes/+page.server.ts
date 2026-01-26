import { db } from "$lib/server/db";
import { RepositoryInfo } from "$lib/server/git";
import { NEWEST_COMMITS } from "$lib/server/git/fs/loader";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  await RepositoryInfo.revalidate();

  const sortedCommits = NEWEST_COMMITS.sort((a, b) => b.rawDate - a.rawDate);
  let existingElements = new Array<number>();
  const latestProjects = (
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
      .filter((v) => v != null);



  return {
    latestProjects: latestProjects.filter((v) => {
      if (existingElements.includes(v.id))
          return false;
      existingElements.push(v.id);
      return true;
    }),
    newestCommits: sortedCommits,
  };
}) satisfies PageServerLoad;
