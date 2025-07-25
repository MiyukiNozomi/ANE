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

        db.bindInt(stmt, 1, MaxSessionLifespan);

        scope (exit)
            sqlite3_finalize(stmt);

        if (sqlite3_step(stmt) != SQLITE_DONE)
            throw new Exception("Failed to delete expired rows!");
    }
    {
        auto stmt = db.newPreparedStatement(
            "DELETE FROM sessions WHERE isThirdPartySession = TRUE 
                AND strftime('%s','now') - created_at > ?");

        db.bindInt(stmt, 1, MaxThirdPartySessionLifespan);

        scope (exit)
            sqlite3_finalize(stmt);

        if (sqlite3_step(stmt) != SQLITE_DONE)
            throw new Exception("Failed to delete expired rows!");
    }
}

/**
    Returns null if the session is invalid, the associated account otherwise.
*/
Account getSession(Database db, string sessionToken)
{
    auto stmt = db.newPreparedStatement(
        "SELECT created_at, user_id, isThirdPartySession FROM sessions WHERE id = ?");
    scope (exit)
        sqlite3_finalize(stmt);

    if (db.bindText(stmt, 1, sessionToken) != SQLITE_OK)
    {
        throw new Exception("BIND FAILED");
    }
    int rc = sqlite3_step(stmt);
    if (rc != SQLITE_ROW)
    {
        return null;
    }

    auto createdAt = sqlite3_column_int(stmt, 0);
    auto userId = sqlite3_column_int(stmt, 1);
    auto isThirdPartySession = sqlite3_column_int(stmt, 2);

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

    return db.getUserById(userId);
}

/**
    Creates a session for the associated account and returns it token
*/
string createSession(Account account, bool isThirdPartySession)
{
    clearExpiredSessions(account.db);
    const id = genSessionSecret();
    writeln("Generating new session for user: ", account.Name, " (", account.ID, ")");

    auto stmt = account.db.newPreparedStatement(
        "INSERT INTO sessions (id, user_id, isThirdPartySession) VALUES (?, ?, ?)");

    scope (exit)
        sqlite3_finalize(stmt);
    if (account.db.bindText(stmt, 1, id) != SQLITE_OK ||
        account.db.bindInt(stmt, 2, account.ID) != SQLITE_OK ||
        account.db.bindInt(stmt, 3, isThirdPartySession) != SQLITE_OK)
    {
        throw new Exception("BIND FAILED!");
    }

    auto retval = sqlite3_step(stmt);
    if (retval != SQLITE_DONE)
    {
        writeln(account.db.getError(retval));
        throw new Exception(
            "INSERT FAILED!");
    }

    writeln("New session: " ~ account.Name ~ " id: " ~ id);

    return id;
}

/**
    Deletes every session from an account.
*/

void deleteAccountSessions(Account account)
{
    auto stmt = account.db.newPreparedStatement(
        "DELETE FROM sessions WHERE user_id = ?");

    account.db.bindInt(stmt, 1, account.ID);

    scope (exit)
        sqlite3_finalize(stmt);
    if (
        sqlite3_step(stmt) != SQLITE_DONE)
        throw new Exception(
            "Failed to delete expired rows!");
}

/**
    Return a list of sessions (along their creation dates) for an account
    as a JSON array.
*/
JSONValue[] getAccountSessions(Account account)
{
    JSONValue[] list;
    auto stmt = account.db.newPreparedStatement(
        "SELECT id, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC");
    scope (exit)
        sqlite3_finalize(stmt);
    if (account.db.bindInt(stmt, 1, account.ID()) != SQLITE_OK)
    {
        throw new Exception("BIND FAILED");
    }

    while (sqlite3_step(stmt) == SQLITE_ROW)
    {
        const id = cast(string) fromStringz(
            sqlite3_column_text(stmt, 0)).dup;
        const createdAt = sqlite3_column_int(stmt, 1);

        JSONValue listElm;
        listElm["ID"] = id;
        listElm["createdAt"] = createdAt;

        list ~= listElm;
    }

    return list;
}
