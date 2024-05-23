const initializeDatabase = require("../config/database");
const jwt = require("jsonwebtoken");
// const bcrypt = require('bcrypt'); 
const dotenv = require("dotenv");
dotenv.config();


let db;

const getDbConnection = async () => {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const sql = "SELECT * FROM students WHERE email = ? AND password = ?";
    const db = await getDbConnection();
    const [rows] = await db.execute(sql, [email, password]);

    console.log("Query result:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    } else {
      const user = rows[0];

      // Uncomment if using bcrypt for password hashing
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (!isPasswordValid) {
      //   return res.status(401).json({ error: "Invalid password" });
      // }

      const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES }
      );
      res.cookie("Token", token, { httpOnly: true });

      console.log(`Generated token: ${token}`);

      return res.json({
        login: true,
        token: token,
      });
    }
  } catch (error) {
    console.error("🚀 ~ Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      symbol,
      semester,
      program,
      role,
    } = req.body;
    // console.log("here is the email", email);

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !symbol ||
      !program ||
      !semester ||
      !role
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkEmailSql = "SELECT * FROM students WHERE `email` = ?";
    db.query(checkEmailSql, email, (err, data) => {
      if (err) {
        console.error("Database error during email check:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const insertSql =
        "INSERT INTO students (`name`, `email`, `password`, `phone`, `address`, `symbol`, `program`, `semester`, `role`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const values = [
        name,
        email,
        password,
        phone,
        address,
        symbol,
        program,
        semester,
        role,
      ];

      db.query(insertSql, values, (err, result) => {
        if (err) {
          console.error("Database error during insert:", err);
          return res.status(500).json({ error: "Internal Server Error here" });
        }
        return res.status(200).json({ success: true, data: result });
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
