const { TEST_DATABASE_URL, DATABASE_URL } = require('../config');
const low = require("lowdb");

const DB_FILE = (process.env.NODE_ENV === 'test')?TEST_DATABASE_URL:DATABASE_URL;
//Set up LOWDB Database based on the environment
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(DB_FILE);
const db = low(adapter);
db.defaults({notes:[]}).write();


module.exports = {db};
