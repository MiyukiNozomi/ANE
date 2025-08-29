import { Backend } from "$lib/server/backend-api";
import type { RequestHandler } from "./$types";
import path from "path";
import { AUTH_DATA_FOLDER } from "$env/static/private";
import { existsSync, readFileSync } from "fs";
import { error, redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const account = await Backend.getAccount(params.username);
  if (!account || account.error) return error(404);

  const outPath = path.join(AUTH_DATA_FOLDER, account.data!.name + ".webp");

  if (outPath.includes("..") || outPath.includes("%00")) return error(401); // Sorry.. i get way too paranoid and i can't actually let this possibility slide through, even if i don't allow '.'s in usernames.

  if (existsSync(outPath)) {
    const headers: HeadersInit = {};
    headers["content-type"] = "image/webp";
    headers["cache-control"] = "max-age=360";
    return new Response(readFileSync(outPath), { status: 200, headers });
  }

  return redirect(
    307,
    "https://galatea.ane.jp.net/dl/images/default-profile.webp"
  );
};
