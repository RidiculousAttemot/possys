const { extractBearerToken, verifyAuthToken } = require('../utils/auth');

// Middleware to verify the JWT token
const authMiddleware = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify the token
  try {
    const decoded = verifyAuthToken(token);

    // Attach user info to the request object
    req.user = decoded;
    req.authToken = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
