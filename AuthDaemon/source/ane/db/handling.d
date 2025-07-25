module ane.db.handling;

import ane.db;
import ane.db.migration;
import ane.fs;

import std.string;

import core.stdc.string : strlen;
import etc.c.sqlite3;

pragma(lib, "sqlite3");

version (Windows)
{
    pragma(error, "Fuck off!");
}

class SQLite3Handler
{
    package sqlite3* sqliteDb;

    public SQLite3MigrationManager migrationManager;

    this()
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

        this.migrationManager = new SQLite3MigrationManager(this);

        debug
        {
            this.migrationManager.applyMigrations();
        }
        else
        {
            writeln("Note: you're in a production build. Remember to apply migrations manually.");
        }
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

    string getError(int v)
    {
        return cast(string) fromStringz(sqlite3_errstr(v));
    }

    void close()
    {
        sqlite3_close(this.sqliteDb);
    }
}
