module ane.http.endpoints;

import std.json;
import std.stdio;
import std.string;

import ane.auth.db;
import ane.auth.session;
import ane.auth.validation;

import ane.http.message;
import ane.auth.account;
import ane.security.totp;

string getUsernameSafe(JSONValue json, bool mandatory = true)
{
    string rawusername = json.getStringSafe("username", mandatory).toLower();

    if (rawusername.length == 0 && !mandatory)
        return "";

    if (!isUsernameValid(rawusername))
        throw new HttpException(400, "ユーザー名が不正です 「Bad username」");

    return rawusername;
}

string getPasswordSafe(JSONValue json, bool mandatory = true)
{
    string rawpassword = json.getStringSafe("password", mandatory);

    if (rawpassword.length == 0 && !mandatory)
        return "";
    if (!isPasswordValid(rawpassword))
        throw new HttpException(400, "パスワードが不正です 「Bad password」");

    return rawpassword;
}

string getDisplaynameSafe(JSONValue json, bool mandatory = true)
{
    string displayName = json.getStringSafe("displayname", mandatory);
    if (!isDisplayNameValid(displayName))
        throw new HttpException(400, "表示名が不正です 「Bad display name」");
    return displayName;
}

string getStringSafe(JSONValue value, string name, bool mandatory = true)
{
    JSONValue* str = name in value;
    if (str is null)
    {
        if (mandatory)
            throw new HttpException(400, format(
                    "不正なペイロード：%s が欠落しています", name));

        return "";
    }

    return str.str().strip();
}

/**
    If the value is missing and mandatory is false,
    -1 will be returned instead.
*/
int getIntSafe(JSONValue value, string name, bool mandatory = true)
{
    JSONValue* i = name in value;
    if (i is null)
    {
        if (mandatory)
            throw new HttpException(400, format(
                    "不正なペイロード：%s が欠落しています", name));
        return -1;
    }

    return cast(int) i.integer();
}

void validateParameters(HttpIncomingMessage message, void delegate(JSONValue json) getters)
{
    try
    {
        JSONValue json = parseJSON(cast(string) message.payload);
        getters(json);
    }
    catch (Throwable b)
    {
        writeln("JSON parse exception: ", b.message);
        throw new HttpException(400, "無効なペイロード (Invalid Payload)");
    }
}

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
    string sessionToken = createSession(account);

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

    const sessionToken = createSession(account);
    return response.session(account, sessionToken);
}

/**
    Account setting endpoints
*/

void SignedInEndpointRequirement(
    Database db, HttpServerResponse response, HttpIncomingMessage message,
    void function(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message) unsecuredEndpoint
)
{
    string sessionToken = message.getAuthorization();
    if (sessionToken == null || sessionToken.length == 0)
    {
        throw new HttpException(401, "認証が必要です 「HTTP Authorization Required」");
    }

    Account account = getSession(db, sessionToken);
    if (account is null)
    {
        return response.databaseError(DB_Errors.EXPIRED_OR_MISSING_SESSION);
    }

    debug
    {
        writeln("Signed in endpoint request for: ", account.Name, " 「ID ", account.ID, "」 of session: ", sessionToken);
    }
    else
    {
        writeln("Signed in endpoint request for: ", account.Name, " 「ID ", account.ID, "」 of session: <truncated(本番ビルド)>");
    }

    unsecuredEndpoint(account, db, response, message);
}

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

void clearAccountSessionsEndpoint(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    deleteAccountSessions(account);
    return response.jsonOK();
}

void currentAccountInfo(Account account, Database db, HttpServerResponse response, HttpIncomingMessage message)
{
    return response.jsonMessage(account.asJSONData());
}
