const mongoose = require("mongoose");

const evenementSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String, // format "AAAA-MM-JJ", cohérent avec le frontend
        required: true
    },
    lieu: {
        type: String,
        required: true,
        trim: true
    },
    placesDisponibles: {
        type: Number,
        required: true,
        min: 0
    },
    statut: {
        type: String,
        enum: ["à venir", "passé", "annulé"],
        default: "à venir"
    },
    photo: {
        type: String, // chemin ou URL vers l'image uploadée
        default: null
    }
}, {
    timestamps: true // ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model("Evenement", evenementSchema);