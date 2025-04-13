const jwt = require('jsonwebtoken');

// Middleware to verify the JWT token
const authMiddleware = (req, res, next) => {
  // Get token from the request headers
  const token = req.headers['authorization'];

  // Check if the token exists
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Attach user info to the request object
    req.user = decoded; // Add the decoded token info to the request
    next(); // Call the next middleware or route handler
  });
};

module.exports = authMiddleware;
