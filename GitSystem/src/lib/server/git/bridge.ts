import type { AccountInfo } from "node-aneauthapi";
import path from "path";
import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import { existsSync, mkdirSync } from "fs";
import { execFile, execFileSync, execSync, spawn } from "child_process";
import { dev } from "$app/environment";
import {
  GIT_OBJECT_NAME_MAX,
  GIT_OBJECT_NAME_MIN,
} from "$lib/shared/constants";

class GitBridge {
  private readonly gitExecutable: string;

  constructor() {
    this.gitExecutable = execSync("which git").toString().trim();
    if (dev) console.log("Git executable is: " + this.gitExecutable);
  }

  public async run(executionDirectory: string, ...params: Array<any>) {
    this.runWithPayload(executionDirectory, ...params);
  }

  public async runWithPayload(
    executionDirectory: string,
    ...params: Array<any>
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      const gitProcess = spawn(this.gitExecutable, params, {
        cwd: executionDirectory,
        timeout: 5000,
        shell: false,
      });

      let buffers = new Array<Buffer>();
      let errors = "";

      gitProcess.stdout.on("data", (data) => buffers.push(data));
      gitProcess.stderr.on("data", (d) => (errors += d));

      gitProcess.on("close", (code) => {});
    });
  }

  /***
   * Validates if either a repository name, object or branch name is valid.
   * This is mostly for sanitizing purposes in GitBridge#runGit.
   */
  public isNameValid(name: string): boolean {
    if (name.length < GIT_OBJECT_NAME_MIN || name.length > GIT_OBJECT_NAME_MAX)
      return false;
    const regex = /^[A-Za-z0-9_-]+$/;
    return regex.test(name);
  }
}

const bridge = new GitBridge();
export default bridge;
