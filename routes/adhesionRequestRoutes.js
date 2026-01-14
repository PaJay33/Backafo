const express = require('express');
const router = express.Router();
const adhesionRequestController = require('../controllers/adhesionRequestController');
const { protect } = require('../middlewares/authMiddleware');

// Route publique pour créer une demande d'adhésion
router.post('/create', adhesionRequestController.createAdhesionRequest);

// Routes protégées (admin uniquement)
router.get('/all', protect, adhesionRequestController.getAllRequests);
router.post('/:id/approve', protect, adhesionRequestController.approveRequest);
router.post('/:id/reject', protect, adhesionRequestController.rejectRequest);
router.delete('/:id', protect, adhesionRequestController.deleteRequest);

module.exports = router;
