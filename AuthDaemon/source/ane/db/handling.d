module ane.db.handling;

import std.stdio;

import ane.db;
import ane.db.migration;
import ane.fs;

import std.string;

import core.stdc.string : strlen;
import etc.c.sqlite3;
import ane.db.statements;

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
            const pth = getExecutionPath();
            const databaseName = pth ~ "ANE-DEBUG.db";
        }
        else
        {
            const databaseName = "/home/AZKi/ANE.db";
        }

        int retCode = sqlite3_open(databaseName
                .toStringz(), &this.sqliteDb);
        if (retCode != SQLITE_OK)
        {
            writeln("Note: failed to open ", databaseName);
            throw new Exception("Could not open database! Error: " ~ this.getError(retCode));
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

    SQLite3Statement newPreparedStatement(string statement)
    {
        return new SQLite3Statement(this, statement);
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
