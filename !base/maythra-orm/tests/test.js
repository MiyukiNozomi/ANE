const {MaythraDrivers, column} = require("../lib/index");

(async() => {
    const db = MaythraDrivers.sqlite3({
        file:"test.db"
    });

    await db.schema().defineTable("users", [
        column("id", "INTEGER", {keyType: "PRIMARY_KEY"}),
        column("name", "TEXT", {notNull: true}),
        column("realName", "TEXT"),
        column("age", "FLOAT32", {defaultValue: '18'})
    ]);

    db.close();
})();