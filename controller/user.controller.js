const db = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const dotenv = require("dotenv");
dotenv.config();

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [data] = await db.execute("SELECT * FROM students WHERE email = ?", [
      email,
    ]);

    if (data.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = data[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.Sid, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.json({
      login: true,
      token: token,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.register = async (req, res) => {
  console.log("🚀 ~ exports.register= ~ req:", req.body);

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
    const [data] = await db.execute(checkEmailSql, [email]);
    console.log("🚀 ~ exports.register= ~ data:", data.length);

    if (data.length === 0) {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
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
        const [result] = await db.execute(insertSql, values);
        return res
          .status(200)
          .json({ message: "Inserted sucessfully", data: [result] });
      } catch (error) {
        console.error("Error hashing password:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      return res.status(400).json({ error: "Email already registered." });
    }
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
