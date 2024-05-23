const dbPromise = require("../config/database");
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
    const db = await dbPromise();
    const [data] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);

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
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;

    if (!email || !password || !name || !phone || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const db = await dbPromise();

    // Check if the email is already registered
    const [data] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
    if (data.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new admin
    const [result] = await db.execute(
      "INSERT INTO admins (email, password, name, phone, address) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, name, phone, address]
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
