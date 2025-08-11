import type { Handle } from "@sveltejs/kit";
import AuthAPI from "node-aneauthapi";

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
    try {
      const accountInfo = await AuthAPI.getSignedAccount(authtoken);

      if (accountInfo) {
        event.locals.session = {
          accountInfo,
          sessionToken: authtoken,
        };
      }
    } catch (__) {}
  }
  return resolve(event);
};
