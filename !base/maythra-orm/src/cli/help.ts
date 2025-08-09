export function printHelp() {
  console.log(`    
    MaythraORM -- A highly abstracted Object Relational Model
    
    Arguments:
        --schema [schemaFile]

            Sets the schema file of this database, default value is ./migrations.js

    Commands:
        migrate 
            
            Checks differences between physical Database and Schema.

`);
}
