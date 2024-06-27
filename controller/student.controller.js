const db = require("../config/database");
const bcrypt = require("bcryptjs");

exports.getStudentData = async (req, res) => {
  const studentId = req.params.id;

  try {
    const [student] = await db.execute("SELECT * FROM students WHERE Sid = ?", [
      studentId,
    ]);

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student[0],
    });
  } catch (err) {
    console.error("Error fetching student data:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching student data",
      error: err.message,
    });
  }
};

exports.updateStudentPassword = async (req, res) => {
  const studentId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const [student] = await db.execute(
      "SELECT password FROM students WHERE Sid = ?",
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      student[0].password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute("UPDATE students SET password = ? WHERE Sid = ?", [
      hashedPassword,
      studentId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating password",
      error: err.message,
    });
  }
};
