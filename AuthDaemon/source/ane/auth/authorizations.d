module ane.auth.authorizations;

import ane.db;

import ane.auth.account;
import ane.auth.session;

import etc.c.sqlite3;

import std.json;
import std.uuid;
import std.stdio;
import std.format;
import std.random;
import std.datetime;

const MaxRequestLifespan = 60 * 60;

class ThirdPartySessionRequest
{
    const string id;
    const string authorizationRequestCode;
    const string realm;

    const string sessionIDorNull;

    const int createdAt;

    this(
        string id,
        string authReqCode,
        string realm,
        string sessionOrNull,
        int createdAt
    )
    {
        this.id = id;
        this.authorizationRequestCode = authReqCode;
        this.realm = realm;
        this.sessionIDorNull = sessionOrNull;
        this.createdAt = createdAt;
    }

    JSONValue toJSON()
    {
        JSONValue v = [
            "ID": this.id,
            "authReqCode": this.authorizationRequestCode,
            "realm": this.realm,
        ];

        v["createdAt"] = this.createdAt;

        v["sessionId"] = this.sessionIDorNull == null || this.sessionIDorNull.length == 0 ?
            null : this.sessionIDorNull;

        return v;
    }
}

string genAuthorizationRequestCode()
{
    ubyte[] address = new ubyte[16];
    for (size_t i = 0; i < address.length; i++)
        address[i] = uniform!ubyte();
    return "0x" ~ format("%(%02X%)", address);
}

void clearExpiredAuthorizationRequests(Database db)
{
    auto stmt = db.newPreparedStatement(
        "DELETE FROM thirdPartySessionRequest WHERE
                strftime('%s','now') - created_at > ?");

    stmt.bindInt(1, MaxRequestLifespan);
    stmt.stepAndExpect();
}

ThirdPartySessionRequest getAuthorizationRequest(Database db, string secret)
{
    clearExpiredAuthorizationRequests(db);

    debug
    {
        writeln("[DEBUG] Find request by secret: ", secret);
    }

    auto stmt = db.newPreparedStatement(
        "SELECT
            authorizationRequestCode,
            realm,
            session_id,
            created_at
          FROM thirdPartySessionRequest WHERE id = ?");

    stmt.bindText(1, secret);

    if (stmt.step() != SQLITE_ROW)
        return null;

    const authorizationRequestCode = stmt.columnString(0);
    const realm = stmt.columnString(1);
    const sessionId = stmt.columnString(2);
    const createdAt = stmt.columnInt(3);
    SysTime currentTime = Clock.currTime();

    if (createdAt - currentTime.toUnixTime() > MaxRequestLifespan)
    {
        writeln("Attempted to get an expired authorization request: (now ", currentTime.toUnixTime(),
            ") (session date ", createdAt, ") (code? ", authorizationRequestCode, ".)");
        return null;
    }

    return new ThirdPartySessionRequest(
        secret,
        authorizationRequestCode,
        realm,
        sessionId,
        createdAt
    );
}

ThirdPartySessionRequest getAuthorizationRequestByCode(Database db, string authorizationRequestCode)
{
    clearExpiredAuthorizationRequests(db);

    auto stmt = db.newPreparedStatement(
        "SELECT
            id,
            realm,
            session_id,
            created_at
          FROM thirdPartySessionRequest WHERE authorizationRequestCode = ?");

    stmt.bindText(1, authorizationRequestCode);

    if (stmt.step() != SQLITE_ROW)
        return null;

    const id = stmt.columnString(0);
    const realm = stmt.columnString(1);
    const sessionId = stmt.columnString(2);
    const createdAt = stmt.columnInt(3);
    SysTime currentTime = Clock.currTime();

    if (createdAt - currentTime.toUnixTime() > MaxRequestLifespan)
    {
        writeln("Attempted to get an expired authorization request: (now ", currentTime.toUnixTime(),
            ") (session date ", createdAt, ") (code? ", authorizationRequestCode, ".)");
        return null;
    }

    return new ThirdPartySessionRequest(
        id,
        authorizationRequestCode,
        realm,
        sessionId,
        createdAt
    );
}

string createAuthorizationRequest(Database db, string secret, string realm)
{
    clearExpiredAuthorizationRequests(db);
    const requestCode = genAuthorizationRequestCode;

    debug
    {
        writeln("Generating new third party login request with secret: ", secret);
    }
    else
    {
        writeln(
            "Generating new third party login request with secret: <truncated (本番ビルド)>");
    }

    auto stmt = db.newPreparedStatement(
        "INSERT INTO thirdPartySessionRequest (
            id,
            authorizationRequestCode,
            realm
        ) VALUES (?, ?, ?)");

    stmt.bindText(1, secret);
    stmt.bindText(2, requestCode);
    stmt.bindText(3, realm);

    stmt.stepAndExpect();

    return requestCode;
}

void authorizeRequest(Database db, Account account, ThirdPartySessionRequest req)
{
    clearExpiredAuthorizationRequests(db);
    const session = createSession(account, true);

    auto stmt = db.newPreparedStatement("
        UPDATE thirdPartySessionRequest SET session_id = ? WHERE authorizationRequestCode = ?
    ");

    debug
    {
        writeln("Generating new third party session: ", session);
    }
    else
    {
        writeln("Generating new third party session: <truncated (本番ビルド)>");
    }
    stmt.bindText(1, session);

    stmt.bindText(2, req.authorizationRequestCode);

    stmt.step();
}
