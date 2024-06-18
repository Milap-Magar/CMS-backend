const express = require("express");
const router = express.Router();

const db = require("../config/database");

exports.addComplains = async (req, res) => {
  const { title, description, faculty, semester, status } = req.body;
  const email = req.user.email;

  try {
    const result = await db.query(
      `INSERT INTO complaints (email, title, description, faculty, semester, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [email, title, description, faculty, semester, status || "pending"]
    );
    res.status(201).json({ success: true, complaintId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exprots.getComplaints = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  let query = "SELECT * FROM complaints";
  let queryParams = [];

  if (role === "student") {
    query += " WHERE email = ?";
    queryParams.push(req.user.email);
  } else if (role === "admin" && req.query.email) {
    query += " WHERE email = ?";
    queryParams.push(req.query.email);
  }

  try {
    const complaints = await db.query(query, queryParams);
    res.status(200).json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getComplaint = async (req, res) => {
  const complaintId = req.params.id;
  const email = req.user.email;
  const role = req.user.role;

  try {
    const [complaint] = await db.query(
      "SELECT * FROM complaints WHERE complain_id = ?",
      [complaintId]
    );

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    if (role === "student" && complaint.email !== email) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.status(200).json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateComplaint = async (req, res) => {
  const complaintId = req.params.id;
  const { title, description, status } = req.body;
  const email = req.user.email;
  const role = req.user.role;

  try {
    const [complaint] = await db.query(
      "SELECT * FROM complaints WHERE complain_id = ?",
      [complaintId]
    );

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    if (role === "student" && complaint.email !== email) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const updateFields = [];
    const updateValues = [];

    if (title) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }

    if (description) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }

    if (role === "admin" && status) {
      updateFields.push("status = ?");
      updateValues.push(status);
    }

    if (updateFields.length > 0) {
      updateFields.push("updated_at = NOW()");
      updateValues.push(complaintId);

      await db.query(
        `UPDATE complaints SET ${updateFields.join(
          ", "
        )} WHERE complain_id = ?`,
        updateValues
      );

      res.status(200).json({ success: true, message: "Complaint updated" });
    } else {
      res.status(400).json({ success: false, message: "No fields to update" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  const complaintId = req.params.id;
  const email = req.user.email;
  const role = req.user.role;

  try {
    const [complaint] = await db.query(
      "SELECT * FROM complaints WHERE complain_id = ?",
      [complaintId]
    );

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    if (role === "student" && complaint.email !== email) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    await db.query("DELETE FROM complaints WHERE complain_id = ?", [
      complaintId,
    ]);

    res.status(200).json({ success: true, message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = router;
