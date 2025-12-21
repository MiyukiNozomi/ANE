import { Backend } from "$lib/server/services";
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
    const accountInfo = await Backend.getSessionAccount(authtoken);
    if (accountInfo) {
      if ("object" in accountInfo) {
        // if authtoken is valid...
        event.locals.sessionToken = authtoken;
        event.locals.account = accountInfo.object;
      }
    }
  }
  return resolve(event);
};
