const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
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

app.use("/", require("./routes/complain.routes"));



const PORT = process.env.PORT || 3306;

app.listen(PORT, () => {
  console.log(`🚀 ~ Listening to Port no. ${PORT}`);
});
