const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth.middleware");
const {
  getComplaints,
  deleteComplaint,
  updateComplaint,
  addComplains,
  getComplaint,
} = require("../controller/complain.controller");

router.post("/complaints", checkAuth, addComplains);

router.get("/complaints", checkAuth, getComplaints);

router.put("/complaints", checkAuth, updateComplaint);

router.delete("/complaints", checkAuth, deleteComplaint);

// router.get("/complaints/:id", checkAuth, getComplaint);

module.exports = router;
