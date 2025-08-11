import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client/extension";

const adapter = new PrismaBetterSQLite3({
  url: process.env["DB_FILE_NAME"],
});
export const db = new PrismaClient({ adapter });
