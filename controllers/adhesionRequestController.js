const AdhesionRequest = require('../models/adhesionRequestModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Créer une demande d'adhésion
exports.createAdhesionRequest = async (req, res) => {
  try {
    const { nom, prenom, email, num, sexe, mdp, cotisation } = req.body;

    // Vérifier si l'email existe déjà dans les utilisateurs
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé par un membre existant'
      });
    }

    // Vérifier si une demande avec cet email existe déjà
    const existingRequest = await AdhesionRequest.findOne({
      email,
      statut: 'en_attente'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Une demande avec cet email est déjà en cours de traitement'
      });
    }

    // Hasher le mot de passe avant de sauvegarder
    const hashedPassword = await bcrypt.hash(mdp, 10);

    // Créer la demande d'adhésion
    const request = await AdhesionRequest.create({
      nom,
      prenom,
      email,
      num,
      sexe,
      mdp: hashedPassword,
      cotisation,
      statut: 'en_attente'
    });

    res.status(201).json({
      success: true,
      message: 'Demande d\'adhésion envoyée avec succès ! Elle sera examinée par un administrateur.',
      data: {
        id: request._id,
        nom: request.nom,
        prenom: request.prenom,
        email: request.email,
        statut: request.statut
      }
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

    res.status(400).json({ success: false, error: error.message });
  }
};

// Récupérer toutes les demandes d'adhésion
exports.getAllRequests = async (req, res) => {
  try {
    const { statut } = req.query;

    const filter = statut ? { statut } : {};
    const requests = await AdhesionRequest.find(filter)
      .sort({ dateDemande: -1 })
      .populate('traitePar', 'nom prenom');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Approuver une demande d'adhésion (créer l'utilisateur)
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id; // ID de l'admin qui approuve

    // Récupérer la demande
    const request = await AdhesionRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande d\'adhésion non trouvée'
      });
    }

    if (request.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande a déjà été traitée'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom: request.nom,
      prenom: request.prenom,
      email: request.email,
      num: request.num,
      sexe: request.sexe,
      mdp: request.mdp, // Déjà hashé
      cotisation: request.cotisation,
      statu: 'actif',
      role: 'membre'
    });

    // Mettre à jour la demande
    request.statut = 'approuvé';
    request.dateTraitement = new Date();
    request.traitePar = adminId;
    await request.save();

    res.status(201).json({
      success: true,
      message: 'Demande approuvée ! Le membre peut maintenant se connecter.',
      data: user
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

    res.status(400).json({ success: false, error: error.message });
  }
};

// Refuser une demande d'adhésion
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { raisonRefus } = req.body;
    const adminId = req.user._id;

    const request = await AdhesionRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande d\'adhésion non trouvée'
      });
    }

    if (request.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande a déjà été traitée'
      });
    }

    request.statut = 'refusé';
    request.dateTraitement = new Date();
    request.traitePar = adminId;
    request.raisonRefus = raisonRefus || 'Non spécifiée';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Demande refusée',
      data: request
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Supprimer une demande d'adhésion
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AdhesionRequest.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande d\'adhésion non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Demande supprimée avec succès'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createAdhesionRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  deleteRequest
};
