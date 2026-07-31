// Script à exécuter UNE SEULE FOIS pour créer le compte admin initial.
// Usage : node creerAdmin.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const EMAIL_ADMIN = "admin@ato.fr";
const MOT_DE_PASSE_ADMIN = "admin123"; // à changer après la première connexion si possible

async function creerAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connecté");

        const adminExistant = await Admin.findOne({ email: EMAIL_ADMIN });
        if (adminExistant) {
            console.log("Un admin avec cet email existe déjà. Aucune action effectuée.");
            process.exit(0);
        }

        // Hashage du mot de passe avant stockage (jamais en clair !)
        const motDePasseHash = await bcrypt.hash(MOT_DE_PASSE_ADMIN, 10);

        const nouvelAdmin = new Admin({
            email: EMAIL_ADMIN,
            motDePasse: motDePasseHash,
            role: "admin"
        });

        await nouvelAdmin.save();
        console.log("Compte admin créé avec succès !");
        console.log("Email :", EMAIL_ADMIN);
        console.log("Mot de passe (en clair, pour info) :", MOT_DE_PASSE_ADMIN);

        process.exit(0);

    } catch (error) {
        console.error("Erreur lors de la création de l'admin :", error);
        process.exit(1);
    }
}

creerAdmin();
