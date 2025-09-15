import path from "path";
import { RepositoryInfo } from ".";
import { getPhysicalProjectLocation } from "..";
import { RepositoryBranch, type GitFile } from "./branch";
import type { Project } from "$lib/server/db";
import bridge from "../bridge";

const MAXIMUM_COMMIT_COUNT_TO_LOAD = 2048;
const COMMIT_INFO_MISSING = "[Missing or Failed to Load]";

/*** 
 *  This is a function that you're really not supposed to call yourself.
 * This function essentially loads the entire metadata of a Repository and all of its branches into memory.
 * 
 * 
 * It's like the Boeing 747:
 * - It was expensive to maintain;
 * - Expensive to purchase;
 * 
 * But:
 *  - It flew faster than any other plane
 *  - It was more comfortable than any other plane from its time
 *  - Was literally called "The Queen of the Skies"
 * 
 * 
 * This function is essentially the Boeing 747 of Anemachi Engineering.
 */
export async function loadRepository(project: Project) {
    console.log("LOAD ", project.authorUsername + "#" + project.name);

    const branchNames = await getBranchNamesOf(project);
    const repositoryInfo = new RepositoryInfo(project, {});

    for (const branchName of branchNames) {
        repositoryInfo.branches[branchName] = await loadBranch(repositoryInfo, branchName);
    }
    return repositoryInfo;
}

async function loadBranch(repository: RepositoryInfo, branchName: string) {
    let branch = new RepositoryBranch(repository, branchName, await getCommitCountOf(repository, branchName));

    await loadFileTree(repository, branch);
    await loadCommitList(repository, branch);

    return branch;
}

async function loadFileTree({ repository }: RepositoryInfo, branch: RepositoryBranch) {
    let startTime = Date.now();

    (
        await bridge.runImmediate(
            getPhysicalProjectLocation(repository),
            "ls-tree",
            "-l",
            "-r",
            "-t",
            branch.branchName
        )
    )
        .toString()
        .split("\n").forEach(v => {

            let tabIndex = v.indexOf('\t');
            let options = v.substring(0, tabIndex).split(" ").filter(v => v.trim());
            if (options.length == 0) return; // could be EOF though
            if (options.length < 3 || tabIndex == -1) throw new Error(`Git has given: ${JSON.stringify(options)} (bug)`);
            let filepath = v.substring(tabIndex + 1).trim();
            let parentDirectory = path.dirname(filepath);

            let currEntry: GitFile = {
                filename: path.basename(filepath),
                filepath,
                mode: options[0],
                isFile: options[1] == "blob",
                hash: options[2],
                size: Number(options[3]) || 0,
                children: []
            };


            let parentDirEntry = branch.filelistCache[parentDirectory];
            if (!parentDirEntry) {
                // for some reason this happened, it's highly unlikely but since it did:
                // we'll define a 'stub' entry here.
                // it wont show up properly unless we find it in the future.
                // it's fine if it stays in the cache but unreferenced from branch.filelistCache['.'] (root directory)
                parentDirEntry = (branch.filelistCache[parentDirectory] = {
                    children: [],
                    filename: "",
                    filepath: "",
                    hash: "",
                    isFile: false,
                    mode: "",
                    size: 0
                });
                // log this because it's an non-fatal error
                console.warn("WARNING WARNING file " + currEntry.filepath + " was inserted into a stub-definition (parent did not exist beforehand)");
            }

            parentDirEntry.children.push(currEntry);
            if (!currEntry.isFile) {
                // just in case of a stub..
                const existingEntry = branch.filelistCache[currEntry.filepath];
                if (existingEntry)
                    currEntry.children.push(...existingEntry.children);
                branch.filelistCache[filepath] = currEntry;
            }
        });


    // now we sort
    for (const filepath in branch.filelistCache) {
        const filelist = branch.filelistCache[filepath];
        filelist.children.sort((a, b) => {
            const fileTypeDiff = Number(a.isFile) - Number(b.isFile);
            if (fileTypeDiff !== 0) return fileTypeDiff;
            return a.filename.localeCompare(b.filename, 'en', { sensitivity: 'base' });
        });
    }

    console.log("Loaded filelist of", repository.authorUsername + "#" + repository.name, "in", (Date.now() - startTime) / 1000, "seconds.");
}

async function loadCommitList({ repository }: RepositoryInfo, branch: RepositoryBranch) {
    let startTime = Date.now();

    const physicalPath = getPhysicalProjectLocation(repository)
    const commitList = (await bridge.runImmediate(physicalPath,
        '--no-pager',
        'log',
        `--max-count=${MAXIMUM_COMMIT_COUNT_TO_LOAD}`,
        `--pretty=format:%H`)).toString().split('\n');

    for (const commitRef of commitList) {
        const placeholder = `CR\nLF\n`;
        const commitLog = (await bridge.runImmediate(physicalPath,
            `--no-pager`, `show`, commitRef, `--quiet`, `--pretty=format:Commit: %H%nAuthor: %an%nE-Mail: %ae%nAge: %ar%nDate: %ad%nCR%nLF%n%s%n`
        )).toString();

        let placeholderIndex = commitLog.indexOf(placeholder);
        let headers: Record<string, string> = {};
        commitLog.substring(0, placeholderIndex).split('\n').forEach(v => {
            let ii = v.indexOf(':');
            if (ii == -1) return;
            let key = v.substring(0, ii).trim();
            let value = v.substring(ii + 1).trim();
            headers[key] = value;
        });;

        let commitMessage = commitLog.substring(placeholderIndex + placeholder.length).trim();

        branch.commits.push({
            age: headers["Age"] ?? COMMIT_INFO_MISSING,
            author: headers["Author"] ?? COMMIT_INFO_MISSING,
            authorEmail: headers["E-Mail"] ?? COMMIT_INFO_MISSING,
            date: headers["Date"] ?? (new Date().toDateString()),
            hash: headers["Commit"] ?? commitLog,
            message: commitMessage.length == 0 ? "No commit message." : commitMessage
        });
    }

    console.log("Loaded commits of", repository.authorUsername + "#" + repository.name, "in", (Date.now() - startTime) / 1000, "seconds.");
}

async function getCommitCountOf({ repository }: RepositoryInfo, branchName: string) {
    return parseInt(
        (
            await bridge.runImmediate(
                getPhysicalProjectLocation(repository),
                `rev-list`,
                `--count`,
                branchName
            )
        ).toString()
    )
}

async function getBranchNamesOf(project: Project) {
    const gitCommitList = await bridge.runImmediate(
        getPhysicalProjectLocation(project),
        `--no-pager`,
        `branch`,
        `--format=%(refname:short)`
    );

    return gitCommitList
        .toString()
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
}