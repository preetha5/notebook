const low = require("lowdb");

//Set up LOWDB Database
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db/db.json");
const db = low(adapter);
db.defaults({notes:[]}).write();

// const test_adapter = new FileSync("db/db_test.json");
// const db_test = low(test_adapter);
//db_test.defaults({notes:[]}).write();

module.exports = {db};
