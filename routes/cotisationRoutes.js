// cotisationRoutes.js - VERSION CORRIGÉE

const express = require('express');
const router = express.Router();
const cotisationController = require('../controllers/cotisationController');
const { protect } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const isFinance = require('../middlewares/isFinance');

// ⚠️ IMPORTANT : Routes spécifiques AVANT les routes avec paramètres dynamiques

// Routes de génération (AVANT tout) - Admin ou Finance
router.post('/generer', protect, isFinance, cotisationController.genererCotisations);
router.post('/generer-selective', protect, isFinance, cotisationController.genererCotisationsSelectives);

// Routes spéciales - Admin ou Finance peuvent voir toutes les cotisations
router.get('/all', protect, isFinance, cotisationController.getAllCotisations);
router.delete('/all', protect, isAdmin, cotisationController.deleteAllCotisations); // Admin seulement pour supprimer tout

// Route de création - Admin ou Finance
router.post('/create', protect, isFinance, cotisationController.createCotisation);

// Routes pour les membres (protégées)
router.get('/user/:userId', protect, cotisationController.getCotisationsByUser);

// Routes avec ID dynamique (TOUJOURS EN DERNIER)
router.put('/:id/payer', protect, isFinance, cotisationController.marquerPayee); // Finance peut marquer comme payé
router.put('/:id', protect, isFinance, cotisationController.updateCotisation); // Finance peut modifier
router.delete('/:id', protect, isAdmin, cotisationController.deleteCotisation); // Admin seulement pour supprimer

module.exports = router;