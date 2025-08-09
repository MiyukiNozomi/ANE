import { IS_MAYTHRA_DEBUG } from "../constants";
import { InternalOperationResult, SchemaManagerImpl } from "../drivers/idriver";
import { Column, MaythraException, Table } from "../instrumentation";

export class MaythraSchemaManager {
  public rawSchema: Map<string, Table>;
  public schemaManager: SchemaManagerImpl<any>;

  public constructor(schemaManager: SchemaManagerImpl<any>) {
    this.schemaManager = schemaManager;
    this.rawSchema = new Map();
  }

  public async defineTable(name: string, columns: Column[]) {
    // Schema Validation
    let primaryKey: Column | undefined;

    {
      let includedColumns = new Set<string>();
      for (let column of columns) {
        if (column.flags.keyType == "PRIMARY_KEY") {
          if (primaryKey)
            throw new MaythraException(
              `Table ${name} already has a primary key of name ${primaryKey.name}`
            );
          primaryKey = column;
        }

        if (includedColumns.has(column.name))
          throw new MaythraException(
            `Table ${name} has duplicated columns of name ${column.name}`
          );

        includedColumns.add(column.name);
      }
    }

    if (!primaryKey)
      throw new MaythraException(`Table ${name} is missing a primary key.`);

    // creation if missing;
    if (!this.rawSchema.has(name)) {
      await this.schemaManager.createTableInternal(name, primaryKey);

      this.rawSchema.set(name, new Table(name, [primaryKey]));
    }
    let table = this.rawSchema.get(name)!;

    const physicalColumns = (
      await this.schemaManager.getTableColumnsInternal(table.name)
    ).data!;
    for (let newColumn of columns) {
      if (newColumn.flags.keyType == "PRIMARY_KEY") continue;

      const existingColumn = physicalColumns.find(
        (v) => v.name == newColumn.name
      );

      if (!existingColumn) {
        if (IS_MAYTHRA_DEBUG)
          console.log(
            `[Maythra/DBG] Table ${table.name} is missing column ${newColumn.name}, creating it`
          );
        await this.schemaManager.createColumnInternal(table.name, newColumn);
      } else if (!existingColumn.equals(newColumn)) {
        if (IS_MAYTHRA_DEBUG)
          console.log(
            `[Maythra/DBG] Table ${table.name} has out-of-date column ${newColumn.name}, updating it`
          );
        await this.schemaManager.updateColumnInternal(table.name, newColumn);
      }

      table.addColumn(newColumn);
    }

    for (let currentColumn of table.columns) {
      if (!columns.find((v) => v.name == currentColumn.name)) {
        if (IS_MAYTHRA_DEBUG)
          console.log(
            `[Maythra/DBG] Table ${table.name} should not contain ${currentColumn.name}, dropping it`
          );

        if (table.dropColumn(currentColumn.name)) {
          await this.schemaManager.deleteColumnInternal(
            table.name,
            currentColumn.name
          );
        } else if (IS_MAYTHRA_DEBUG)
          console.log(
            `[Maythra/DBG/WARN] Drop of column ${currentColumn.name} in table ${table.name} was not attempted (not in virtual schema)`
          );
      }
    }
    if (IS_MAYTHRA_DEBUG) {
      console.log(
        `[Maythra/DBG] Table ${table.name} now has schema: `,
        table.columns
      );
    }
    return this;
  }

  /** Returns a table's schema */
  public table(name: string) {
    return this.rawSchema.get(name);
  }
}
