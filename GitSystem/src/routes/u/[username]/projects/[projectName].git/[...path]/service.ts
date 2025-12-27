import type { Project } from "$lib/server/db";
import { getPhysicalProjectLocation } from "$lib/server/git";
import { error } from "@sveltejs/kit";
import { spawn } from "child_process";
import { existsSync } from "fs";
import path, { join } from "path";
import { Readable } from "stream";
import { ReadableStream as NodeReadableStream } from "stream/web";
import type { RouteParams } from "./$types";
import bridge from "$lib/server/git/bridge";

export async function invokeGitCGIScript(
  params: RouteParams,
  request: Request,
  project: Project,
) {
  const physicalLocation = getPhysicalProjectLocation(project);
  if (!existsSync(physicalLocation)) return error(404);

  const url = new URL(request.url, "https://git.ane.jp.net");
  const env = {
    PATH_INFO: "/" + join(project.name, params.path),
    QUERY_STRING: url.searchParams.toString(),
    CONTENT_TYPE: request.headers.get("content-type") ?? undefined,
    REQUEST_METHOD: request.method,
    GIT_HTTP_EXPORT_ALL: "",
    GIT_PROJECT_ROOT: path.resolve(path.dirname(physicalLocation)),
  };
  console.log("env: ", env);
  const gitBackend = spawn(`${bridge.gitServices["git"]}`, ["http-backend"], {
    env,
  });
  gitBackend.stderr.on("data", (e) =>
    console.log(
      "[GitHttp] STDERR! ",
      e instanceof Buffer ? e.toString() : JSON.stringify(e),
    ),
  );
  gitBackend.on("exit", (code) => {
    console.log("[GitHttp] git http-backend exit with " + code);
  });

  if (request.body)
    Readable.fromWeb(request.body as NodeReadableStream<any>).pipe(
      gitBackend.stdin,
    );
  else gitBackend.stdin.end();

  return await stdoutAsResponse(gitBackend.stdout);
}

function stdoutAsResponse(stdout: NodeJS.ReadableStream): Promise<Response> {
  return new Promise<Response>((resolve) => {
    let isHeaderEnded = false;
    let headers: Record<string, string> = {};

    let dataBuffers = new Array<Buffer>();

    stdout.on("data", (data) => {
      if (isHeaderEnded) {
        dataBuffers.push(data);
        return;
      }

      const dataStr: string = data.toString("utf-8");
      const [backendHeaders, ...body] = dataStr.split("\r\n\r\n");

      backendHeaders.split("\r\n").forEach((line) => {
        const [key, value] = line.split(": ");
        headers[key] = value;
      });
      console.log(headers);
      if (body.length > 0) {
        isHeaderEnded = true;
        dataBuffers.push(Buffer.from(body.join("\r\n\r\n")));
      }
    });

    stdout.on("end", () => {
      resolve(new Response(Buffer.concat(dataBuffers), { headers }));
    });
  });
}
