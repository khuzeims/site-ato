const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema({
    evenementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Evenement",
        required: true
    },
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
    tarif: {
        type: String,
        enum: ["adherent", "non-adherent", "gratuit"],
        default: "gratuit",
        required: false
    },
    dateInscription: {
        type: String, // format "AAAA-MM-JJ"
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Inscription", inscriptionSchema);