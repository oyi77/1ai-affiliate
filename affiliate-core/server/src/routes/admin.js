const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');

// Middleware to check for Admin Role
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admins only.' });
    }
};

router.use(authenticate); // All admin routes require login
router.use(requireAdmin); // All admin routes require admin role

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/sessions', adminController.getActiveSessions);
router.delete('/sessions/:sessionId', adminController.revokeSession);
router.get('/client-build', adminController.getClientBuild);

module.exports = router;
