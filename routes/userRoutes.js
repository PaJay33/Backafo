const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// Route pour vérifier le token et renvoyer les informations de l'utilisateur
router.get('/verifyToken', protect, userController.verifyToken);


router.post('/ajouter', userController.ajouterUser);
router.post('/login', userController.connUser);
router.get('/all', userController.getAllUser);
router.get('/:id', protect, userController.getUserById); // Protected route
router.put('/:id', protect, userController.updateUser); // Protected route
router.delete('/:id', protect, isAdmin, userController.deleteUser); // Protected route - Admin only

// Routes de gestion de mot de passe
router.put('/:id/change-password', protect, userController.changePassword);
router.post('/request-password-reset', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);

// Route de mise à jour (sans mot de passe)
router.put('/:id', protect, userController.updateUser);

module.exports = router;