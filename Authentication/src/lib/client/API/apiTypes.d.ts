export type ServerErrors =
  | "ERR_ACCOUNT_DOES_NOT_EXIST"
  | "ERR_ACCOUNT_INCORRECT_PASSWORD"
  | "ERR_ACCOUNT_TWOFACTOR_REQUIRED"
  | "ERR_ACCOUNT_INCORRECT_TWOFACTOR"
  | "ERR_ACCOUNT_EXISTS"
  | "ERR_BAD_PROFILE_PICTURE_FORMAT"
  | "ERR_THIRD_PARTY_REQUEST_ALREADY_AUTHORIZED"
  | "ERR_THIRD_PARTY_REQUEST_MISSING_OR_DENIED";

export interface APIResponse<T> {
  error?: ServerErrors;
  data?: T;
}
export type APIError = APIResponse<undefined>;
export type APIOk = APIResponse<any>;

export interface ClientSideAccount {
  id: number;
  displayName: string | null;
  name: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface ClientSessionInfo {
  id: string;
  userId: number;
}

export interface AccountSession {
  accountInfo: ClientSideAccount;
  sessionInfo: ClientSessionInfo;
}

export interface AuthorizationRequest {
  id: string;
  sharedSecret: string;

  authorizationURL: string;
}

export type AuthorizationRequestStatusString = "AWAITING" | "AUTHORIZED";
export interface AuthorizationRequestStatus {
  status: AuthorizationRequestStatusString;
  /*** only present if requested by sharedSecret */
  session: {
    id: string;
    userId: number;
    expiresIn: number;
    isThirdPartySession: boolean;
    createdAt: number;
  }?;
}
