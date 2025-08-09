/**
 * This file contains exports for everything mayhtra.config.ts should use.
 */
import { MaythraDrivers } from "./maythra/registry";
import { DatabaseImpl } from "./maythra/drivers/idriver";
import { MaythraDriverOptions } from "./maythra/registry";
import type {
  ColumnFlags,
  ColumnType,
  ForeignKeyOptions,
} from "./maythra/instrumentation";

export type ColumnSchema = {
  name: string;
  type: ColumnType;
  keyInfo?: "PRIMARY_KEY" | ForeignKeyOptions;
} & ColumnFlags;

export type TableSchema = {
  tableName: string;
  columns: ColumnSchema[];
};

export type SchemaInfo = {
  tables: TableSchema[];
};

export type MaythraConfiguration = {
  engine: MaythraDriverOptions<unknown, DatabaseImpl<unknown>>;
  schema: SchemaInfo;
};

/***
 * These two functions only exist as prettifiers.
 *
 * You could in theory do export default {... bla bla bla...} satisfies MaythraConfiguration
 * But that's up to you.
 *
 * The same doesn't applies to createSchema, i plan on expanding it in the future.
 */
export function defineConfig(cfg: MaythraConfiguration) {
  return cfg;
}

export function createSchema(...tables: TableSchema[]) {
  return {
    tables,
  } satisfies SchemaInfo;
}

export const Drivers = MaythraDrivers;
