import { Backend } from "$lib/server/backend-api";
import { json, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    if (!(await Backend.isAlive())) {
        return new Response(JSON.stringify({ error: true, message: "miyuki.nt Is unrecheable, contact Miyuki at miyuki@ane.jp.net if you're reading this." }), {
            status: 503,
            headers: {
                "content-type": "application/json"
            }
        });
    }

    let authtoken = null;
    let authorizationHeader = event.request.headers.get("authorization");
    if (authorizationHeader) {
        let tokens = authorizationHeader.split(" ");
        if (tokens[0] == "Bearer")
            authtoken = tokens[1];
    } else {
        authtoken = event.cookies.get("AuthToken");
    }

    if (authtoken) {
        const accountInfo = await Backend.getSessionAccount(authtoken);
        if (accountInfo?.data && !accountInfo.error) {
            // if authtoken is valid...
            event.locals.sessionToken = authtoken;
            event.locals.account = accountInfo.data;
        }
    }
    return resolve(event);
}