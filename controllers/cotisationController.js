const Cotisation = require('../models/cotisationModel');
const User = require('../models/userModel');
const { createLog } = require('./actionLogController');

// Obtenir l'historique des cotisations d'un membre
exports.getCotisationsByUser = async (req, res) => {
  try {
    const cotisations = await Cotisation.find({ userId: req.params.userId })
      .sort({ mois: -1 });
    
    res.status(200).json({ success: true, data: cotisations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Obtenir toutes les cotisations (Admin uniquement)
exports.getAllCotisations = async (req, res) => {
  try {
    const cotisations = await Cotisation.find()
      .populate('userId', 'nom prenom email')
      .sort({ mois: -1 });
    
    res.status(200).json({ success: true, count: cotisations.length, data: cotisations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Créer une nouvelle cotisation (Admin uniquement)
exports.createCotisation = async (req, res) => {
  try {
    const { userId, mois, montant } = req.body;
    
    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si la cotisation existe déjà
    const existing = await Cotisation.findOne({ userId, mois });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cotisation déjà existante pour ce mois' 
      });
    }
    
    const cotisation = await Cotisation.create({ 
      userId, 
      mois, 
      montant,
      statut: 'en_attente'
    });
    
    res.status(201).json({ success: true, data: cotisation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Marquer une cotisation comme payée (Admin uniquement)
exports.marquerPayee = async (req, res) => {
  try {
    const { methodePaiement } = req.body;

    const cotisation = await Cotisation.findById(req.params.id)
      .populate('userId', 'nom prenom email');

    if (!cotisation) {
      return res.status(404).json({
        success: false,
        message: 'Cotisation non trouvée'
      });
    }

    cotisation.statut = 'payé';
    cotisation.datePaiement = new Date();
    cotisation.methodePaiement = methodePaiement || 'espèces';

    await cotisation.save();

    // Log de l'action
    await createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.prenom} ${req.user.nom}`,
      userRole: req.user.role,
      action: 'COTISATION_MARQUEE_PAYEE',
      targetType: 'COTISATION',
      targetId: cotisation._id.toString(),
      targetName: `${cotisation.userId.prenom} ${cotisation.userId.nom} - ${cotisation.mois}`,
      description: `Cotisation marquée comme payée pour ${cotisation.userId.prenom} ${cotisation.userId.nom} (${cotisation.mois})`,
      details: {
        montant: cotisation.montant,
        mois: cotisation.mois,
        methodePaiement: cotisation.methodePaiement
      },
      montant: cotisation.montant,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Cotisation marquée comme payée',
      data: cotisation
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Mettre à jour une cotisation (Admin uniquement)
exports.updateCotisation = async (req, res) => {
  try {
    const { montant, statut, methodePaiement } = req.body;
    
    const cotisation = await Cotisation.findById(req.params.id);
    
    if (!cotisation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cotisation non trouvée' 
      });
    }
    
    if (montant) cotisation.montant = montant;
    if (statut) cotisation.statut = statut;
    if (methodePaiement) cotisation.methodePaiement = methodePaiement;
    
    if (statut === 'payé' && !cotisation.datePaiement) {
      cotisation.datePaiement = new Date();
    }
    
    await cotisation.save();
    
    res.status(200).json({ success: true, data: cotisation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Supprimer une cotisation (Admin uniquement)
exports.deleteCotisation = async (req, res) => {
  try {
    const cotisation = await Cotisation.findByIdAndDelete(req.params.id);
    
    if (!cotisation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cotisation non trouvée' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Cotisation supprimée avec succès' 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Générer les cotisations pour tous les membres actifs (Admin uniquement)
exports.genererCotisations = async (req, res) => {
  try {
    const { mois, montant } = req.body;

    // Récupérer tous les membres actifs
    const users = await User.find({
      statu: 'actif',
      role: { $ne: 'Admin' }
    });

    const cotisationsCreees = [];
    const errors = [];

    for (const user of users) {
      try {
        // Vérifier si la cotisation existe déjà
        const existing = await Cotisation.findOne({
          userId: user._id,
          mois
        });

        if (!existing) {
          const cotisation = await Cotisation.create({
            userId: user._id,
            mois,
            montant: montant || 3000, // Montant par défaut
            statut: 'en_attente'
          });
          cotisationsCreees.push(cotisation);
        }
      } catch (err) {
        errors.push({
          userId: user._id,
          nom: `${user.prenom} ${user.nom}`,
          error: err.message
        });
      }
    }

    // Log de l'action
    await createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.prenom} ${req.user.nom}`,
      userRole: req.user.role,
      action: 'COTISATIONS_GENEREES_MASSE',
      targetType: 'SYSTEM',
      description: `Génération de ${cotisationsCreees.length} cotisations pour ${mois}`,
      details: {
        mois,
        montant: montant || 3000,
        nombreMembres: users.length,
        nombreCotisationsCreees: cotisationsCreees.length,
        nombreErreurs: errors.length
      },
      montant: (montant || 3000) * cotisationsCreees.length,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: `${cotisationsCreees.length} cotisation(s) créée(s)`,
      data: cotisationsCreees,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



// Supprimer toutes les cotisations (Admin uniquement - ATTENTION : utiliser avec précaution)
exports.deleteAllCotisations = async (req, res) => {
  try {
    // Optionnel : ajouter une confirmation via query parameter
    const { confirm } = req.query;

    if (confirm !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Veuillez confirmer la suppression en ajoutant ?confirm=true à votre requête'
      });
    }

    const result = await Cotisation.deleteMany({});

    // Log de l'action
    await createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.prenom} ${req.user.nom}`,
      userRole: req.user.role,
      action: 'TOUTES_COTISATIONS_SUPPRIMEES',
      targetType: 'SYSTEM',
      description: `Suppression de toutes les cotisations (${result.deletedCount} cotisations)`,
      details: {
        nombreCotisationsSupprimees: result.deletedCount
      },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} cotisation(s) supprimée(s) avec succès`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};








// cotisationController.js

// Générer les cotisations pour des membres spécifiques sélectionnés
exports.genererCotisationsSelectives = async (req, res) => {
  try {
    const { mois, montant, userIds } = req.body; // userIds = tableau d'IDs des membres sélectionnés
    
    console.log('========================================');
    console.log('📋 Génération sélective de cotisations');
    console.log('📅 Mois:', mois);
    console.log('💰 Montant:', montant);
    console.log('👥 Nombre de membres sélectionnés:', userIds?.length || 0);
    console.log('========================================');

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez sélectionner au moins un membre' 
      });
    }

    if (!mois || !montant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mois et montant sont requis' 
      });
    }
    
    // Vérifier que les utilisateurs existent et sont actifs
    const users = await User.find({ 
      _id: { $in: userIds },
      statu: 'actif',
      role: { $ne: 'Admin' }
    });
    
    console.log('✅ Membres actifs trouvés:', users.length);
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun membre actif trouvé parmi la sélection' 
      });
    }
    
    const cotisationsCreees = [];
    const cotisationsExistantes = [];
    const errors = [];
    
    for (const user of users) {
      try {
        // Vérifier si la cotisation existe déjà
        const existing = await Cotisation.findOne({ 
          userId: user._id, 
          mois 
        });
        
        if (existing) {
          console.log(`⚠️ Cotisation existe déjà pour ${user.prenom} ${user.nom}`);
          cotisationsExistantes.push({
            userId: user._id,
            nom: `${user.prenom} ${user.nom}`,
            message: 'Cotisation déjà existante'
          });
        } else {
          const cotisation = await Cotisation.create({
            userId: user._id,
            mois,
            montant,
            statut: 'en_attente'
          });
          console.log(`✅ Cotisation créée pour ${user.prenom} ${user.nom}`);
          cotisationsCreees.push(cotisation);
        }
      } catch (err) {
        console.error(`❌ Erreur pour ${user.prenom} ${user.nom}:`, err.message);
        errors.push({ 
          userId: user._id, 
          nom: `${user.prenom} ${user.nom}`, 
          error: err.message 
        });
      }
    }
    
    console.log('========================================');
    console.log('📊 Résumé:');
    console.log(`✅ Créées: ${cotisationsCreees.length}`);
    console.log(`⚠️ Existantes: ${cotisationsExistantes.length}`);
    console.log(`❌ Erreurs: ${errors.length}`);
    console.log('========================================');

    // Log de l'action
    if (cotisationsCreees.length > 0) {
      await createLog({
        userId: req.user._id,
        userEmail: req.user.email,
        userName: `${req.user.prenom} ${req.user.nom}`,
        userRole: req.user.role,
        action: 'COTISATION_GENEREE',
        targetType: 'SYSTEM',
        description: `Génération sélective de ${cotisationsCreees.length} cotisations pour ${mois}`,
        details: {
          mois,
          montant,
          nombreMembresSelectionnes: userIds.length,
          nombreCotisationsCreees: cotisationsCreees.length,
          nombreExistantes: cotisationsExistantes.length,
          nombreErreurs: errors.length
        },
        montant: montant * cotisationsCreees.length,
        ipAddress: req.ip
      });
    }

    res.status(201).json({
      success: true,
      message: `${cotisationsCreees.length} cotisation(s) créée(s) sur ${userIds.length} membre(s) sélectionné(s)`,
      data: cotisationsCreees,
      existantes: cotisationsExistantes.length > 0 ? cotisationsExistantes : undefined,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        creees: cotisationsCreees.length,
        existantes: cotisationsExistantes.length,
        erreurs: errors.length,
        total: userIds.length
      }
    });
  } catch (error) {
    console.error('❌ Erreur genererCotisationsSelectives:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};