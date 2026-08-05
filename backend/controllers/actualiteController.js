const Actualite = require("../models/Actualite");

// GET /api/actualites — liste toutes les actualités
exports.getAllActualites = async (req, res) => {
    try {
        const actualites = await Actualite.find().sort({ datePublication: -1 });
        res.json(actualites);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des actualités.", erreur: error.message });
    }
};

// GET /api/actualites/:id — une seule actualité
exports.getActualiteById = async (req, res) => {
    try {
        const actualite = await Actualite.findById(req.params.id);
        if (!actualite) {
            return res.status(404).json({ message: "Actualité introuvable." });
        }
        res.json(actualite);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'actualité.", erreur: error.message });
    }
};

// POST /api/actualites — créer une actualité
exports.createActualite = async (req, res) => {
    try {
        const { titre, datePublication, contenu } = req.body;

        // contenu peut arriver en JSON stringifié (depuis le formulaire admin avec FormData)
        const contenuParsed = typeof contenu === "string" ? JSON.parse(contenu) : contenu;

        const nouvelleActualite = new Actualite({
            titre,
            datePublication,
            contenu: contenuParsed,
            photo: req.file ? req.file.path : null
        });

        const actualiteEnregistree = await nouvelleActualite.save();
        res.status(201).json(actualiteEnregistree);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de l'actualité.", erreur: error.message });
    }
};

// PUT /api/actualites/:id — modifier une actualité
exports.updateActualite = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (typeof updateData.contenu === "string") {
            updateData.contenu = JSON.parse(updateData.contenu);
        }

        if (req.file) {
        updateData.photo = req.file.path;
        }

        const actualiteModifiee = await Actualite.findByIdAndUpdate(
        req.params.id,
        updateData,
        { returnDocument: "after", runValidators: true }
        );

        if (!actualiteModifiee) {
            return res.status(404).json({ message: "Actualité introuvable." });
        }

        res.json(actualiteModifiee);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la modification de l'actualité.", erreur: error.message });
    }
};

// DELETE /api/actualites/:id — supprimer une actualité
exports.deleteActualite = async (req, res) => {
    try {
        const actualiteSupprimee = await Actualite.findByIdAndDelete(req.params.id);

        if (!actualiteSupprimee) {
            return res.status(404).json({ message: "Actualité introuvable." });
        }

        res.json({ message: "Actualité supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'actualité.", erreur: error.message });
    }
};