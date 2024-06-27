const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/admin.middleware");
const {
  getStudentData,
  updateStudentPassword,
} = require("../controller/student.controller");

router.get("/data/:id", verifyToken, getStudentData);
router.put("/data/password/:id", verifyToken, updateStudentPassword);

module.exports = router;
