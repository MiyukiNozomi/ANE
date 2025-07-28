module ane.http.endpoints.generic;

import std.json;
import std.stdio;

import ane.db;
import ane.auth.account;
import ane.auth.session;

import ane.http.params;
import ane.http.message;

/**
    Generic endpoints
*/

void getAccountEndpoint(Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    string username = "";
    int id = -1;

    validateParameters(message, (json) {
        username = json.getUsernameSafe(("id" in json) is null);
        id = json.getIntSafe("id", ("username" in json) is null);
    });

    Account account;
    if (id >= 0)
    {
        account = db.getUserById(id);
    }
    else
    {
        account = db.getUserByName(username);
    }

    if (account is null)
    {
        response.databaseError(DB_Errors.DOES_NOT_EXIST);
        return;
    }

    response.jsonMessage(account.asJSONData());
}
/**
    Entrance endpoints
*/

void registrationEndpoint(Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    string username;
    string password;

    validateParameters(message, (json) {
        username = json.getUsernameSafe();
        password = json.getPasswordSafe();
    });

    debug
    {
        writeln("Received: '", username, "@", password, "'");
    }
    else
    {
        writeln("Received: '", username, "@<truncated (本番ビルド)>'");
    }

    auto errors = db.newUser(username, password);
    if (errors != DB_Errors.OK)
    {
        return response.databaseError(errors);
    }

    Account account = db.getUserByName(username);
    string sessionToken = createSession(account, false);

    return response.session(account, sessionToken);
}

void logInEndpoint(Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    string username;
    string password;
    string twoFactorCode;

    validateParameters(message, (json) {
        username = json.getUsernameSafe();
        password = json.getPasswordSafe();

        twoFactorCode = json.getStringSafe("twofactor-code", false);
    });

    debug
    {
        writeln("Received: '", username, "@", password, "'");
    }
    else
    {
        writeln("Received: '", username, "@<truncated (本番ビルド)>'");
    }

    Account account = db.getUserByName(username);

    if (account is null)
    {
        return response.databaseError(DB_Errors.DOES_NOT_EXIST);
    }

    if (!account.verifyPassword(password))
    {
        return response.databaseError(DB_Errors.INCORRECT_PASSWORD);
    }

    if ((twoFactorCode is null || twoFactorCode.length == 0) && account.has2FA())
    {
        return response.databaseError(DB_Errors.TWO_FACTOR_REQUIRED);
    }
    else if (account.has2FA() && !account.verifyTwoFactor(twoFactorCode))
    {
        return response.databaseError(DB_Errors.INCORRECT_TWO_FACTOR);
    }

    const sessionToken = createSession(account, false);
    return response.session(account, sessionToken);
}
