import type {
  ColumnFlags,
  ColumnType,
  ForeignKeyOptions,
} from "../instrumentation";

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

/**
 *  This is only for migrations.js!
 * The reason for this being a function.. is so that JS migration files will have type completion.
 */
export function createSchema(...tables: TableSchema[]) {
  return {
    tables,
  } satisfies SchemaInfo;
}
