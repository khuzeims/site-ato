const express = require("express");
const router = express.Router();
const inscriptionController = require("../controllers/inscriptionController");
const verifierToken = require("../middleware/verifierToken");
const verifierCaptcha = require("../middleware/verifierCaptcha");

// Route publique : n'importe qui peut s'inscrire à un événement (protégée par captcha)
router.post("/", verifierCaptcha, inscriptionController.createInscription);

// Routes protégées (réservées à l'admin connecté, données personnelles)
router.get("/", verifierToken, inscriptionController.getAllInscriptions);
router.get("/export/excel", verifierToken, inscriptionController.exportInscriptionsExcel);
router.get("/:id", verifierToken, inscriptionController.getInscriptionById);
router.delete("/:id", verifierToken, inscriptionController.deleteInscription);

module.exports = router;