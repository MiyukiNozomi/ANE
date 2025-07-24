module ane.auth.db;

import std.stdio;
import std.string;
import std.format;
import std.datetime;
import std.file : thisExePath;
import std.file : readText, dirEntries, SpanMode;

import core.stdc.string : strlen;

import etc.c.sqlite3;
import ane.security.argon2;
import ane.auth.account;

pragma(lib, "sqlite3");

version (Windows)
{
    pragma(error, "Fuck off!");
}

string getExecutionPath()
{
    string p = thisExePath();
    return p[0 .. p.lastIndexOf("/") + 1];
}

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

class Database
{
    private sqlite3* sqliteDb;

    public this()
    {
        debug
        {
            const databaseName = "ANE-DEBUG.db";
        }
        else
        {
            const databaseName = "/home/AZKi/ANE.db";
        }

        const pth = getExecutionPath();

        int retCode = sqlite3_open(cast(const(char)*)(pth ~ databaseName)
                .toStringz(), &this.sqliteDb);
        if (retCode != SQLITE_OK)
        {
            throw new Exception("Could not open database!");
        }

        debug
        {
            this.applyMigrations();
        }
        else
        {
            writeln("Note: you're in a production build. Remember to apply migrations manually.");
        }
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

    void close()
    {
        sqlite3_close(this.sqliteDb);
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

    string getError(int v)
    {
        return cast(string) fromStringz(sqlite3_errstr(v));
    }
    /* note ID is 1 based! */
    int bindText(sqlite3_stmt* stmt, int id, string text)
    {
        const txtnptr = toStringz(text);
        return sqlite3_bind_text(stmt, id, txtnptr, cast(int) strlen(txtnptr), SQLITE_STATIC);
    }

    /* note ID is 1 based! */
    int bindInt(sqlite3_stmt* stmt, int id, int val)
    {
        return sqlite3_bind_int(stmt, id, val);
    }

    sqlite3_stmt* newPreparedStatement(string statement)
    {
        const statm = toStringz(statement);

        sqlite3_stmt* preparedStatement;

        int retVal = sqlite3_prepare(this.sqliteDb, statm, cast(int) strlen(statm), &preparedStatement, null);

        if (retVal != SQLITE_OK)
        {
            throw new Exception(format("Fuck! %s", fromStringz(sqlite3_errmsg(this.sqliteDb))));
        }

        return preparedStatement;
    }

private:
    void registerMigration(string name)
    {
        auto stmt = newPreparedStatement("INSERT INTO migrations (name) VALUES (?)");
        scope (exit)
            sqlite3_finalize(stmt);

        if (bindText(stmt, 1, name) != SQLITE_OK)
            throw new Exception("Migration Bind Failed");

        if (sqlite3_step(stmt) != SQLITE_DONE)
        {
            throw new Exception("Migration insertion Failed");
        }
    }

    bool wasApplied(string name, out int date)
    {
        auto stmt = newPreparedStatement("SELECT created_at FROM migrations WHERE name = ?");
        scope (exit)
            sqlite3_finalize(stmt);

        if (bindText(stmt, 1, name) != SQLITE_OK)
            throw new Exception("Migration Bind Failed");

        if (sqlite3_step(stmt) != SQLITE_ROW)
            return false;

        date = sqlite3_column_int(stmt, 0);
        return true;
    }

    void tryRunMigration(string text)
    {
        char* errorMessage;
        int retCode = sqlite3_exec(this.sqliteDb, text.toStringz(), null, null, &errorMessage);

        if (retCode != 0)
        {
            writefln(format("
############### WARNING ###############
    Migration failed! (Exit %d) SQLError:
    %s
#######################################
  Please check your god damn commits!
#######################################
",
                    retCode, fromStringz(errorMessage)));
        }
    }

    public void applyMigrations()
    {
        const pth = getExecutionPath();

        this.tryRunMigration("
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);");

        auto migrations = dirEntries(pth ~ "/migrations", SpanMode.depth);

        foreach (migration; migrations)
        {
            int applicationDate;
            if (wasApplied(migration, applicationDate))
            {
                writeln("Skipping migration: ", migration, " (already applied)");
                writeln("Date of application: ", SysTime.fromUnixTime(applicationDate).toString());
                continue;
            }

            writeln("Applying migration: ", migration);
            const text = readText(migration);
            this.tryRunMigration(text);
            this.registerMigration(migration);
        }
        writeln("All good, Migrations applied!");
    }
}
