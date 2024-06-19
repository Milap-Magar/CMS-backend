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

  try {
    const [data] = await db.execute("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);

    if (data.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const admin = data[0];

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.admin_Id, email: admin.email, role: admin.role },
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
  try {
    const { email, password, name, phone, address, role } = req.body;

    if (!email || !password || !name || !phone || !address || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [data] = await db.execute("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);
    if (data.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO admins (email, password, name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, name, phone, address, role]
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET DATA from admins
exports.dashboard = async (req, res) => {
  const email = req.email;
  // console.log("🚀 ~ app.get ~ email:", email);

  try {
    const [results] = await db.execute("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);
    // console.log("🚀 ~ app.get ~ [results]:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = results[0];
    res.json({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      role: admin.role,
      message: "This is your dashboard data.",
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
