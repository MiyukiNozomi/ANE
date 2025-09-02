import { error, type Handle } from "@sveltejs/kit";
import AuthAPI from "node-aneauthapi";

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
    try {
      const accountInfo = await AuthAPI.getSignedAccount(authtoken);

      if (accountInfo) {
        event.locals.session = {
          accountInfo,
          sessionToken: authtoken,
        };
      }
    } catch (err) {
      throw error(500, "Sorry! it appears AuthAPI is out of order.");
    }
  }
  return resolve(event);
};
