const db = require("../config/database");

exports.addComplains = async (req, res) => {
  const { title, description, category, student_id, complain_to, status } =
    req.body;
  const email = req.user.email;

  try {
    const result = await db.execute(
      `INSERT INTO complaints (email, title, description, category,	student_id, complain_to, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        email,
        title,
        description,
        category,
        student_id,
        complain_to,
        status || "pending",
      ]
    );
    return res
      .status(200)
      .json({ success: true, complaintId: result.complaintId });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getComplaints = async (req, res) => {
  let query = "SELECT * FROM complaints WHERE email = ?";
  let queryParams = [req.user.email];

  try {
    const [rows, fields] = await db.query(query, queryParams);
    // console.log("🚀 ~ exports.getComplaints= ~ rows:", rows);

    return res.status(200).json({ success: true, complaints: rows });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return res.status(500).json({ success: false, error: err.message });
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

    return res
      .status(200)
      .json({ success: true, message: "Complaint deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
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

    return res.status(200).json({ success: true, complaint });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// module.exports = router;
