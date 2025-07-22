import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./backend"
import { DB_Errors, isUsernameValid } from "./backend"
import type { AccountInfo, BackendResponse, UserSessionInfo } from "./backend-types";

export namespace Backend {
    const BACKEND_URL = "http://localhost:4050";

    export async function getAccount(username?: string, accountId?: number) {
        if (!username && !accountId) {
            throw "Only one value allowed. BAD IMPLEMENTATION";
        }

        return await doAPIEndpoint<AccountInfo>("/get-account",
            username ? { username } : { id: accountId }
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
    async function doAPIEndpoint<T>(endpoint: string, payload: any) {
        try {
            const response = await fetch(BACKEND_URL + endpoint, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            if (response.status != 200) {
                console.error("API gave " + response.status + " which is unsupported. ");
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