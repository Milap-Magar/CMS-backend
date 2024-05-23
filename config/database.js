const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

let dbPromise;

async function initializeDatabase() {
  if (!dbPromise) {
    dbPromise = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
    });

    console.log("🚀 ~ DATABASE ~ Connected");
  }

  return dbPromise;
}

module.exports = initializeDatabase;
