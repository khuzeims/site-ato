const Evenement = require("../models/Evenement");

// GET /api/evenements — liste tous les événements
exports.getAllEvenements = async (req, res) => {
    try {
        const evenements = await Evenement.find().sort({ date: 1 });
        res.json(evenements);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des événements.", erreur: error.message });
    }
};

// GET /api/evenements/:id — un seul événement
exports.getEvenementById = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: "Événement introuvable." });
        }
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'événement.", erreur: error.message });
    }
};

// POST /api/evenements — créer un événement
exports.createEvenement = async (req, res) => {
    try {
        const { titre, description, date, lieu, placesDisponibles, statut } = req.body;

        const nouvelEvenement = new Evenement({
            titre,
            description,
            date,
            lieu,
            placesDisponibles,
            statut,
            photo: req.file ? "uploads/" + req.file.filename : null
        });

        const evenementEnregistre = await nouvelEvenement.save();
        res.status(201).json(evenementEnregistre);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de l'événement.", erreur: error.message });
    }
};

// PUT /api/evenements/:id — modifier un événement
exports.updateEvenement = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Si une nouvelle photo est envoyée, on remplace l'ancienne référence
        if (req.file) {
            updateData.photo = "uploads/" + req.file.filename;
        }

        const evenementModifie = await Evenement.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!evenementModifie) {
            return res.status(404).json({ message: "Événement introuvable." });
        }

        res.json(evenementModifie);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la modification de l'événement.", erreur: error.message });
    }
};

// DELETE /api/evenements/:id — supprimer un événement
exports.deleteEvenement = async (req, res) => {
    try {
        const evenementSupprime = await Evenement.findByIdAndDelete(req.params.id);

        if (!evenementSupprime) {
            return res.status(404).json({ message: "Événement introuvable." });
        }

        res.json({ message: "Événement supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'événement.", erreur: error.message });
    }
};