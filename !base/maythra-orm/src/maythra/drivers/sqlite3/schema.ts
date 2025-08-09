import { SQLite3Database } from ".";
import { IS_MAYTHRA_DEBUG } from "../../registry";
import { Column, ColumnType } from "../../instrumentation";
import * as IDriver from "../idriver";

export class SQLite3SchemaManager extends IDriver.SchemaManagerImpl<SQLite3Database> {
  private sqliteTypeToString(type: string): ColumnType {
    type = type.toUpperCase();

    // Maythra doesn't support BLOBs, so it isn't included here.
    switch (type) {
      case "TEXT":
      case "INTEGER":
        return type;
      case "REAL":
        return "FLOAT32"; /// could be a problem in the future.
      default:
        return "TEXT";
    }
  }

  private maythraTypeToSQLite(type: ColumnType): string {
    switch (type) {
      case "DATE":
      case "BOOLEAN":
      case "INTEGER":
        return "INTEGER";
      case "FLOAT32":
      case "FLOAT64":
        return "REAL";
      default:
        return "TEXT";
    }
  }

  private columnToSQLColumnStatement(column: Column) {
    let stmt = `${column.name} ${this.maythraTypeToSQLite(column.type)}`;

    if (column.flags.keyType == "PRIMARY_KEY") {
      stmt += ` PRIMARY KEY`;
    }

    if (!column.flags.nullable) {
      stmt += ` NOT NULL`;
    }

    if (column.flags.defaultValue) {
      stmt += ` DEFAULT ${column.flags.defaultValue}`;
    }
    return stmt;
  }

  public async createColumnInternal(
    name: string,
    column: Column
  ): Promise<IDriver.InternalOperationResult<undefined>> {
    this.db.dbHandle.exec(
      `ALTER TABLE ${name} ADD COLUMN ${this.columnToSQLColumnStatement(
        column
      )}`
    );
    return {
      errors: [],
      success: true,
    };
  }

  public async updateColumnInternal(
    name: string,
    column: Column
  ): Promise<IDriver.InternalOperationResult<undefined>> {
    throw new Error(
      `SQLite3 doesn't supports this operation natively, however.. i'm still on my way to develop a workaround for this.
        Don't worry, an update might already even be on the way ;)
      `
    );
  }

  public async deleteColumnInternal(
    name: string,
    columnName: string
  ): Promise<IDriver.InternalOperationResult<undefined>> {
    this.db.dbHandle.exec(`ALTER TABLE ${name} DROP COLUMN ${columnName}`);
    return {
      errors: [],
      success: true,
    };
  }

  public async createTableInternal(
    name: string,
    primaryKey: Column
  ): Promise<IDriver.InternalOperationResult<undefined>> {
    this.db.dbHandle.exec(
      `CREATE TABLE IF NOT EXISTS ${name} (${this.columnToSQLColumnStatement(
        primaryKey
      )})`
    );

    return {
      errors: [],
      success: true,
    };
  }

  public async getTableColumnsInternal(
    name: string
  ): Promise<IDriver.InternalOperationResult<Column[]>> {
    let columns = new Array<Column>();
    let errors = new Array<string>();

    const rows = this.db.dbHandle.pragma(`table_info(${name})`) as {
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }[];

    if (IS_MAYTHRA_DEBUG)
      console.log(
        `[Maythra/DBG] Got rows from PRAGMA table_info(${name}): `,
        rows
      );

    for (const row of rows) {
      columns.push(
        new Column(row.name, this.sqliteTypeToString(row.type), {
          /** this is so defaultValue wont be a string | undefined | null, and instead just a string | undefined */
          defaultValue: row.dflt_value ?? undefined,
          keyType:
            row.pk == 1
              ? "PRIMARY_KEY"
              : undefined /** ForeignKeyOptions here is a TODO */,
          nullable: row.notnull == 0 ? true : false,
        })
      );
    }

    return { errors, success: true, data: columns };
  }
}
