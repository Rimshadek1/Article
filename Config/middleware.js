const jwt = require('jsonwebtoken');
const jwtSecret = require('../Config/jwtSecret');

const authMiddleware = (req, res, next) => {
  // Get the token from the request header, query parameter, or cookie
  const token = req.headers.authorization || req.query.token || req.cookies.token;
  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: 'No token found' });
  }

  try {
      // Verify and decode the token
      const decoded = jwt.verify(token, jwtSecret);
    
    // Attach the decoded payload to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    // Handle token verification errors
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
