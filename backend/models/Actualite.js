const mongoose = require("mongoose");

const actualiteSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true
    },
    datePublication: {
        type: String, // format "AAAA-MM-JJ"
        required: true
    },
    contenu: {
        type: [String], // un paragraphe par élément du tableau
        required: true
    },
    photo: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Actualite", actualiteSchema);