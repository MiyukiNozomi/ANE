import { Schema } from "inspector/promises";
import { column, Column, MaythraException, Table } from "../instrumentation";
import { MaythraSchemaManager } from "../handling/schema";

/**
 * Represents the result of an internal schema operation.
 * Use `success` to indicate outcome, and `errors` for any issues.
 * `data` is optional and depends on the operation.
 */
export type InternalOperationResult<T = unknown> = {
  success: boolean;
  errors: string[];
  data?: T;
};

/**
 *  Database implementation.
 *  This class should contain low level handling of database-specific operations.
 */
export abstract class DatabaseImpl<T> {
  private __wasClosed: boolean;

  public readonly options: T;

  public constructor(options: T) {
    this.options = options;
    this.__wasClosed = false;
  }

  /**
   * Returns the schema manager implementation of this database.
   *
   * This will be only called once, and never twice.
   */
  public abstract schemaManager(): SchemaManagerImpl<DatabaseImpl<T>>;

  /** Closes the database handle */
  public abstract closeInternal(): void;

  //////////////////////
  /*** Abstractions ***/
  //////////////////////

  /** informs whatnever or not the database was closed. */
  public wasClosed() {
    return this.__wasClosed;
  }

  /** Closes the database handle (and sets __wasClosed) */
  public close() {
    this.__wasClosed = true;
    this.closeInternal();
  }
}

/***
 * Schema Manager implementation of your Database.
 * This class only performs low-level and database-specific operations.
 *
 * @see MaythraDatabase - For high-level handling of the schema.
 */
export abstract class SchemaManagerImpl<T> {
  public readonly db: T;

  public constructor(db: T) {
    this.db = db;
  }

  /**
   *  This should create the table only if it exists and with a primary key.
   *  If you encounter any errors or wish to report any, return as a string array (only throw exceptions if shit really hit the fan)
   *
   * @param name The name of the table.
   * @param primaryKey The primary key
   */
  public abstract createTableInternal(
    name: string,
    primaryKey: Column
  ): Promise<InternalOperationResult<undefined>>;

  /**
   * This should insert a new column into an existing table .
   * Don't worry about the column already existing.
   *
   * @param name The name of the table.
   * @param column The column to be inserted.
   */
  public abstract createColumnInternal(
    name: string,
    column: Column
  ): Promise<InternalOperationResult<undefined>>;

  /**
   * This should update a single column.
   *
   * @param name The name of the table.
   * @param column The column to be inserted.
   */
  public abstract updateColumnInternal(
    name: string,
    column: Column
  ): Promise<InternalOperationResult<undefined>>;

  /**
   * This should insert a new column into an existing table .
   * Don't worry about the column already existing.
   *
   * @param name The name of the table.
   * @param column The name of the column to be dropped.
   */
  public abstract deleteColumnInternal(
    name: string,
    columnName: string
  ): Promise<InternalOperationResult<undefined>>;

  /***
   * This should return a list of every column a table contains.
   * @param name The name of the table.
   */
  public abstract getTableColumnsInternal(
    name: string
  ): Promise<InternalOperationResult<Column[]>>;
}
