import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import { json, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  let authtoken = null;
  let authorizationHeader = event.request.headers.get("authorization");
  if (authorizationHeader) {
    let tokens = authorizationHeader.split(" ");
    if (tokens[0] == "Bearer") authtoken = tokens[1];
  } else {
    authtoken = event.cookies.get("AuthToken");
  }

  if (authtoken) {
    const session = await db.sessions.ofId(authtoken);
    const account = session ? await db.accounts.ofId(session.userId) : null;

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
