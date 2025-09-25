const pgp = require('pg-promise')(/* options */);
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing!');
}
const db = pgp(process.env.DATABASE_URL);

module.exports = db;
