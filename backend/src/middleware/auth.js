const User = require('../models/user.model');

exports.requireAuth = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.requireAdmin = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
