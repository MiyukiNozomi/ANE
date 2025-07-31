import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./backend"
import { DB_Errors, isUsernameValid } from "./backend"
import type { AccountSecurityInfo, AccountInfo, BackendResponse, UserSessionInfo, TwoFactorStep1Start, TwoFactorStepFinish, AuthorizationStatus, GetSessionsInfo, APITokenInfo, SessionInfo } from "./backend-types";

export namespace Backend {
    const BACKEND_URL = "http://localhost:4050";

    export async function isAlive() {
        try {
            const checkRes = await fetch("http://localhost:4050/is-alive", { method: "get" });
            if (checkRes.status != 200)
                return false;
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     *  Public API endpoints
     */

    export async function getAccount(username?: string, accountId?: number) {
        if (!username && !accountId) {
            throw "Only one value allowed. BAD IMPLEMENTATION";
        }

        return await doAPIEndpoint<AccountInfo>("/get-account",
            username ? { username } : { id: accountId }
        );
    }

    export async function newAuthorizationRequest(sharedSecret: string, realm: string) {
        return await doAPIEndpoint<{ "request-code": string }>("/authorizations/new", {
            "shared-secret": sharedSecret,
            realm
        });
    }

    export async function getAuthorizationStatus(secret?: string, authRequestCode?: string) {
        if (!secret && !authRequestCode) {
            throw "Only one value allowed. BAD IMPLEMENTATION";
        }

        return await doAPIEndpoint<AuthorizationStatus>("/authorizations/get-status",
            secret ? { "shared-secret": secret } : { "request-code": authRequestCode }
        );
    }
    /**
          Entrance Endpoints
      */
    export async function register(username: string, password: string) {
        if (!isUsernameValid(username) || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
            return null;
        }
        return await doAPIEndpoint<UserSessionInfo>("/register", { username, password });
    }

    export async function login(username: string, password: string, twoFactorCode?: string) {
        if (!isUsernameValid(username) || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
            return null;
        }
        return await doAPIEndpoint<UserSessionInfo>("/login",
            twoFactorCode ? { username, password, "twofactor-code": twoFactorCode } :
                { username, password });
    }
    /**
       Logged in endpoints
   */
    export async function twoFactorEnableStep1(authToken: string) {
        return await doAPIEndpoint<TwoFactorStep1Start>("/signed/2fa-enable/step1", undefined, authToken);
    }

    export async function twoFactorEnableFinalStep(twofactorCode: string, authToken: string) {
        return await doAPIEndpoint<TwoFactorStepFinish>("/signed/2fa-enable/setup", { "twofactor-code": twofactorCode }, authToken);
    }

    export async function disable2FASupport(recoveryKey: string, authToken: string) {
        return await doAPIEndpoint<unknown>("/signed/2fa-disable", { "recovery-key": recoveryKey }, authToken);
    }

    export async function createAPIToken(tokenName: string, authToken: string) {
        return await doAPIEndpoint<SessionInfo>("/signed/create-api-token", { name: tokenName }, authToken);
    }

    export async function getSecurityInfo(authToken: string) {
        return await doAPIEndpoint<AccountSecurityInfo>("/signed/get-security-info", undefined, authToken);
    }

    export async function setDisplayName(displayname: string, authToken: string) {
        return await doAPIEndpoint<any>("/signed/set-display-name", { displayname }, authToken);
    }

    /**
      Account session management
     */
    export async function getSessions(authToken: string) {
        return await doAPIEndpoint<GetSessionsInfo>("/signed/get-sessions", undefined, authToken);
    }

    export async function deleteSingleSession(authToken: string) {
        return await doAPIEndpoint<any>("/signed/delete-single-session", undefined, authToken);
    }

    export async function deleteAllSessions(authToken: string) {
        return await doAPIEndpoint<any>("/signed/delete-sessions", undefined, authToken);
    }

    export async function authorize(authRequestCode: string, authToken: string) {
        return await doAPIEndpoint<any>("/signed/authorize", { "request-code": authRequestCode }, authToken);
    }

    export async function getSessionAccount(authToken: string) {
        return await doAPIEndpoint<AccountInfo>("/signed/me", undefined, authToken);
    }

    async function doAPIEndpoint<T>(endpoint: string, payload: any, authToken?: string): Promise<BackendResponse<T> | null> {
        try {
            const response = await fetch(BACKEND_URL + endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
                credentials: "include",
                headers: authToken ? {
                    "Authorization": "Bearer " + authToken,
                    "Content-Type": "application/json"
                } : {}
            });
            if (response.status != 200) {
                console.error("API gave " + response.status + " which is unsupported. ");
                console.log("Message: " + await response.text());
                return null;
            }
            const jsonData = await response.json();
            if (jsonData.error) {
                return {
                    error: jsonData.error
                } satisfies BackendResponse<T>;
            }
            return {
                data: jsonData
            } satisfies BackendResponse<T>;
        } catch (e) {
            console.error("Error contacting when API: ", e);
            return null;
        }
    }
}