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

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connecté"))
    .catch(err => console.log(err));

app.listen(process.env.PORT, () => {
    console.log("Serveur démarré sur le port 5000");
});