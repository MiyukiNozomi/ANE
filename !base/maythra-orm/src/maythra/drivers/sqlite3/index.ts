import DatabaseConstructor, { Database } from "better-sqlite3";

import * as IDriver from "../idriver";

import { SQLite3SchemaManager } from "./schema";

export type SQLite3Options = {
  file?: string;
  inMemory?: boolean;
};

export class SQLite3Database extends IDriver.DatabaseImpl<SQLite3Options> {
  public dbHandle: Database;

  public constructor(options: SQLite3Options) {
    super(options);
    if (options.inMemory == undefined && options.file == undefined)
      throw new Error(
        "SQLite3 options should either have a 'inMemory' boolean field or 'file' string field."
      );

    this.dbHandle = new DatabaseConstructor(
      options.inMemory ? ":memory:" : options.file!
    );
  }

  public schemaManager(): IDriver.SchemaManagerImpl<
    IDriver.DatabaseImpl<SQLite3Options>
  > {
    return new SQLite3SchemaManager(this);
  }

  public closeInternal(): void {
    this.dbHandle.close();
  }
}
