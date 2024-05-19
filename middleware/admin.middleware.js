const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("here", decoded);

    const email = decoded.email;
    req.email = email;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyToken; 
