const mongoose = require('mongoose');

const cotisationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mois: {
    type: String,
    required: true // Format: "2025-01" pour janvier 2025
  },
  montant: {
    type: Number,
    required: true
  },
  statut: {
    type: String,
    enum: ['payé', 'en_attente', 'en_retard'],
    default: 'en_attente'
  },
  datePaiement: {
    type: Date,
    default: null
  },
  methodePaiement: {
    type: String,
    enum: ['espèces', 'virement', 'carte', 'mobile'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Cotisation = mongoose.model('Cotisation', cotisationSchema);
module.exports = Cotisation;