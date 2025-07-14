import std.stdio;

import ane.auth.db;
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
            db.applyMigrations();
            writeln("Migrations applied!");
            db.close();
            return;
        }
    }

    createAuthServer(db);
    db.close();
}
