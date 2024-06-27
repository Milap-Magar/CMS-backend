const express = require("express");
const { login, register, dashboard } = require("../controller/user.controller");
const verifyToken = require("../middleware/user.middleware");

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/dashboard", verifyToken, dashboard);

module.exports = router;
