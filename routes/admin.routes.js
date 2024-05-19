const express = require("express");
const { login, register } = require("../controller/admin.controller");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

module.exports = router;
