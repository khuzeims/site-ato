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
            photos: req.files ? req.files.map((f) => "uploads/" + f.filename) : []
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

        // Si de nouvelles photos sont envoyées, on les AJOUTE à la galerie existante
        if (req.files && req.files.length > 0) {
            const evenementActuel = await Evenement.findById(req.params.id);
            const photosExistantes = evenementActuel ? evenementActuel.photos : [];
            const nouvellesPhotos = req.files.map((f) => "uploads/" + f.filename);
            updateData.photos = [...photosExistantes, ...nouvellesPhotos];
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