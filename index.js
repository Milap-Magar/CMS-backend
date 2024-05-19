const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const verifyToken = require("./middleware/admin.middleware");

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

app.get("/dashboard", verifyToken, (req, res) => {
  const email = req.user.email;
  res.json({ email, message: "This is your dashboard data." });
});


const PORT = process.env.PORT || 3306;

app.listen(PORT, (req, res) => {
  console.log(`🚀 ~ Listening to Port no. ${PORT}`);
});
