const db = require("../config/database");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = "SELECT * FROM admins WHERE email = ?";
  const values = [email];

  db.query(sql, values, async (err, data) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Query result:", data);

    if (data.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = data[0];

    // Use bcrypt to compare hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.admin_Id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.json({
      login: true,
      token: token,
    });
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;

    if (!email || !password || !name || !phone || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkEmailSql = "SELECT * FROM admins WHERE `email` = ?";
    db.query(checkEmailSql, [email], (err, data) => {
      if (err) {
        console.error("Database error during email check:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const insertSql =
        "INSERT INTO admins (`email`, `password`, `name`, `phone`, `address`) VALUES (?, ?, ?, ?, ?)";
      const values = [email, password, name, phone, address];

      db.query(insertSql, values, (err, result) => {
        if (err) {
          console.error("Database error during insert:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        return res.json({ success: true, data: result });
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
