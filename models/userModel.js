const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
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
    minLength: [9, "Le numéro doit avoir au moins 9 chiffres!"],
    maxLength: [14, "Le numéro doit avoir max 15 chiffres!"],
  },
  sexe: {
    type: String,
    required: [true, "Le sexe est obligatoire!"],
    enum: ["Male", "Female"],
  },
  email: {
    type: String,
    required: [true, "Email obligatoire!"],
    unique: true,
    validate: [validator.isEmail, "Entrer un email valide!"],
  },
  mdp: {
    type: String,
    required: [true, "Mot de passe obligatoire!"],
    minLength: [8, "Mot de passe doit avoir minimum 8 caractères!"],
    select: false,
  },
  statu: {
    type: String,
    required: [true, "Status obligatoire!"],
    enum: ["actif", "suspendu", "bani"],
  },
  role: {
    type: String,
    required: [true, "role obligatoire!"],
    enum: ["membre", "bureau", "Admin", "finance"],
  },
  cotisation: {
    type: String,
    required: [true, "type obligatoire!"],
    enum: ["mensuel", "trimestriel"],
  },
  resetPasswordCode: String,
  resetPasswordExpire: Date
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("mdp")) {
    return next();
  }

  // Vérifier si le mot de passe est déjà hashé (bcrypt hashes start with $2b$ or $2a$)
  if (this.mdp && this.mdp.startsWith('$2')) {
    return next();
  }

  this.mdp = await bcrypt.hash(this.mdp, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.mdp);
};

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES.trim(), // Assurez-vous de supprimer les espaces
  });
};

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.mdp);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
