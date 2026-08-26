const { envoyerConfirmationAdhesion, notifierAdmin, envoyerChangementStatut } = require("../utils/emailService");
const Adhesion = require("../models/Adhesion");
const ExcelJS = require("exceljs");
// GET /api/adhesions — liste toutes les demandes d'adhésion
exports.getAllAdhesions = async (req, res) => {
    try {
        const adhesions = await Adhesion.find().sort({ dateDemande: -1 });
        res.json(adhesions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des adhésions.", erreur: error.message });
    }
};

// GET /api/adhesions/:id — une seule demande
exports.getAdhesionById = async (req, res) => {
    try {
        const adhesion = await Adhesion.findById(req.params.id);
        if (!adhesion) {
            return res.status(404).json({ message: "Demande d'adhésion introuvable." });
        }
        res.json(adhesion);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'adhésion.", erreur: error.message });
    }
};

// GET /api/adhesions/export/excel — export Excel des demandes d'adhésion
exports.exportAdhesionsExcel = async (req, res) => {
    try {
        const adhesions = await Adhesion.find().sort({ dateDemande: -1 });

        const classeur = new ExcelJS.Workbook();
        const feuille = classeur.addWorksheet("Adhésions");

        feuille.columns = [
            { header: "Nom", key: "nom", width: 20 },
            { header: "Prénom", key: "prenom", width: 20 },
            { header: "Email", key: "email", width: 28 },
            { header: "Téléphone", key: "telephone", width: 16 },
            { header: "Adresse", key: "adresse", width: 30 },
            { header: "Date de la demande", key: "dateDemande", width: 18 },
            { header: "Statut", key: "statut", width: 14 }
        ];

        feuille.getRow(1).font = { bold: true };

        adhesions.forEach((a) => {
            feuille.addRow({
                nom: a.nom,
                prenom: a.prenom,
                email: a.email,
                telephone: a.telephone,
                adresse: a.adresse || "—",
                dateDemande: a.dateDemande ? new Date(a.dateDemande).toLocaleDateString("fr-FR") : "—",
                statut: a.statut
            });
        });

        const nomFichier = `adhesions_${new Date().toISOString().slice(0, 10)}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename="${nomFichier}"`);

        await classeur.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'export Excel.", erreur: error.message });
    }
};

// POST /api/adhesions — créer une demande d'adhésion (formulaire public du site)
// Le captcha est déjà vérifié en amont par le middleware verifierCaptcha (voir adhesionRoutes.js)
exports.createAdhesion = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, adresse, dateDemande } = req.body;

        const nouvelleAdhesion = new Adhesion({
            nom,
            prenom,
            email,
            telephone,
            adresse,
            statut: "en attente",
            dateDemande
        });

        const adhesionEnregistree = await nouvelleAdhesion.save();

        try {
            await envoyerConfirmationAdhesion(adhesionEnregistree.email, nom, prenom);
            await notifierAdmin(
                "Nouvelle demande d'adhésion",
                `<p>${prenom} ${nom} (${email}) vient de faire une demande d'adhésion.</p>
                 <p>Téléphone : ${telephone}<br>Adresse : ${adresse || "non renseignée"}</p>`
            );
        } catch (emailError) {
            console.error("Erreur envoi email adhésion :", emailError.message);
        }

        res.status(201).json(adhesionEnregistree);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de la demande d'adhésion.", erreur: error.message });
    }
};

// PUT /api/adhesions/:id — modifier le statut (utilisé par le dashboard admin)
exports.updateAdhesion = async (req, res) => {
    try {
        const adhesionAvant = await Adhesion.findById(req.params.id);
        if (!adhesionAvant) {
            return res.status(404).json({ message: "Demande d'adhésion introuvable." });
        }

        const statutAvant = adhesionAvant.statut;

        const adhesionModifiee = await Adhesion.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: "after", runValidators: true }
        );

        if (req.body.statut && req.body.statut !== statutAvant) {
            try {
                await envoyerChangementStatut(
                    adhesionModifiee.email,
                    adhesionModifiee.nom,
                    adhesionModifiee.prenom,
                    adhesionModifiee.statut
                );
            } catch (emailError) {
                console.error("Erreur envoi email changement statut :", emailError.message);
            }
        }

        res.json(adhesionModifiee);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la modification de l'adhésion.", erreur: error.message });
    }
};

// DELETE /api/adhesions/:id — supprimer une demande
exports.deleteAdhesion = async (req, res) => {
    try {
        const adhesionSupprimee = await Adhesion.findByIdAndDelete(req.params.id);

        if (!adhesionSupprimee) {
            return res.status(404).json({ message: "Demande d'adhésion introuvable." });
        }

        res.json({ message: "Demande d'adhésion supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'adhésion.", erreur: error.message });
    }
};