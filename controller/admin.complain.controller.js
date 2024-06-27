const db = require("../config/database");

// Get all complaints for the admin [READ]
exports.getComplaints = async (req, res) => {
  const email = req.user.email;

  try {
    const [rows] = await db.execute("SELECT * FROM complaints");
    // console.log(rows);

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
  // console.log(req.params);
  const complaintId = req.params.id;
  // console.log("🚀 ~ exports.updateComplaint= ~ complaintId:", complaintId);

  const { status } = req.body;

  try {
    const [complaint] = await db.execute(
      "SELECT * FROM complaints WHERE complaint_id = ?",
      [complaintId]
    );

    if (!complaint.length) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (status) {
      await db.execute(
        "UPDATE complaints SET status = ?, updated_at = NOW() WHERE complaint_id = ?",
        [status, complaintId]
      );

      return res.status(200).json({
        success: true,
        message: "Complaint updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No status provided for update",
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
    const [complaint] = await db.execute(
      "SELECT * FROM complaints WHERE complaint_id = ?",
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

    await db.execute("DELETE FROM complaints WHERE complaint_id = ?", [
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
    const [complaint] = await db.execute(
      "SELECT * FROM complaints WHERE complaint_id = ?",
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

exports.getComplaintCount = async (req, res) => {
  const userId = req.params.id;

  try {
    const [totalComplaints] = await db.execute(
      "SELECT COUNT(*) AS total FROM complaints WHERE Sid = ?",
      [userId]
    );

    const [resolvedComplaints] = await db.execute(
      "SELECT COUNT(*) AS resolved FROM complaints WHERE Sid = ? AND status = 'resolved'",
      [userId]
    );

    if (totalComplaints[0].total === 0) {
      return res.status(404).json({
        success: false,
        message: "No complaints found for this user",
      });
    }

    res.status(200).json({
      success: true,
      totalComplaints: totalComplaints[0].total,
      resolvedComplaints: resolvedComplaints[0].resolved,
    });
  } catch (err) {
    console.error("Error fetching complaint status:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching complaint status",
      error: err.message,
    });
  }
};
