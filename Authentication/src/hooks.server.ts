import { json, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    try {
        const checkRes = await fetch("http://localhost:4050/is-alive", { method: "get" });
        if (checkRes.status != 200)
            throw "BAD!";
    } catch (e) {
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
        authtoken = event.cookies.get("sessionToken");
    }

    if (authtoken) {

    }
    return resolve(event);
}