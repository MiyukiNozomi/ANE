import { dev } from "$app/environment";
import type AuthAPI from "node-aneauthapi";

export let AuthorizationList: Record<
  string,
  AuthAPI.AuthorizationRequest & {
    creationDate: number;
    urlToReturnTo: string;
  }
> = {};

const AUTHORIZATION_EXPIRITY = 2 * 60 * 1000; /* two minutes */

setInterval(() => {
  const keys = Object.keys(AuthorizationList);

  for (const key of keys) {
    const info = AuthorizationList[key];

    if (Date.now() - info.creationDate > AUTHORIZATION_EXPIRITY) {
      console.log(
        "Remove: ",
        info["request-code"],
        " ",
        dev ? info["sharedSecret"] : "<truncated (production build>"
      );
      delete AuthorizationList[key];
    }
  }
}, 400);
