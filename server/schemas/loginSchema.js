const mongoose = require("mongoose");
const COLLECTION_NAME = "users";

// Définition du schéma pour la collection 'users'
const LoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Création des modèles correspondants aux schémas
const UserModel = mongoose.model(COLLECTION_NAME, LoginSchema);


// Export des modèles
module.exports = UserModel;
