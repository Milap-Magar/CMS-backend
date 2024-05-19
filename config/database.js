const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("🚀 ~ DATABASE ~ connection: ERROR", err);
  } else {
    console.log("🚀 ~ DATABASE ~ Connected");
  }
});

db.on("error", (err) => {
  console.error("🚀 ~ DATABASE ~ connection: ERROR", err);
});

module.exports = db;
