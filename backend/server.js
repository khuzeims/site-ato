const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// SERVIR LES FICHIERS STATIQUES DU FRONTEND
// Le dossier "frontend" est au même niveau que "backend", donc on remonte d'un niveau (..)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// SERVIR LES PHOTOS UPLOADÉES (événements, actualités)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES API
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const evenementRoutes = require("./routes/evenementRoutes");
app.use("/api/evenements", evenementRoutes);

const actualiteRoutes = require("./routes/actualiteRoutes");
app.use("/api/actualites", actualiteRoutes);

const adhesionRoutes = require("./routes/adhesionRoutes");
app.use("/api/adhesions", adhesionRoutes);

const inscriptionRoutes = require("./routes/inscriptionRoutes");
app.use("/api/inscriptions", inscriptionRoutes);

// MIDDLEWARE DE GESTION D'ERREURS (doit être placé après toutes les routes)
const multer = require("multer");
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Une ou plusieurs photos dépassent la taille maximale autorisée (10 Mo)." });
        }
        return res.status(400).json({ message: "Erreur lors de l'envoi du fichier : " + error.message });
    }

    if (error) {
        console.error("Erreur non gérée :", error);
        return res.status(500).json({ message: "Une erreur inattendue est survenue.", erreur: error.message });
    }

    next();
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connecté"))
    .catch(err => console.log(err));

app.listen(process.env.PORT, () => {
    console.log("Serveur démarré sur le port 5000");
});