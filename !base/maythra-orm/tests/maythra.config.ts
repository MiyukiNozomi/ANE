import { defineConfig, createSchema, Drivers } from "../lib/maythracfg";

export default defineConfig({
  engine: Drivers.sqlite3({
    file: "./test.db",
  }),
  schema: createSchema({
    tableName: "users",
    columns: [
      {
        name: "id",
        type: "INTEGER",
        keyInfo: "PRIMARY_KEY",
      },
      {
        name: "banana",
        type: "TEXT",
      },
      {
        name: "isMiyuki",
        type: "BOOLEAN",
      },
      {
        name: "realname",
        type: "TEXT",
        nullable: true,
      },
    ],
  }),
});
