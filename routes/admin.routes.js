const express = require("express");
const {
  login,
  register,
  dashboard,
} = require("../controller/admin.controller");
const verifyToken = require("../middleware/admin.middleware");

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/dashboard", verifyToken, dashboard);

module.exports = router;
