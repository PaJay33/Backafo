const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Actions membres
      'MEMBRE_AJOUTE',
      'MEMBRE_MODIFIE',
      'MEMBRE_SUPPRIME',
      'MEMBRE_SUSPENDU',
      'MEMBRE_REACTIVE',
      'MEMBRE_BANNI',
      // Actions cotisations
      'COTISATION_GENEREE',
      'COTISATION_MARQUEE_PAYEE',
      'COTISATION_MODIFIEE',
      'COTISATION_SUPPRIMEE',
      'COTISATIONS_GENEREES_MASSE',
      'TOUTES_COTISATIONS_SUPPRIMEES'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['USER', 'COTISATION', 'SYSTEM']
  },
  targetId: {
    type: String
  },
  targetName: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  montant: {
    type: Number
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
actionLogSchema.index({ userId: 1, createdAt: -1 });
actionLogSchema.index({ action: 1, createdAt: -1 });
actionLogSchema.index({ createdAt: -1 });
actionLogSchema.index({ targetType: 1, targetId: 1 });

const ActionLog = mongoose.model('ActionLog', actionLogSchema);

module.exports = ActionLog;
