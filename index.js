const express = require("express");
const cors = require("cors");
// const session = require("express-session");
const db = require("./config/database");
const cookieParser = require("cookie-parser");
const verifyToken = require("./middleware/user.middleware");

const app = express();

app.use(cookieParser());
// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, //1day
//   })
// );
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/admin", require("./routes/admin.routes"));

app.use("/user", require("./routes/user.routes"));

app.get("/dashboard", verifyToken, async (req, res) => {
  const email = req.email;
  console.log("🚀 ~ app.get ~ email:", email);

  try {
    const [results] = await db.query("SELECT * FROM students WHERE email = ?", [
      email,
    ]);

    console.log("🚀 ~ app.get ~ [results]:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });``
    }

    const user = results[0];

    // console.log("🚀 ~ app.get ~ user:", user);

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      symbol: user.symbol,
      semester: user.semester,
      program: user.program,
      role: user.role,
      message: "This is your dashboard data.",
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3306;

app.listen(PORT, (req, res) => {
  console.log(`🚀 ~ Listening to Port no. ${PORT}`);
});
97;
