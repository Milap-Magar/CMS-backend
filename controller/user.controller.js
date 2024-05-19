const db = require("../config/database");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = "SELECT * FROM students WHERE email = ? AND password = ?";
  db.query(sql, [email, password], async (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Query result:", data);

    if (data.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    } else {
      const user = data[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Password bcryption error" });
      }

      const token = jwt.sign(
        { id: user.Sid, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.json({
        login: true,
        token: token,
      });
    }
  });
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
