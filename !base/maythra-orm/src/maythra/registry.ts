import { DatabaseImpl } from "./drivers/idriver";
import { SQLite3Database, SQLite3Options } from "./drivers/sqlite3";

export const IS_MAYTHRA_DEBUG = process.argv.includes("--dev");

export type MaythraDriverOptions<T, E extends DatabaseImpl<T>> = {
  driverClass: new (p: T) => E;
  options: T;
};

function sqlite3(
  options: SQLite3Options
): MaythraDriverOptions<SQLite3Options, SQLite3Database> {
  return {
    options,
    driverClass: SQLite3Database,
  };
}

export const MaythraDrivers = { sqlite3 };
