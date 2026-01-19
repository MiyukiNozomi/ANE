import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { RepositoryInfo } from "./git";

export interface SearchResult {
  url: string;
  title: string;
  description: string;
}

// iirc i came up with this searching algorithm in my private Spotify clone.
// turns out it is kind of decent so, it should be good enough here.
function prepareQuery(searchQuery: string) {
  return searchQuery
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "");
}

export async function searchAnyOf(query: string) {
  const searchResults = new Array<SearchResult>();
  const repositories = RepositoryInfo.getLoadedRepositories();

  const userQuery = prepareQuery(query);

  for (let i = 0; i < repositories.length; i++) {
    const { repository, branches } = repositories[i];

    const author = (await getAccountByName(repository.authorUsername))?.data;
    const authorName = author?.displayName ?? author?.name ?? "Unknown Author";

    const thisURL = `/u/${repository.authorUsername}/projects/${repository.name}`;

    if (
      prepareQuery(repository.displayName ?? repository.name).includes(
        userQuery,
      ) ||
      prepareQuery(repository.name).includes(userQuery) ||
      prepareQuery(authorName).includes(userQuery) ||
      prepareQuery(repository.authorUsername).includes(userQuery)
    )
      searchResults.push({
        url: thisURL,
        title: `${repository.displayName ?? repository.name} - by ${authorName}`,
        description: repository.description,
      });

    const branchList = Object.values(branches);
    for (let d = 0; d < branchList.length; d++) {
      if (
        branchList[d].branchName == "master" ||
        branchList[d].branchName == "main"
      )
        continue;
      const branchName = prepareQuery(branchList[d].branchName);
      if (branchName.includes(userQuery)) {
        searchResults.push({
          url: thisURL + `?branch=${branchList[d].branchName}`,
          title: `Branch ${branchList[d].branchName} on ${repository.displayName ?? repository.name}`,
          description: repository.description,
        });
      }
    }
  }

  return searchResults;
}
