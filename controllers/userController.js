const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Departement = require('../models/userModel');
const { sendConfirmationEmail, sendResetCodeEmail } = require('../config/emailConfig');



// Ajouter un utilisateur
// ✅ Fonction modifiée pour envoyer l'email
exports.ajouterUser = async (req, res) => {
  try {
    const { nom, prenom, email, num, sexe, mdp, statu, role, cotisation } = req.body;
    
    // Créer l'utilisateur
    const user = await User.create({ 
      nom, 
      prenom, 
      email, 
      num, 
      sexe, 
      mdp, 
      statu, 
      role, 
      cotisation 
    });
    
    const token = user.generateJsonWebToken();
    
    // ✅ Envoyer l'email de confirmation (sans bloquer si ça échoue)
    if (role === 'membre' || !role) {
      sendConfirmationEmail(email, nom, prenom).catch(err => {
        console.error('Email non envoyé mais utilisateur créé:', err);
      });
    }
    
    res.status(201).json({
      success: true,
      token,
      data: user,
      message: 'Utilisateur créé avec succès ! Un email de confirmation a été envoyé.'
    });
  } catch (error) {
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    // Gestion des erreurs de duplication (email unique)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Autres erreurs
    res.status(400).json({ success: false, error: error.message });
  }
};

// Modifier un utilisateur
exports.updateUser = async (req, res) => {
  const { nom, prenom, email, num, sexe, mdp, statu, role, cotisation } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur n\'existe pas' });
    }

    // modification
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (email) user.email = email;
    if (num) user.num = num;
    if (role) user.role = role;
    if (sexe) user.sexe = sexe;
    if (mdp) user.mdp = mdp; // This will trigger the pre-save hook to hash the password
    if (statu) user.statu = statu;
    if (cotisation) user.cotisation = cotisation;


    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    // Gestion des erreurs de duplication (email unique)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Autres erreurs
    res.status(400).json({ success: false, error: error.message });
  }
};






// Connexion des utilisateur
exports.connUser = async (req, res) => {
  const { email, mdp } = req.body;
  
  if (!email || !mdp) {
    return res.status(400).json({ success: false, message: 'Mot de passe et Email obligatoire' });
  }
  
  try {
    const user = await User.findOne({ email }).select('+mdp');
    
    if (!user || !(await user.comparePassword(mdp))) {
      return res.status(401).json({ success: false, message: 'Information non valide' });
    }
    
    const token = user.generateJsonWebToken();
    res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Afficher un utilisateur
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur existe pas' });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Récupérer tous les utilisateurs
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find(); // Récupère tous les utilisateurs dans la collection

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun utilisateur trouvé' });
    }

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};








/* Modifier un utilisateur
exports.updateUser = async (req, res) => {
  const { nom, prenom, email, num, sexe, mdp, role} = req.body;
  
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur existe pas' });
    }
    
    // modification
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (email) user.email = email;
    if (num) user.num = num;
    if (sexe) user.sexe = sexe;
    if (mdp) user.mdp = mdp; // This will trigger the pre-save hook to hash the password
    if (role) user.role = role;
    
    
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
*/




// Changer le mot de passe (avec vérification de l'ancien)
exports.changePassword = async (req, res) => {
  const { ancienMdp, nouveauMdp } = req.body;

  try {
    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findById(req.params.id).select('+mdp');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur inexistant' });
    }

    // Vérifier que l'utilisateur modifie bien son propre mot de passe
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await user.matchPassword(ancienMdp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Ancien mot de passe incorrect' });
    }

    // Vérifier la complexité du nouveau mot de passe
    if (nouveauMdp.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Mettre à jour le mot de passe
    user.mdp = nouveauMdp;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Mot de passe modifié avec succès' 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Demander une réinitialisation de mot de passe
// userController.js - Fonction requestPasswordReset corrigée

// userController.js

// ✅ Fonction modifiée avec envoi d'email
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    console.log('========================================');
    console.log('📧 Demande de réinitialisation pour:', email);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun utilisateur avec cet email' 
      });
    }

    // Générer un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('🔑 Code généré:', resetCode);

    // Hasher le code avant de le stocker
    const crypto = require('crypto');
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
    
    console.log('🔐 Code hashé:', hashedCode);

    // Stocker le code hashé et l'expiration (10 minutes)
    user.resetPasswordCode = hashedCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log('💾 Code sauvegardé dans la BD');
    console.log('⏰ Expire à:', new Date(user.resetPasswordExpire));

    // ✅ Envoyer le code par email
    const emailSent = await sendResetCodeEmail(email, user.prenom, resetCode);

    if (!emailSent) {
      console.log('⚠️ Email non envoyé mais code créé');
      // On continue quand même pour ne pas bloquer l'utilisateur
    }

    console.log('========================================');

    res.status(200).json({ 
      success: true, 
      message: 'Code de réinitialisation envoyé à votre email',
      // ⚠️ RETIRER resetCode EN PRODUCTION - Pour dev uniquement
      ...(process.env.NODE_ENV === 'development' && { resetCode })
    });
  } catch (error) {
    console.error('❌ Erreur requestPasswordReset:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Réinitialiser le mot de passe avec le code
// userController.js

exports.resetPassword = async (req, res) => {
  const { email, resetCode, nouveauMdp } = req.body;

  try {
    console.log('========================================');
    console.log('🔍 Tentative de réinitialisation');
    console.log('📧 Email reçu:', email);
    console.log('🔑 Code reçu:', resetCode);
    console.log('========================================');

    // Hasher le code reçu pour le comparer
    const crypto = require('crypto');
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
    
    console.log('🔐 Code hashé:', hashedCode);

    // Trouver l'utilisateur avec le code et vérifier qu'il n'a pas expiré
    const user = await User.findOne({
      email: email.toLowerCase(), // Normaliser l'email
      resetPasswordCode: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');

    if (!user) {
      // Vérifier si c'est un problème d'expiration
      const userWithExpiredCode = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordCode: hashedCode
      });

      if (userWithExpiredCode) {
        console.log('⏰ Code expiré');
        return res.status(400).json({ 
          success: false, 
          message: 'Le code a expiré. Veuillez demander un nouveau code.' 
        });
      }

      // Vérifier si l'utilisateur existe
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (!userExists) {
        console.log('❌ Utilisateur inexistant');
        return res.status(400).json({ 
          success: false, 
          message: 'Aucun utilisateur trouvé avec cet email' 
        });
      }

      console.log('❌ Code invalide');
      return res.status(400).json({ 
        success: false, 
        message: 'Code invalide. Vérifiez le code et réessayez.' 
      });
    }

    // Vérifier la complexité du nouveau mot de passe
    if (!nouveauMdp || nouveauMdp.length < 8) {
      console.log('❌ Mot de passe trop court');
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Mettre à jour le mot de passe
    user.mdp = nouveauMdp;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✅ Mot de passe réinitialisé avec succès');
    console.log('========================================');

    res.status(200).json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur resetPassword:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};






// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur existe pas' });
    }
    
    res.status(204).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur existe pas' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
