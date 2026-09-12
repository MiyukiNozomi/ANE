import { dev } from "$app/environment";
import { db, hashSession } from "$lib/server/db";
import { type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  let authtoken = null;
  let authorizationHeader = event.request.headers.get("authorization");
  if (authorizationHeader) {
    let tokens = authorizationHeader.split(" ");
    if (tokens[0] == "Bearer") authtoken = tokens[1];
    else if (tokens[0] == "Basic") {
      const pairs = Buffer.from(tokens[1], "base64").toString().split(":");
      // there's no point in validating the username, really.
      authtoken = pairs[1];
    }
  } else {
    authtoken = event.cookies.get("AuthToken");
  }

  if (authtoken) {
    const session = await db.sessions.whereFirst({
      id: hashSession(authtoken),
    });
    const account = session
      ? await db.accounts.whereFirst({ id: session.userId })
      : null;

    if (session && account) {
      event.locals.session = {
        account,
        session,
      };
    }
  }

  if (dev) console.log(authtoken, event.locals.session);
  return resolve(event);
};
