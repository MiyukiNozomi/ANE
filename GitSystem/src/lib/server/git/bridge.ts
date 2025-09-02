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

export const GitServiceNames = [
  "git",
  "git-upload-pack",
  "git-receive-pack",
] as const;
export type GitService = (typeof GitServiceNames)[number];

class GitBridge {
  private readonly gitServices: Record<GitService, string>;

  constructor() {
    // just so ts shuts up
    this.gitServices = {} as Record<GitService, string>;
    GitServiceNames.forEach((srv) => {
      this.gitServices[srv] = execSync("which " + srv)
        .toString()
        .trim();
    });

    if (dev) console.log("Found Git Services: ", this.gitServices);
  }

  /** Use this for generic git commands */
  public async run(executionDirectory: string, ...params: Array<any>) {
    return this.runWithPayload("git", executionDirectory, undefined, ...params);
  }

  public async runWithPayload(
    service: GitService,
    executionDirectory: string,
    payload?: Buffer,
    ...params: Array<any>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      console.log(
        "RUN ",
        this.gitServices[service],
        params,
        " on ",
        executionDirectory
      );

      const gitProcess = spawn(this.gitServices[service], params, {
        cwd: executionDirectory,
        timeout: 5000,
        shell: false,
      });

      let buffers = new Array<Buffer>();
      let errors = "";

      gitProcess.stdout.on("data", (data) => buffers.push(data));
      gitProcess.stderr.on("data", (d) => (errors += d));

      gitProcess.on("close", (code) => {
        if (errors.length > 0)
          reject(
            new Error(`Error! ${service} has said on its stderr: ${errors}`)
          );
        if (code === 0) {
          return resolve(Buffer.concat(buffers));
        } else {
          reject(
            new Error(`Error! ${service} has returned exit code: ${code}`)
          );
        }
      });

      if (payload) {
        const chunkSize = 64 * 1024;
        let offset = 0;
        while (offset < payload.length) {
          const chunk = payload.subarray(offset, offset + chunkSize);
          gitProcess.stdin.write(chunk);
          offset += chunkSize;
        }
        gitProcess.stdin.end();
      }
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
