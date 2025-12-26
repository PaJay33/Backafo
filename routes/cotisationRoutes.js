// cotisationRoutes.js - VERSION CORRIGÉE

const express = require('express');
const router = express.Router();
const cotisationController = require('../controllers/cotisationController');
const { protect } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// ⚠️ IMPORTANT : Routes spécifiques AVANT les routes avec paramètres dynamiques

// Routes de génération (AVANT tout)
router.post('/generer', protect, isAdmin, cotisationController.genererCotisations);
router.post('/generer-selective', protect, isAdmin, cotisationController.genererCotisationsSelectives); // ✅ AJOUTEZ CETTE LIGNE

// Routes spéciales admin
router.get('/all', protect, isAdmin, cotisationController.getAllCotisations);
router.delete('/all', protect, isAdmin, cotisationController.deleteAllCotisations); // ✅ Ajoutez protect et isAdmin

// Route de création
router.post('/create', protect, isAdmin, cotisationController.createCotisation);

// Routes pour les membres (protégées)
router.get('/user/:userId', protect, cotisationController.getCotisationsByUser);

// Routes avec ID dynamique (TOUJOURS EN DERNIER)
router.put('/:id/payer', protect, isAdmin, cotisationController.marquerPayee);
router.put('/:id', protect, isAdmin, cotisationController.updateCotisation);
router.delete('/:id', protect, isAdmin, cotisationController.deleteCotisation);

module.exports = router;