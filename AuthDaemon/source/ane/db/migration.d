module ane.db.migration;

import ane.fs;
import ane.db;

import std.stdio;
import std.string;
import std.datetime;
import std.format : format;

import etc.c.sqlite3;

class SQLite3MigrationManager
{

    private SQLite3Handler sqlite;

    this(SQLite3Handler sqlite)
    {
        this.sqlite = sqlite;
    }

private:
    void registerMigration(string name)
    {
        auto stmt = sqlite.newPreparedStatement("INSERT INTO migrations (name) VALUES (?)");
        scope (exit)
            sqlite3_finalize(stmt);

        if (sqlite.bindText(stmt, 1, name) != SQLITE_OK)
            throw new Exception("Migration Bind Failed");

        if (sqlite3_step(stmt) != SQLITE_DONE)
        {
            throw new Exception("Migration insertion Failed");
        }
    }

    bool wasApplied(string name, out int date)
    {
        auto stmt = sqlite.newPreparedStatement("SELECT created_at FROM migrations WHERE name = ?");
        scope (exit)
            sqlite3_finalize(stmt);

        if (sqlite.bindText(stmt, 1, name) != SQLITE_OK)
            throw new Exception("Migration Bind Failed");

        if (sqlite3_step(stmt) != SQLITE_ROW)
            return false;

        date = sqlite3_column_int(stmt, 0);
        return true;
    }

    void tryRunMigration(string text)
    {
        char* errorMessage;
        int retCode = sqlite3_exec(this.sqlite.sqliteDb, text.toStringz(), null, null, &errorMessage);

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
