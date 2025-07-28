module ane.db.statements;

import std.string;

import etc.c.sqlite3;

import ane.db.handling;
import core.stdc.string : strlen;

class SQLite3Statement
{

    public SQLite3Handler db;
    private sqlite3_stmt* preparedStatement;

    public this(SQLite3Handler handler, string statement)
    {
        this.db = handler;
        const statm = toStringz(statement);

        int retVal = sqlite3_prepare(handler.sqliteDb, statm, cast(int) strlen(statm), &preparedStatement, null);

        if (retVal != SQLITE_OK)
        {
            throw new Exception(format("Fuck! %s", fromStringz(sqlite3_errmsg(handler.sqliteDb))));
        }

    }

    ~this()
    {
        sqlite3_finalize(this.preparedStatement);
        debug
        {
            import std.stdio : writeln;

            try
            {
                writeln("Statement closed!");
            }
            catch (Exception)
            {
            }
        }
    }

    /* note ID is 1 based! */
    void bindText(int id, string text)
    {
        const txtnptr = toStringz(text);
        if (sqlite3_bind_text(this.preparedStatement, id, txtnptr,
                cast(int) strlen(txtnptr), SQLITE_STATIC) != SQLITE_OK)
        {
            throw new Exception("Failed to bind parameters");
        }
    }

    /* note ID is 1 based! */
    void bindTextOrNull(int id, string text)
    {
        int retVal;
        if (text == null || text.length == 0)
        {
            retVal = sqlite3_bind_null(this.preparedStatement, id);
        }
        else
        {
            const txtnptr = toStringz(text);
            retVal = sqlite3_bind_text(this.preparedStatement,
                id, txtnptr, cast(int) strlen(txtnptr), SQLITE_STATIC);
        }

        if (retVal != SQLITE_OK)
        {
            throw new Exception("Failed to bind parameters");
        }
    }

    /* note ID is 1 based! */
    void bindInt(int id, int val)
    {
        if (sqlite3_bind_int(this.preparedStatement, id, val) != SQLITE_OK)
        {
            throw new Exception("Failed to bind parameters");
        }
    }

    /* note ID is 0 based! */
    int columnInt(int id)
    {
        return sqlite3_column_int(this.preparedStatement, id);
    }

    string columnString(int id)
    {
        const raw = sqlite3_column_text(this.preparedStatement, 0);
        if (raw is null)
            return null;
        return cast(string) fromStringz(
            raw).dup;
    }

    int step()
    {
        return sqlite3_step(this.preparedStatement);
    }

    void stepAndExpect(int code = SQLITE_DONE)
    {
        int actualCode = this.step();
        if (actualCode != code)
            throw new Exception(format(
                    "Expected SQLite condition %d but got %d instead.", code, actualCode));
    }
}
