const db = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");
dotenv.config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const sql = "SELECT * FROM students WHERE email = ? AND password = ?";
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

      // console.log(`Generated token: ${token}`);

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

//ISSUE HERE
exports.register = async (req, res) => {
  try {
    const {
      name,
      DOB,
      symbol,
      email,
      password,
      phone,
      address,
      program,
      semester,
      role,
    } = req.body;

    if (
      !name ||
      !DOB ||
      !symbol ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !program ||
      !semester ||
      !role
    ) {
      console.log("Missing fields in request");
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkEmailSql = "SELECT * FROM students WHERE email = ?";
    db.query(checkEmailSql, [email], async (err, data) => {
      if (err) {
        console.error("Database error during email check:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length > 0) {
        console.log("Email already registered:", email);
        return res.status(400).json({ error: "Email already registered" });
      }
      try {
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log("🚀 ~ db.query ~ hashedPassword:", hashedPassword);

        const insertSql = `
          INSERT INTO students (
            name, DOB, symbol, email, password, phone, address, 
            program, semester, role, created_at, approved_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL)
        `;
        console.log("🚀 ~ db.query ~ insertSql:", insertSql);
        const values = [
          name,
          DOB,
          symbol,
          email,
          hashedPassword,
          phone,
          address,
          program,
          semester,
          role,
        ];
        console.log(values);
        db.query(insertSql, values, (err, result) => {
          if (err) {
            console.error("Database error during insert:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Inserted student:", result);
          return res.status(200).json({ success: true, data: result });
        });
      } catch (error) {
        console.error("Error hashing password:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.dashboard = async (req, res) => {
  const email = req.email;
  try {
    const [results] = await db.execute(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    res.json({
      sid: user.Sid,
      name: user.name,
      DOB: user.DOB,
      symbol: user.symbol,
      email: user.email,
      phone: user.phone,
      address: user.address,
      semester: user.semester,
      program: user.program,
      message: "This is your dashboard data.",
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
