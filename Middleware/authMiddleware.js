const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Failed to authenticate token' });
    }

    req.userId = decoded.userId; // ✅ CORRECTED LINE
    console.log("Decoded JWT:", decoded);
console.log("req.userId set to:", req.userId);

    next();
  });
};

module.exports = verifyToken;
