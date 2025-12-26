import Database from "better-sqlite3";

export type DatabaseHooks<T> = Partial<{
  onQueryResult: (result: T) => T | undefined;
}>;

export type DatabaseSchema = {
  creationStatement: string;
  extraRequiredColumns: {
    columnName: string;
    creationStatement: string;
  }[];
};

export abstract class DatabaseTable<T> {
  private tableName: string;
  private db: Database.Database;
  private hooks: DatabaseHooks<T>;

  private cachedStatements: Map<string, Database.Statement>;

  public constructor(
    tableName: string,
    db: Database.Database,
    hooks: DatabaseHooks<T>,
    schema: DatabaseSchema,
  ) {
    this.tableName = tableName;
    this.db = db;
    this.hooks = hooks;
    this.cachedStatements = new Map();

    this.db.exec(`
CREATE TABLE IF NOT EXISTS ${tableName} (
    ${schema.creationStatement}
)`);
    schema.extraRequiredColumns.forEach((e) =>
      this.applyIfColumnNotExists(e.columnName, e.creationStatement),
    );
  }

  public async delete(query: Partial<T>) {
    const qO = this.queryObject2SQLite(query, "DELETE FROM");
    return qO.statement.run(...qO.values);
  }

  public async where(query: Partial<T>) {
    const qO = this.queryObject2SQLite(query, "SELECT * FROM");
    return (<T[]>qO.statement.all(...qO.values))
      .map((v) =>
        this.hooks["onQueryResult"] ? this.hooks["onQueryResult"](v) : v,
      )
      .filter((v) => v != undefined);
  }

  public async whereFirst(query: Partial<T>) {
    const qO = this.queryObject2SQLite(query, "SELECT * FROM");
    let v = <T>qO.statement.get(...qO.values);
    return (
      (this.hooks["onQueryResult"] ? this.hooks["onQueryResult"](v) : v) ?? null
    );
  }

  public async insert(value: Partial<T>) {
    const qO = this.insertionObject2SQLite(value);
    return qO.statement.run(...qO.values).lastInsertRowid;
  }

  public async update(data: { where: Partial<T>; data: Partial<T> }) {
    const qO = this.updateObject2SQLite(data.where, data.data);
    return qO.statement.run(...qO.values).lastInsertRowid;
  }

  private queryObject2SQLite(query: Partial<T>, prefix: string) {
    const keys = Object.keys(query);
    let queryStr = `${prefix} ${this.tableName} ${this.object2Query(query)};`;
    let statement: Database.Statement;
    if (this.cachedStatements.has(queryStr))
      statement = this.cachedStatements.get(queryStr)!;
    else {
      statement = this.db.prepare(queryStr);
      this.cachedStatements.set(queryStr, statement);
    }

    return {
      statement,
      values: keys.map(
        (v) => (query as any)[v] ?? null /** undefined = shit */,
      ),
    };
  }

  private insertionObject2SQLite(query: Partial<T>) {
    const keys = Object.keys(query);
    let queryStr = `INSERT INTO ${this.tableName}(${keys.map((v) => `${v}`).join(", ")}) VALUES (${keys.map(() => `?`).join(", ")});`;
    let statement: Database.Statement;
    if (this.cachedStatements.has(queryStr))
      statement = this.cachedStatements.get(queryStr)!;
    else {
      statement = this.db.prepare(queryStr);
      this.cachedStatements.set(queryStr, statement);
    }

    return {
      statement,
      values: keys.map(
        (v) => (query as any)[v] ?? null /** undefined = shit */,
      ),
    };
  }

  private updateObject2SQLite(query: Partial<T>, data: Partial<T>) {
    let queryStr = `UPDATE ${this.tableName} ${this.object2Query(data, "SET")} ${this.object2Query(query)};`;
    let statement: Database.Statement;
    if (this.cachedStatements.has(queryStr))
      statement = this.cachedStatements.get(queryStr)!;
    else {
      statement = this.db.prepare(queryStr);
      this.cachedStatements.set(queryStr, statement);
    }

    let values = Object.keys(data)
      .map((v) => (data as any)[v] ?? null /** undefined = shit */)
      .concat(
        Object.keys(query).map(
          (v) => (query as any)[v] ?? null /** undefined = shit */,
        ),
      );

    return {
      statement,
      values,
    };
  }

  private object2Query(obj: Partial<T>, prefix = "WHERE") {
    const keys = Object.keys(obj);
    return `${keys.length > 0 ? prefix : ""} ${keys.map((v) => `${v} = ?`).join(" AND ")}`;
  }

  private applyIfColumnNotExists(column: string, migration: string) {
    const columns: { name: string }[] = (
      this.db.pragma(`table_info(${this.tableName})`) as any
    ).map((row: any) => ({ name: row.name }));

    const columnExists = columns.some((col) => col.name === column);

    if (!columnExists) {
      this.db.exec(`ALTER TABLE ${this.tableName} ${migration}`);
    }
  }
}

export class GenericDatabaseTable<T> extends DatabaseTable<T> {
  public constructor(
    name: string,
    db: Database.Database,
    hooks: DatabaseHooks<T>,
    schema: DatabaseSchema,
  ) {
    super(name, db, hooks, schema);
  }
}
