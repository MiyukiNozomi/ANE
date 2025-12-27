import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";
import { existsSync } from "fs";
import { PassThrough, Readable } from "stream";
import type { Project } from "../db";
import bridge, { GitServiceNames, type GitService } from "./bridge";
import { getPhysicalProjectLocation } from ".";
import { spawn } from "child_process";

/***
 * This function provides an actual implementation of git-on-the-server through HTTP.
 * This is really annoying and, honestly, from my perspective really poorly documented.
 * So I wrote extra comments to make it clear what the hell is going on here.
 *
 * Basically, it's the same deal as git over ssh, the difference is that the client's git is
 * going to be trying to invoke the same git commands as it would over ssh.
 *
 * But because git also supports downloading from static servers that do not allow for POSTs.. i didn't code that, too risky.
 * BUT! if you do want the dumb protocol, just let git download files like a normal http server would let it.
 */
export async function handleGitRequest(
  method: "get" | "post",
  project: Project,
  request: Request,
  url: URL,
  pathname: string,
) {
  const projectPath = getPhysicalProjectLocation(project);
  if (!existsSync(projectPath))
    return error(404, "Repository does not exist physically.");

  const serviceName =
    (url.searchParams.get("service") as GitService) ??
    pathname.substring(pathname.lastIndexOf("/") + 1);

  if (!GitServiceNames.includes(serviceName)) {
    return error(400, "Sorry, dumb http was not implemented.");
  }
  if (dev) {
    console.log("Requested service is " + serviceName);
  }

  let isInfoRefs = pathname.endsWith("info/refs");

  let parameters = new Array<string>();

  // According to git's HTTP docs, it tries to check if it's either a smart or dumb Http server
  // the way it does this is by requesting like this: /info/refs?service=git-upload-pack
  // since we're a smart http server, we also need to tell git-upload-pack (the requested service) to advertise refs.
  if (isInfoRefs) parameters.push("--advertise-refs");

  // this parameter is pretty much mandatory, as we're doing git over HTTP(s).
  parameters.push("--stateless-rpc");

  // e.g, current directory
  parameters.push("./");

  const gitProcess = spawn(bridge.gitServices[serviceName], parameters, {
    cwd: projectPath,
    timeout: 5000,
    shell: false,
    stdio: ["pipe", "pipe", "pipe"],
  });

  console.log(method);
  if (method == "post") {
    const nodeReadable = Readable.fromWeb(request.body as any);
    nodeReadable.pipe(gitProcess.stdin);
  }
  let errors = "";
  gitProcess.stderr.on("data", (d) => (errors += d));
  gitProcess.on("error", (d) => {
    throw new Error(JSON.stringify(d));
  });
  gitProcess.on("close", (code) => {
    if (errors.length > 0 && code != 0 && code != null)
      throw new Error(
        `Error! ${serviceName} has said on its stderr: ${errors}`,
      );
    if (code != 0 && code != null) {
      throw new Error(`Error! ${serviceName} has returned exit code: ${code}`);
    } else if (dev) {
      console.log("Exit-Code: 0!!!!");
    }
  });

  let responseWithHeader: PassThrough | undefined = undefined;
  if (pathname == "info/refs") {
    // This is so that git will understand that yes, this is in fact a 'smart' http server, aka a git-aware server.
    const serviceLine = `# service=${serviceName}\n`;
    const serviceLen = (serviceLine.length + 4).toString(16).padStart(4, "0");
    const headerStream = Readable.from(
      [`${serviceLen}${serviceLine}`, "0000"].map((str) => Buffer.from(str)),
    );
    responseWithHeader = new PassThrough();
    headerStream.pipe(responseWithHeader, { end: false });
    headerStream.on("end", () =>
      gitProcess.stdin.pipe(responseWithHeader as PassThrough),
    );
  }

  let headers: Record<string, string> = {
    "Content-Type":
      "application/x-" +
      serviceName +
      "-" +
      (isInfoRefs ? "advertisement" : "result"),
  };

  headers["Cache-Control"] = "no-cache, max-age=0, must-revalidate";
  headers["Pragma"] = "no-cache";
  headers["Expires"] = "Fri, 01 Jan 1980 00:00:00 GMT";
  headers["Connection"] = "keep-alive";
  headers["Keep-Alive"] = "timeout=600"; // 10 minutes, adjust as needed
  headers["X-Accel-Buffering"] = "no"; // Important if behind nginx/proxy

  // now we just inform what the content is and we're done!
  return new Response(
    Readable.toWeb(responseWithHeader ?? gitProcess.stdout) as ReadableStream,
    {
      status: 200,
      headers,
    },
  );
}
