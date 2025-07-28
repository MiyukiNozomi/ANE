module ane.http.endpoints.signedin;

import std.json;
import std.stdio;

import ane.db;
import ane.auth.account;
import ane.auth.session;
import ane.auth.authorizations;

import ane.http.params;
import ane.http.message;

import ane.security.totp;

/**
    Account settings endpoints
*/

string[int] temporaryAccountSecrets;

void enable2FAEndpoint(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    if (account.has2FA())
        throw new HttpException(400, "すでに二要素認証が有効になっています 「2FA Already Enabled」");

    const secret = genTOTPSecret();
    temporaryAccountSecrets[account.ID] = secret;

    response.jsonMessage(["shared-secret": secret]);

    writeln("[2FA] Setup initiated for ", account.Name);
}

void verifyAndSetup2FAEndpoint(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    string* secretOrNull = account.ID in temporaryAccountSecrets;
    if (secretOrNull is null)
    {
        /** Side note, this might not exactly be the greatest of ideas, but it's fine.*/
        throw new HttpException(412, "二要素認証のステップ1が欠落しています 「2FA Step-1 Missing」");
    }

    string inputPassword;

    validateParameters(message, (json) {
        inputPassword = json.getStringSafe("twofactor-code");
    });

    const secret = *secretOrNull;

    if (getTOTPToken(secret) != inputPassword)
    {
        writeln("[2FA] Setup code failed for ", account.Name);
        response.databaseError(DB_Errors.INCORRECT_TWO_FACTOR);
        return;
    }

    writeln("[2FA] Setup code successful for ", account.Name);
    const recoveryKey = account.newTotpSecret(secret);
    return response.jsonMessage(["recovery-key": recoveryKey]);
}

void disable2FAEndpoint(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    if (!account.has2FA())
        throw new HttpException(400, "二要素認証が有効ではありません 「2FA not Enabled」");

    string recoveryCode;

    validateParameters(message, (json) {
        recoveryCode = json.getStringSafe("recovery-key");
    });

    if (account.verifyRecoveryKey(recoveryCode))
    {
        account.removeTotp(recoveryCode);
        return response.jsonOK();
    }
    response.databaseError(DB_Errors.INCORRECT_BACKUP_CODE);
}

void getAccountSecurityInfoEndpoint(
    Account account,
    Database db,
    HttpServerResponse response,
    HttpIncomingMessage message)
{
    JSONValue info = [
        "has2FA": account.has2FA()
    ];
    response.jsonMessage(info);
}

void displayNameSetterEndpoint(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    string displayName;

    validateParameters(message, (json) { displayName = json.getDisplaynameSafe(); });

    account.setDisplayName(displayName);
    response.jsonOK();
}

/**
    Account session management
*/
void accountSessionsEndpoint(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    auto sessions = getAccountSessions(account);
    JSONValue json;
    json["sessions"] = sessions;
    return response.jsonMessage(json);
}

void clearAccountSessionsEndpoint(
    Account account,
    Database db,
    HttpServerResponse response,
    HttpIncomingMessage message)
{
    deleteAccountSessions(account);
    return response.jsonOK();
}

void currentAccountInfo(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    return response.jsonMessage(account.asJSONData());
}

void giveAuthorizationEndpoint(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    string authReqCode;

    validateParameters(message, (json) {
        authReqCode = json.getStringSafe("request-code");
    });

    ThirdPartySessionRequest req = getAuthorizationRequestByCode(db, authReqCode);
    authorizeRequest(db, account, req);
    response.jsonOK();
}
