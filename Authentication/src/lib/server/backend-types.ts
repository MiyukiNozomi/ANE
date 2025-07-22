import type { DB_Errors } from "./backend"

export type BackendResponse<T> = {
    error?: DB_Errors
    data?: T,
}

export type UserSessionInfo = {
    ID: number,
    username: string,
    sessionToken: string
}

export type AccountInfo = {
    id: number,
    displayName: string,
    name: string,
    createdAt: number
}