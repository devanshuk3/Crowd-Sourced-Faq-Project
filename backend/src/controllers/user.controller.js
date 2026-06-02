const User = require('../models/user.model');
const FAQ = require('../models/faq.model');
const Answer = require('../models/answer.model');
const crypto = require('crypto');

// Hash password with native SHA-256
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// POST /users/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = hashPassword(password);
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
    });

    await user.save();
    res.status(201).json({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /users/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /users/:id/role (Admin Only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /users/:id (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /users/admin/stats (Admin Only)
exports.getAdminStats = async (req, res) => {
  try {
    const [faqCount, unansweredCount, answerCount, totalUsers, categoriesData] = await Promise.all([
      FAQ.countDocuments({}),
      FAQ.countDocuments({ status: 'Unanswered' }),
      Answer.countDocuments({}),
      User.countDocuments({}),
      FAQ.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate total views and upvotes for FAQs
    const faqAgg = await FAQ.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' }, totalUpvotes: { $sum: '$upvoteCount' } } }
    ]);
    const totalViews = faqAgg[0]?.totalViews || 0;
    const faqUpvotes = faqAgg[0]?.totalUpvotes || 0;

    // Calculate total upvotes for Answers
    const ansAgg = await Answer.aggregate([
      { $group: { _id: null, totalUpvotes: { $sum: '$upvoteCount' } } }
    ]);
    const answerUpvotes = ansAgg[0]?.totalUpvotes || 0;

    res.json({
      faqCount,
      unansweredCount,
      answeredCount: faqCount - unansweredCount,
      answerCount,
      totalUsers,
      totalViews,
      totalUpvotes: faqUpvotes + answerUpvotes,
      categories: categoriesData.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
