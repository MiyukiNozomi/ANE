module ane.auth.session;

import std.datetime;
import std.stdio : writeln;

import ane.db;
import ane.auth.account;

import etc.c.sqlite3;

import std.uuid;
import std.string;
import std.json;

// in miliseconds
// sessions will only last for a day.
const MaxSessionLifespan = 2 * 24 * 60 * 60;
const MaxThirdPartySessionLifespan = MaxSessionLifespan / 2;

class SessionInfo
{
    const string ID;
    const int createdAt;
    const bool isThirdParty;
    const string realmName;

    this(string ID, int createdAt, bool isThirdParty, string realmName)
    {
        this.ID = ID;
        this.createdAt = createdAt;
        this.isThirdParty = isThirdParty;
        this.realmName = realmName;
    }

    JSONValue toJSON()
    {
        JSONValue listElm;

        listElm["ID"] = this.ID;
        listElm["createdAt"] = this.createdAt;
        listElm["isThirdParty"] = this.isThirdParty;
        listElm["realmName"] = this.realmName;

        return listElm;
    }
}

string genSessionSecret()
{
    return randomUUID().toString().replace("-", "") ~ randomUUID().toString().replace("-", "");
}

void clearExpiredSessions(Database db)
{
    {
        auto stmt = db.newPreparedStatement(
            "DELETE FROM sessions WHERE isThirdPartySession = FALSE 
                AND strftime('%s','now') - created_at > ?");

        stmt.bindInt(1, MaxSessionLifespan);
        stmt.stepAndExpect();
    }
    {
        auto stmt = db.newPreparedStatement(
            "DELETE FROM sessions WHERE isThirdPartySession = TRUE 
                AND strftime('%s','now') - created_at > ?");

        stmt.bindInt(1, MaxThirdPartySessionLifespan);

        stmt.stepAndExpect();
    }
}

/**
    Returns null if the session is invalid, the associated account otherwise.
*/
Account getSession(Database db, string sessionToken)
{
    auto stmt = db.newPreparedStatement(
        "SELECT created_at, user_id, isThirdPartySession, realmName FROM sessions WHERE id = ?");

    stmt.bindText(1, sessionToken);

    if (stmt.step() != SQLITE_ROW)
    {
        return null;
    }

    auto createdAt = stmt.columnInt(0);
    auto userId = stmt.columnInt(1);
    auto isThirdPartySession = cast(bool) stmt.columnInt(2);
    auto realmName = stmt.columnString(3);

    SysTime currentTime = Clock.currTime();

    if (createdAt - currentTime.toUnixTime() >
        (isThirdPartySession ? MaxThirdPartySessionLifespan : MaxSessionLifespan))
    {
        debug
        {
            writeln("Attempted to use an expired session: (now ", currentTime.toUnixTime(),
                ") (session date ", createdAt, ") (is third party? ", isThirdPartySession ? "yes" : "no", ".)");
        }
        return null;
    }

    Account account = db.getUserById(userId);
    account.sessionInfo = new SessionInfo(
        sessionToken,
        createdAt,
        isThirdPartySession,
        realmName
    );
    return account;
}

/**
    Creates a session for the associated account and returns it token

    **NOTE**: This generates a Root-Level Token, NOT a third party session.
*/
string createSession(Account account)
{
    clearExpiredSessions(account.db);

    const id = genSessionSecret();
    writeln("Generating new session for user: ", account.Name, " (", account.ID, ")");

    auto stmt = account.db.newPreparedStatement(
        "INSERT INTO sessions (id, user_id) VALUES (?, ?)");

    stmt.bindText(1, id);
    stmt.bindInt(2, account.ID);

    stmt.stepAndExpect();

    writeln("New session: " ~ account.Name ~ " id: " ~ id);

    return id;
}

/**
    Creates a session for the associated account and returns it token

    **NOTE**: This generates a Root-Level Token, NOT a third party session.
*/
string createThirdPartySession(Account account, string realmName)
{
    clearExpiredSessions(account.db);
    const id = genSessionSecret();
    writeln("Generating new session for user: ", account.Name, " (", account.ID, ")");

    auto stmt = account.db.newPreparedStatement(
        "INSERT INTO sessions (id, user_id, isThirdPartySession, realmName) VALUES (?, ?, ?, ?)");

    stmt.bindText(1, id);
    stmt.bindInt(2, account.ID);
    stmt.bindInt(3, true);
    stmt.bindText(4, realmName);

    stmt.stepAndExpect();

    writeln("New third party session: " ~ account.Name ~ " id: " ~ id);

    return id;
}

/**
    Deletes a specific session, be it root level or not.
*/

void deleteCurrentAccountSession(Account account)
{
    auto stmt = account.db.newPreparedStatement(
        "DELETE FROM sessions WHERE user_id = ? AND id = ?");

    stmt.bindInt(1, account.ID);
    stmt.bindText(2, account.sessionInfo.ID);
    stmt.stepAndExpect();
}

/**
/**
    Deletes every session from an account.
*/

void deleteAccountSessions(Account account)
{
    auto stmt = account.db.newPreparedStatement(
        "DELETE FROM sessions WHERE user_id = ?");

    stmt.bindInt(1, account.ID);
    stmt.stepAndExpect();
}

/**
    Return a list of sessions (along their creation dates) for an account
    as a JSON array.
*/
JSONValue[] getAccountSessions(Account account)
{
    clearExpiredSessions(account.db);

    JSONValue[] list;
    auto stmt = account.db.newPreparedStatement(
        "SELECT 
            id, 
            created_at, 
            isThirdPartySession, 
            realmName 
        FROM
            sessions
        WHERE 
            user_id = ? 
            ORDER BY created_at DESC");

    stmt.bindInt(1, account.ID());

    while (stmt.step() == SQLITE_ROW)
    {
        auto id =
            stmt.columnString(0);
        auto createdAt = stmt.columnInt(1);
        auto isThirdPartySession = cast(bool) stmt.columnInt(2);
        auto realmName = stmt.columnString(3);

        list ~= new SessionInfo(id, createdAt, isThirdPartySession, realmName).toJSON();
    }

    return list;
}
