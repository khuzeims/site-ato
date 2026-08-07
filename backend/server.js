const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// GESTION DES URLS PROPRES (SANS .html)
// À placer AVANT express.static !
// ============================================

// 1) Redirige les anciennes URLs en .html vers la version propre
//    Ex: /contact.html -> /contact (redirection 301 = permanente)
app.use((req, res, next) => {
    if (req.path.endsWith(".html")) {
        const cleanPath = req.path.slice(0, -5); // enlève les 5 caractères ".html"
        const target = cleanPath === "/index" ? "/" : cleanPath;
        const queryString = req.url.slice(req.path.length);
        return res.redirect(301, target + queryString);
    }
    next();
});

// 2) Sert le bon fichier .html quand l'URL n'a pas d'extension
//    Ex: /contact -> sert frontend/contact.html en interne (l'URL ne change pas)
app.use((req, res, next) => {
    // On laisse passer les routes API et les uploads sans y toucher
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
    }

    // Si l'URL n'a pas d'extension (pas de .css, .js, .png, etc.)
    if (!path.extname(req.path)) {
        const htmlPath = path.join(__dirname, "..", "frontend", req.path + ".html");
        fs.access(htmlPath, fs.constants.F_OK, (err) => {
            if (!err) {
                return res.sendFile(htmlPath);
            }
            next(); // pas trouvé -> on laisse express.static gérer (ex: "/" -> index.html)
        });
    } else {
        next();
    }
});

// ============================================
// FICHIERS STATIQUES DU FRONTEND
// ============================================
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