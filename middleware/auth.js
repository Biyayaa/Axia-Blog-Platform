const jwt = require('jsonwebtoken');
const User = require('../models/user'); // so we can fetch role if not in token

// Middleware to protect routes (only authenticated users can access)
const auth = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Check for token in cookies first
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2️⃣ If no token in cookies, check Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 3️⃣ If no token found at all
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Option A: Token already has role → just attach
    if (decoded.role) {
      req.user = decoded; // { id, role, ... }
    } else {
      // 5️⃣ Option B: Fetch full user from DB to get role
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
      };
    }

    next();

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
