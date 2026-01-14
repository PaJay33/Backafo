const mongoose = require('mongoose');
const validator = require('validator');

const adhesionRequestSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom est obligatoire!"],
    minLength: [3, "Le nom doit avoir au moins 3 caractères!"],
  },
  prenom: {
    type: String,
    required: [true, "Le prénom est obligatoire!"],
    minLength: [3, "Le prénom doit avoir au moins 3 caractères!"],
  },
  num: {
    type: String,
    required: [true, "Le numéro de téléphone est obligatoire!"],
    minLength: [10, "Le numéro doit avoir au moins 10 chiffres!"],
    maxLength: [12, "Le numéro doit avoir max 11 chiffres!"],
  },
  sexe: {
    type: String,
    required: [true, "Le sexe est obligatoire!"],
    enum: ["Male", "Female"],
  },
  email: {
    type: String,
    required: [true, "Email obligatoire!"],
    validate: [validator.isEmail, "Entrer un email valide!"],
  },
  mdp: {
    type: String,
    required: [true, "Mot de passe obligatoire!"],
    minLength: [8, "Mot de passe doit avoir minimum 8 caractères!"],
  },
  cotisation: {
    type: String,
    required: [true, "Type de cotisation obligatoire!"],
    enum: ["mensuel", "trimestriel"],
  },
  statut: {
    type: String,
    required: true,
    enum: ["en_attente", "approuvé", "refusé"],
    default: "en_attente"
  },
  dateDemande: {
    type: Date,
    default: Date.now
  },
  dateTraitement: {
    type: Date
  },
  traitePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  raisonRefus: {
    type: String
  }
});

const AdhesionRequest = mongoose.model('AdhesionRequest', adhesionRequestSchema);
module.exports = AdhesionRequest;
