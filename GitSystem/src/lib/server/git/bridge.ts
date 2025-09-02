import { dev } from "$app/environment";
import {
  GIT_OBJECT_NAME_MAX,
  GIT_OBJECT_NAME_MIN,
} from "$lib/shared/constants";
import { execSync, spawn } from "child_process";
import { Readable } from "stream";

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
    //... why are undefined and null different things...?
    // undefined doesn't even mean not set, it just means "uninitialized", back in my day we called that a `null`.
    payloadStream?: ReadableStream | null,
    ...params: Array<any>
  ): Promise<Readable> {
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
        stdio: ["pipe", "pipe", "pipe"],
      });

      let errors = "";
      gitProcess.stderr.on("data", (d) => (errors += d));

      gitProcess.on("close", (code) => {
        if (errors.length > 0)
          throw new Error(
            `Error! ${service} has said on its stderr: ${errors}`
          );
        if (code != 0) {
          throw new Error(`Error! ${service} has returned exit code: ${code}`);
        } else if (dev) {
          console.log("Exit-Code: 0!!!!");
        }
      });

      // okay.. this is.. better i think?
      if (payloadStream) {
        const nodeReadable = Readable.fromWeb(payloadStream as any);
        nodeReadable.pipe(gitProcess.stdin);

        nodeReadable.on("end", () => {
          resolve(gitProcess.stdout);
        });
      } else {
        resolve(gitProcess.stdout);
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
