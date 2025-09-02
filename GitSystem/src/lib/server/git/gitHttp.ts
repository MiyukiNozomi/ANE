import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";
import { existsSync } from "fs";
import Git from ".";
import type { Project } from "../db";
import { GitServiceNames, type GitService } from "./bridge";
import { PassThrough, Readable } from "stream";
import { pipe } from "zod";

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
  pathname: string
) {
  const projectPath = Git.getPhysicalProjectLocation(project);
  if (!existsSync(projectPath))
    return error(404, "Repository does not exist physically.");

  const serviceName =
    (url.searchParams.get("service") as GitService) ?? pathname;

  if (!GitServiceNames.includes(serviceName)) {
    return error(400, "Sorry, dumb http was not implemented.");
  }
  if (dev) {
    console.log("Requested service is " + serviceName);
  }

  let parameters = new Array<string>();

  if (pathname == "info/refs") parameters.push("--advertise-refs");

  if (serviceName == "git-upload-pack") {
    // According to git's HTTP docs, it tries to check if it's either a smart or dumb Http server
    // the way it does this is by requesting like this: /info/refs?service=git-upload-pack
    // since we're a smart http server, we also need to tell git-upload-pack (the requested service) to advertise refs.
    // this parameter is pure fucking paranoia, you don't have to pass it.
    parameters.push("--strict");
  }
  // this parameter is pretty much mandatory, as we're doing git over HTTP(s).
  parameters.push("--stateless-rpc");

  // e.g, current directory
  parameters.push("./");

  let gitResponseStream = await Git.bridge.runWithPayload(
    serviceName,
    projectPath,
    method == "post" ? request.body : undefined,
    ...parameters
  );

  let responseWithHeader: PassThrough | undefined;
  if (pathname == "info/refs") {
    // This is so that git will understand that yes, this is in fact a 'smart' http server, aka a git-aware server.
    const headBuffer = Buffer.from("# service=" + serviceName + "\n");
    const head = (headBuffer.byteLength + 4).toString(16).padStart(4, "0");

    const headerStream = Readable.from([
      Buffer.concat([
        Buffer.from(head, "utf-8"),
        headBuffer,
        Buffer.from("0000", "utf-8"),
      ]),
    ]);
    responseWithHeader = new PassThrough();
    headerStream.pipe(responseWithHeader, { end: false });
    headerStream.on("end", () =>
      gitResponseStream.pipe(responseWithHeader as PassThrough)
    );
  }

  // now we just inform what the content is and we're done!
  return new Response(
    Readable.toWeb(responseWithHeader ?? gitResponseStream) as ReadableStream,
    {
      status: 200,
      headers: {
        "Content-Type":
          "application/x-" +
          serviceName +
          "-" +
          (pathname == "info/refs" ? "advertisement" : "result"),
      },
    }
  );
}
