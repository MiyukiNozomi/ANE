import { DatabaseImpl } from "../drivers/idriver";
import { SQLite3Database, SQLite3Options } from "../drivers/sqlite3";
import { MaythraException } from "../instrumentation";
import { MaythraSchemaManager } from "./schema";

export class MaythraDrivers {
  // add other drivers here as time goes by...
  public static sqlite3(options: SQLite3Options) {
    return new MaythraDatabase(new SQLite3Database(options));
  }
}

export class MaythraDatabase<E extends DatabaseImpl<T>, T> {
  private databaseImpl: E;
  public schemaManager: MaythraSchemaManager;

  public constructor(databaseImpl: E) {
    this.databaseImpl = databaseImpl;
    this.schemaManager = new MaythraSchemaManager(
      this.databaseImpl.schemaManager()
    );
  }

  public schema() {
    this.ensureNotClosed();
    return this.schemaManager;
  }

  public close() {
    this.databaseImpl.close();
  }

  public wasClosed() {
    return this.databaseImpl.wasClosed();
  }

  private ensureNotClosed() {
    if (this.databaseImpl.wasClosed())
      throw new MaythraException(
        "Cannot perform CRUD operations with a closed database."
      );
  }
}
