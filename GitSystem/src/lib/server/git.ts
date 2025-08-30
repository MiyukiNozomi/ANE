import type { AccountInfo } from "node-aneauthapi";
import path from "path";
import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import { existsSync, mkdirSync } from "fs";
import { execFile, execFileSync, execSync } from "child_process";
import { dev } from "$app/environment";

type Repository = {
  displayName: null | string;
  name: string;
  description: string;

  authorUsername: string;

  /** unix time */
  createdAt: number;
};

class GitBridge {
  private readonly gitExecutable: string;

  constructor() {
    this.gitExecutable = execSync("which git").toString().trim();
    if (dev) console.log("Git executable is: " + this.gitExecutable);
  }

  public async createNewRepository(
    author: AccountInfo,
    name: string,
    description: string
  ): Promise<string | undefined> {
    if (!author.isAdmin)
      throw new Error("Author is not an admin! this is a bug!");

    if (!this.isRepositoryNameValid(name)) {
      return "Invalid repository name.";
    }

    const outputPath = path.join(GIT_USER_HOME_FOLDER, author.name, name);

    if (existsSync(outputPath)) return "This repository already exists.";

    mkdirSync(outputPath, {
      recursive: true,
    });

    this.runGit(outputPath, "init", "--bare");
  }

  private async runGit(
    executionDirectory: string,
    ...params: Array<any>
  ): Promise<string> {
    return new Promise((resolve) => {
      execFile(
        this.gitExecutable,
        params,
        {
          cwd: executionDirectory,
          timeout: 5000,
        },
        (error, stdout, stderr) => {
          if (error || stderr.length > 0) {
            console.error(
              "Git has failed, parameters: ",
              params,
              " stderr: " + stderr
            );
            throw error ?? new Error("Git's std error has content");
          }
          resolve(stdout);
        }
      );
    });
  }

  private isRepositoryNameValid(username: string): boolean {
    const usernameRegex = /^[A-Za-z0-9_]+$/;
    return usernameRegex.test(username);
  }
}

const git = new GitBridge();
export default git;
