const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth.middleware");
const {
  createComplain,
  getComplains,
  deleteComplain,
} = require("../controller/complain.controller");

router.get("/complaints", checkAuth, getComplains);

router.post("/complaints", checkAuth, createComplain);

router.put("/complaints", checkAuth, getComplains);

router.delete("/complaints", checkAuth, deleteComplain);

// router.get("/complaints/:id", checkAuth, async (req, res) => {
// });

module.exports = router;
