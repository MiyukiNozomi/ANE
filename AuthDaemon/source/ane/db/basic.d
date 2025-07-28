module ane.db.basic;

import std.datetime;
import std.format;
import std.stdio;
import std.string;

import ane.db;
import ane.auth.account;
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

    EXPIRED_OR_MISSING_AUTHORIZATION_REQUEST,

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

        stmt.bindText(1, (cast(char) username[0].toUpper() ~ username[1 .. $]));
        stmt.bindText(2, username);
        stmt.bindText(3, argon2i(password));
        stmt.stepAndExpect();
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

        stmt.bindInt(1, id);

        if (stmt.step() != SQLITE_ROW)
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

        stmt.bindText(1, username);

        if (stmt.step() != SQLITE_ROW)
        {
            return null;
        }

        auto acc = serializeFrom(stmt);
        return acc;
    }

package:
    Account serializeFrom(SQLite3Statement stmt)
    {
        auto id = stmt.columnInt(0);
        auto displayNameOrNull = stmt.columnString(1);
        auto name = cast(string) fromStringz!(char)(stmt.columnString(2)).dup;
        auto passwordHash = cast(string) fromStringz!(char)(stmt.columnString(3)).dup;

        const totpSecretOrNull = stmt.columnString(4);
        const recoveryEmailOrNull = stmt.columnString(5);
        const totpBackupCodeOrNull = stmt.columnString(6);

        const createdAt = stmt.columnInt(7);

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
