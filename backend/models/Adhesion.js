const mongoose = require("mongoose");

const adhesionSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    prenom: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    telephone: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        default: ""
    },
    statut: {
        type: String,
        enum: ["en attente", "accepté", "refusé"],
        default: "en attente"
    },
    dateDemande: {
        type: String, // format "AAAA-MM-JJ"
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Adhesion", adhesionSchema);