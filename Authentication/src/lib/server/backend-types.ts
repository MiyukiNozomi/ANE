import type { DB_Errors } from "./backend"

export type BackendResponse<T> = {
    error?: DB_Errors
    data?: T,
}

export type UserSessionInfo = {
    ID: number,
    username: string,
    sessionToken: string,

    accountInfo: AccountInfo,
}

export type AccountInfo = {
    id: number,
    displayName: string,
    name: string,
    createdAt: number
}

export type AccountSecurityInfo = {
    has2FA: boolean
}

export type TwoFactorStep1Start = {
    "shared-secret": string
}

export type TwoFactorStepFinish = {
    "recovery-key": string
}

export type SessionInfo = {
    ID: string,
    createdAt: number,
    isThirdParty: boolean,
    realmName: string
}

export type GetSessionsInfo = {
    sessions: SessionInfo[]
}

export type AuthorizationStatus = {
    "reqCode": string,
    "realm": string,
    createdAt: number,
    session: string,
    sessionStatus: string
}