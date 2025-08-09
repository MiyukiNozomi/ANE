import { IS_MAYTHRA_DEBUG } from "./constants";

export type ForeignKeyOptions = {
  tableName: string;
  localColumnField: string;
  onDelete?: "CASCADE";
};

export type ColumnFlags = {
  keyType?: "PRIMARY_KEY" | ForeignKeyOptions;
  defaultValue?: string;
  notNull?: boolean;
};

/**
 *  This type holds every column type supported by Maythra.
 *
 *  INTEGER - Generic 32 bit integer (may be 64 depending on driver)
 *
 *  DATE - Should always be a unix timestamp
 *
 *  TEXT - variable length text
 *
 *  BOOLEAN - actually it's an integer on most drivers, but translated to true or false
 *
 *
 * FLOAT32 & FLOAT64 = self explanatory.
 *
 */
export type ColumnType =
  | "INTEGER"
  | "DATE"
  | "TEXT"
  | "BOOLEAN"
  | "FLOAT32"
  | "FLOAT64";

export class Column {
  public readonly name: string;
  public readonly type: ColumnType;
  public readonly flags: ColumnFlags;

  public constructor(
    name: string,
    type: ColumnType,
    optionalFlags?: ColumnFlags
  ) {
    this.name = name;
    this.type = type;

    // This is so the equals function works.
    // Huge hack, TODO fix this!
    this.flags = {
      defaultValue: undefined,
      keyType: undefined,
      notNull: false,
    };

    optionalFlags = optionalFlags ?? {};

    for (const field of Object.keys(optionalFlags)) {
      (this.flags as any)[field] = (optionalFlags as any)[field];
    }
  }

  public equals(other: Column) {
    if (IS_MAYTHRA_DEBUG) {
      console.log("[Maythra/DBG] Checking diff: ", this, " vs ", other);
    }

    // Type differences should always be ignored.
    // The reasoning is simple: some drivers wont return the same type as the virtual schema claims to be.
    // One example is DATE, SQLite uses INteger as DATETIME.
    //if (other.type != this.type) return false;

    for (const key of Object.keys(this.flags)) {
      const v1 = (this.flags as any)[key];
      const v2 = (other.flags as any)[key];
      if (v1 != v2) return false;
    }
    return true;
  }
}

/** Same thing as new Column(name) */
export function column(name: string, type: ColumnType, flags?: ColumnFlags) {
  return new Column(name, type, flags);
}

export class Table {
  public name: string;
  public columns: Column[];

  public constructor(name: string, columns: Column[]) {
    this.name = name;
    this.columns = columns;
  }

  public column(name: string): Column | null {
    for (let column of this.columns) {
      if (column.name == name) return column;
    }
    return null;
  }

  /** Be aware this function will actively replace the column only in the stored schema.
   * it wont actually modify your Database. This is for maythra's own reference only.
   */
  public addColumn(column: Column) {
    const existedBeforehand = !this.dropColumn(column.name);
    this.columns.push(column);

    if (IS_MAYTHRA_DEBUG && !existedBeforehand)
      console.log(
        `[Maythra/DBG] Table ${this.name} has a new column ${column.name}, current schema: `,
        this.columns
      );
  }

  /***
   * This function will not modify Database. This is for maythra's own reference only.
   */
  public dropColumn(columnName: string) {
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].name == columnName) {
        this.columns.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

export class MaythraException extends Error {}
