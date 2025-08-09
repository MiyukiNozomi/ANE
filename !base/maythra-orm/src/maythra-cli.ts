import { existsSync } from "fs";
import { genDeclaration } from "./maythra/schema/declarationGen";
import path from "path";

(async () => {
  const args = process.argv.slice(2);

  if (args.length == 0) {
    console.log(`    
    MaythraORM -- A highly abstracted Object Relational Model
    
    Arguments:
        --schema [schemaFile]

            Sets the schema file of this database, default value is ./migrations.js

    Commands:
        migrate 
            
            Checks differences between physical Database and Schema.

`);
    process.exit(0);
  }

  let migrationFile = "./migrations.js";

  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) continue;

    const argname = args[i].substring(2);

    if (argname == "schema") {
      migrationFile = args[i + 1] ?? migrationFile;
      args.splice(i + 1, 1);
    }

    args.splice(i, 1);
    i--;
  }

  migrationFile = path.join(process.cwd(), migrationFile);

  switch (args[0]) {
    case "migrate":
      if (!existsSync(migrationFile)) {
        console.error("Migration file does not exist: ", migrationFile);
        process.exit(-1);
        break;
      }
      const schemaInfo = await import(migrationFile);
      genDeclaration(schemaInfo.default);
      console.log("Declarations generated.");
      break;
    default:
      console.error("Unknown subcomand: ", args[0]);
      process.exit(-1);
      break;
  }
})();
