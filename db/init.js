const Database=require("better-sqlite3");
const db=new Database("db/arc.db");
db.exec(`
CREATE TABLE IF NOT EXISTS agents(id TEXT PRIMARY KEY, data TEXT);
CREATE TABLE IF NOT EXISTS protocols(id TEXT PRIMARY KEY, data TEXT);
CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY, data TEXT, status TEXT);
`);
db.close();
