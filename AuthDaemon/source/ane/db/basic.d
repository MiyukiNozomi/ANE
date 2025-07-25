module ane.db.basic;

import std.datetime;
import std.format;
import std.stdio;
import std.string;

import ane.auth.account;
import ane.db.basic;
import ane.db.handling;
import ane.security.argon2;

import etc.c.sqlite3;

enum DB_Errors
{
    ALREADY_EXISTS,
    DOES_NOT_EXIST,

    INCORRECT_PASSWORD,

    TWO_FACTOR_REQUIRED,
    INCORRECT_TWO_FACTOR,
    INCORRECT_BACKUP_CODE,

    EXPIRED_OR_MISSING_SESSION,

    OK,
}

class Database : SQLite3Handler
{

    public this()
    {
        super();
    }

    DB_Errors newUser(string username, string password)
    {
        username = username.toLower();
        if (getUserByName(username) !is null)
        {
            return DB_Errors.ALREADY_EXISTS;
        }
        auto stmt = newPreparedStatement(
            "INSERT INTO users (displayName, name, passwordHash) VALUES (?, ?, ?)");
        scope (exit)
            sqlite3_finalize(stmt);

        if (bindText(stmt, 1, (cast(char) username[0].toUpper() ~ username[1 .. $])) != SQLITE_OK ||
            bindText(stmt, 2, username) != SQLITE_OK ||
            bindText(stmt, 3, argon2i(password)) != SQLITE_OK)
        {
            throw new Exception("BIND FAILED");
        }

        if (sqlite3_step(stmt) != SQLITE_DONE)
        {
            throw new Exception("Execution failed!");
        }
        return DB_Errors.OK;
    }

    /** returns null if ID is non-existant */
    Account getUserById(int id)
    {
        auto stmt = newPreparedStatement(
            "SELECT
                id, displayName, name, passwordHash, totpSecret,
                recoveryEmail, totpBackupCode, created_at
                FROM users WHERE id = ?");

        // holy shit D has go's defer, that is neat!
        scope (exit)
            sqlite3_finalize(stmt);

        if (bindInt(stmt, 1, id) != SQLITE_OK)
        {
            throw new Exception("BIND FAILED");
        }

        int rc = sqlite3_step(stmt);
        if (rc != SQLITE_ROW)
        {
            return null;
        }

        auto acc = serializeFrom(stmt);
        return acc;
    }

    /** returns null if account is missing */
    Account getUserByName(string username)
    {

        username = username.toLower();
        auto stmt = newPreparedStatement(
            "SELECT
                id, displayName, name, passwordHash, totpSecret,
                recoveryEmail, totpBackupCode, created_at
                FROM users WHERE name = ?");
        // holy shit D has go's defer, that is neat!
        scope (exit)
            sqlite3_finalize(stmt);

        if (bindText(stmt, 1, username) != SQLITE_OK)
        {
            throw new Exception("BIND FAILED");
        }

        int rc = sqlite3_step(stmt);
        if (rc != SQLITE_ROW)
        {
            return null;
        }

        auto acc = serializeFrom(stmt);
        return acc;
    }

package:
    Account serializeFrom(sqlite3_stmt* stmt)
    {
        auto id = sqlite3_column_int(stmt, 0);
        auto displayNameRaw = sqlite3_column_text(stmt, 1);
        auto name = cast(string) fromStringz!(char)(sqlite3_column_text(stmt, 2)).dup;
        auto passwordHash = cast(string) fromStringz!(char)(sqlite3_column_text(stmt, 3)).dup;

        const totpSecret = sqlite3_column_text(stmt, 4);
        const recoveryEmail = sqlite3_column_text(stmt, 5);
        const totpBackupCode = sqlite3_column_text(stmt, 6);

        const createdAt = sqlite3_column_int(stmt, 7);

        auto displayNameOrNull = displayNameRaw !is null ? cast(string) fromStringz(
            displayNameRaw).dup : null;

        auto totpSecretOrNull = totpSecret !is null ? cast(string) fromStringz(totpSecret).dup
            : null;
        auto recoveryEmailOrNull = recoveryEmail !is null ? cast(string) fromStringz(
            recoveryEmail).dup : null;

        auto totpBackupCodeOrNull = totpBackupCode !is null ? cast(string) fromStringz(
            totpBackupCode).dup : null;

        return new Account(this,
            id,
            displayNameOrNull,
            name,
            passwordHash,
            totpSecretOrNull,
            recoveryEmailOrNull,
            totpBackupCodeOrNull,

            createdAt
        );
    }
}
