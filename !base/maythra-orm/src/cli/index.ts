#!/usr/bin/env node

import { loadConfig, parseArgs } from "./params";
import { genDeclaration } from "../maythra/schema/declarationGen";

(async () => {
  const args = parseArgs(process.argv.slice(2));

  switch (args.action) {
    case "migrate":
      return await performMigration(args.configFile);
    default:
      console.error("Unknown subcomand: ", args.action);
      return process.exit(-1);
  }
})();

async function performMigration(configFile: string) {
  const config = loadConfig(configFile);

  console.log("Generating typings..");
  genDeclaration(config.schema);
  console.log("Database typings have been generated!");
}
