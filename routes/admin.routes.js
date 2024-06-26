const express = require("express");
const {
  login,
  register,
  dashboard,
  total,
} = require("../controller/admin.controller");
const verifyToken = require("../middleware/admin.middleware");

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/dashboard", verifyToken, dashboard);

router.get("/total", verifyToken, total);

module.exports = router;
