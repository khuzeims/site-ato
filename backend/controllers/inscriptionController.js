const Inscription = require("../models/Inscription");

// GET /api/inscriptions — liste toutes les inscriptions, avec le titre de l'événement lié
exports.getAllInscriptions = async (req, res) => {
    try {
        const inscriptions = await Inscription.find()
            .sort({ dateInscription: -1 })
            .populate("evenementId", "titre"); // récupère uniquement le champ "titre" de l'événement lié

        // On reformate la réponse pour que le frontend admin trouve directement "evenementTitre"
        const inscriptionsFormatees = inscriptions.map((i) => ({
            _id: i._id,
            evenementId: i.evenementId?._id || i.evenementId,
            evenementTitre: i.evenementId?.titre || "Événement supprimé",
            nom: i.nom,
            prenom: i.prenom,
            email: i.email,
            telephone: i.telephone,
            tarif: i.tarif,
            dateInscription: i.dateInscription
        }));

        res.json(inscriptionsFormatees);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des inscriptions.", erreur: error.message });
    }
};

// GET /api/inscriptions/:id — une seule inscription
exports.getInscriptionById = async (req, res) => {
    try {
        const inscription = await Inscription.findById(req.params.id).populate("evenementId", "titre");
        if (!inscription) {
            return res.status(404).json({ message: "Inscription introuvable." });
        }
        res.json(inscription);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'inscription.", erreur: error.message });
    }
};

// POST /api/inscriptions — créer une inscription (formulaire public du site)
// Le captcha est déjà vérifié en amont par le middleware verifierCaptcha (voir inscriptionRoutes.js)
exports.createInscription = async (req, res) => {
    try {
        const { evenementId, nom, prenom, email, telephone, tarif, dateInscription } = req.body;

        const nouvelleInscription = new Inscription({
            evenementId,
            nom,
            prenom,
            email,
            telephone,
            tarif,
            dateInscription
        });

        const inscriptionEnregistree = await nouvelleInscription.save();
        res.status(201).json(inscriptionEnregistree);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de l'inscription.", erreur: error.message });
    }
};

// DELETE /api/inscriptions/:id — supprimer une inscription
exports.deleteInscription = async (req, res) => {
    try {
        const inscriptionSupprimee = await Inscription.findByIdAndDelete(req.params.id);

        if (!inscriptionSupprimee) {
            return res.status(404).json({ message: "Inscription introuvable." });
        }

        res.json({ message: "Inscription supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'inscription.", erreur: error.message });
    }
};