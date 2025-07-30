import https from "https";


export namespace AuthAPI {
    export type AuthorizationRequest = {
        sharedSecret: string,
        realm: string,
        "request-code": string,
    };

    export type AuthorizationRequestStatus = {
        "reqCode": string,
        realm: string,
        createdAt: number,
        sessionStatus: 'AUTHORIZED' | 'AWAITING_AUTHORIZATION'
    };

    export type AccountInfo = {
        "id": number,
        "displayName": string,
        "name": string,
        "createdAt": number
    }

    function invokeAuthAPI<T>(endpoint: string, payload: any, authtoken?: string) {
        return new Promise<T & { error?: any }>((resolve, reject) => {
            let headers = {};
            if (payload) headers["content-type"] = "application/json";
            if (authtoken) headers["authorization"] = "Bearer " + authtoken;

            const req = https.request({
                hostname: "auth.ane.jp.net",
                path: `/api/${endpoint}`,
                headers,
                method: "POST"
            }, (res) => {
                let data = new Array<Buffer>();

                res.on("data", (chunk) => {
                    data.push(chunk);
                });

                res.on("end", () => {
                    if (res.statusCode != 200)
                        reject(new Error("Got a Non-200 status code: " + res.statusCode));
                    else
                        resolve(JSON.parse(Buffer.concat(data).toString()) as T & { error?: any });
                });
            });

            if (payload)
                req.write(JSON.stringify(payload));

            req.end();
        });
    }

    export async function createAuthorizationRequest(realm: string) {
        const sharedSecret = crypto.randomUUID();

        const res = await invokeAuthAPI<{ "request-code": string }>("authorizations/new", {
            sharedSecret, realm
        });

        if (res.error)
            throw res.error;

        return {
            sharedSecret,
            realm,
            "request-code": res["request-code"]
        } satisfies AuthorizationRequest;
    }

    export async function getAuthorizationRequest(sharedSecret: string): Promise<AuthorizationRequestStatus> {
        const res = await invokeAuthAPI<AuthorizationRequestStatus>("authorizations/get-status", {
            sharedSecret
        });

        if (res.error)
            throw res.error;
        return res;
    }

    export async function getSignedAccount(authToken: string) {
        const res = await invokeAuthAPI<AccountInfo>("signed/me", undefined, authToken);
        if (res.error)
            throw res.error;
        return res;
    }

    export async function eraseSession(authToken: string) {
        const res = await invokeAuthAPI<any>("signed/session/delete-self", undefined, authToken);
        if (res.error)
            throw res.error;
        return res;
    }
}