import std.stdio;

import ane.db;
import ane.http.server;

void main(string[] args)
{
    auto db = new Database();
    debug
    {
        writeln(
            "-- Debug mode launched --");
    }
    else
    {
        if (args.length > 1 && args[1] == "apply-migrations")
        {
            writeln("[SETUP] Preparing to apply migrations...");
            db.migrationManager.applyMigrations();
            writeln("[SETUP] Migrations applied!");
            db.close();
            return;
        }
    }

    createAuthServer(db);
    db.close();
}
