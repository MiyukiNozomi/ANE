import { dev } from "$app/environment";
import type { AuthorizationRequest } from "$lib/ANEAuthAPI/apiTypes";

export let AuthorizationList: Record<
  string,
  AuthorizationRequest & {
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
        info.id,
        " ",
        dev ? info["sharedSecret"] : "<truncated (production build>",
      );
      delete AuthorizationList[key];
    }
  }
}, 400);
