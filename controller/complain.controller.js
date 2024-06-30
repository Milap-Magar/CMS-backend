const db = require("../config/database");

// Add a new complaint [CREATE]
exports.addComplains = async (req, res) => {
  const { title, description, category, student_id, complain_to, status } =
    req.body;
  const email = req.user.email;

  try {
    const [result] = await db.execute(
      `INSERT INTO complaints (email, title, description, category, student_id, complain_to, status, created_at, updated_at)
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

    const complaintId = result.insertId;

    return res.status(200).json({
      success: true,
      message: "Complaint added successfully",
      complaintId: complaintId,
    });
  } catch (err) {
    console.error("Error adding complaint:", err);
    return res.status(500).json({
      success: false,
      message: "Error adding complaint",
      error: err.message,
    });
  }
};
// Get all complaints for the logged-in user [READ]
exports.getComplaints = async (req, res) => {
  // const email = req.user.email;

  try {
    const [rows] = await db.query("SELECT * FROM complaints");

    return res.status(200).json({
      success: true,
      complaints: rows,
    });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching complaints",
      error: err.message,
    });
  }
};
// Update a complaint [UPDATE]
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

    if (!complaint.length) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (role === "student" && complaint[0].email !== email) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
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

      return res.status(200).json({
        success: true,
        message: "Complaint updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }
  } catch (err) {
    console.error("Error updating complaint:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating complaint",
      error: err.message,
    });
  }
};
// Delete a complaint [DELETE]
exports.deleteComplaint = async (req, res) => {
  const complaintId = req.params.id;
  const email = req.user.email;
  const role = req.user.role;

  try {
    const [complaint] = await db.query(
      "SELECT * FROM complaints WHERE complain_id = ?",
      [complaintId]
    );

    if (!complaint.length) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check permission
    if (role === "student" && complaint[0].email !== email) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await db.query("DELETE FROM complaints WHERE complain_id = ?", [
      complaintId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    return res.status(500).json({
      success: false,
      message: "Error deleting complaint",
      error: err.message,
    });
  }
};
// Get a specific complaint by ID [SPECIFIC COMPLAINT]
exports.getComplaint = async (req, res) => {
  const complaintId = req.params.id;
  const email = req.user.email;
  const role = req.user.role;

  try {
    const [complaint] = await db.query(
      "SELECT * FROM complaints WHERE complain_id = ?",
      [complaintId]
    );

    if (!complaint.length) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check permission
    if (role === "student" && complaint[0].email !== email) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      complaint: complaint[0],
    });
  } catch (err) {
    console.error("Error fetching complaint:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching complaint",
      error: err.message,
    });
  }
};
