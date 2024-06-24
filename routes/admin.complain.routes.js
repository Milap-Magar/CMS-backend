const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth.middleware");
const {
  getComplaints,
  deleteComplaint,
  updateComplaint,
  getComplaint,
} = require("../controller/admin.complain.controller");

// Get all complaints for the logged-in user
router.get("/complaints", checkAuth, getComplaints);

// Get a specific complaint by ID
router.get("/complaints/:id", checkAuth, getComplaint);

// Update a specific complaint by ID
router.put("/complaints/:id", checkAuth, updateComplaint);

// Delete a specific complaint by ID
router.delete("/complaints/:id", checkAuth, deleteComplaint);

module.exports = router;
