'use strict';

exports.PORT = process.env.PORT || 8000
exports.DATABASE_URL = process.env.DATABASE_URL ||
'db/db.json';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
'db/db_test.json';
