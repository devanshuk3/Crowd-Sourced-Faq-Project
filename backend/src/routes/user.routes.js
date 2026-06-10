const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { requireAdmin } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// Public authentication routes
router.post('/register', ctrl.register);
router.post('/login', loginRateLimiter, ctrl.login);

// Admin-only user and stats management
router.get('/admin/stats', requireAdmin, ctrl.getAdminStats);
router.get('/', requireAdmin, ctrl.getAllUsers);
router.put('/:id/role', requireAdmin, ctrl.updateUserRole);
router.delete('/:id', requireAdmin, ctrl.deleteUser);

module.exports = router;
