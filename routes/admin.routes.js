const express = require("express");
const {
  login,
  register,
  dashboard,
  total,
  deleteStudent,
} = require("../controller/admin.controller");
const verifyToken = require("../middleware/admin.middleware");

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/dashboard", verifyToken, dashboard);

router.get("/total", verifyToken, total);

router.delete("/total/:id", verifyToken, deleteStudent);

module.exports = router;
