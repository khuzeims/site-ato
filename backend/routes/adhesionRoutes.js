const express = require("express");
const router = express.Router();
const adhesionController = require("../controllers/adhesionController");
const verifierToken = require("../middleware/verifierToken");
const verifierCaptcha = require("../middleware/verifierCaptcha");

// Route publique : n'importe qui peut soumettre une demande d'adhésion (protégée par captcha)
router.post("/", verifierCaptcha, adhesionController.createAdhesion);

// Routes protégées (réservées à l'admin connecté, données personnelles)
router.get("/", verifierToken, adhesionController.getAllAdhesions);
router.get("/export/excel", verifierToken, adhesionController.exportAdhesionsExcel);
router.get("/:id", verifierToken, adhesionController.getAdhesionById);
router.put("/:id", verifierToken, adhesionController.updateAdhesion);
router.delete("/:id", verifierToken, adhesionController.deleteAdhesion);

module.exports = router;