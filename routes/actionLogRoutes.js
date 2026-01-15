const express = require('express');
const router = express.Router();
const actionLogController = require('../controllers/actionLogController');
const { protect } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// Toutes les routes sont protégées et nécessitent le rôle Admin
router.get('/all', protect, isAdmin, actionLogController.getAllLogs);
router.get('/stats', protect, isAdmin, actionLogController.getLogStats);
router.get('/user/:userId', protect, isAdmin, actionLogController.getUserLogs);

module.exports = router;
