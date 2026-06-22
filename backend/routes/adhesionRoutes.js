const express = require("express");
const router = express.Router();
const adhesionController = require("../controllers/adhesionController");
const verifierToken = require("../middleware/verifierToken");

// Route publique : n'importe qui peut soumettre une demande d'adhésion
router.post("/", adhesionController.createAdhesion);

// Routes protégées (réservées à l'admin connecté, données personnelles)
router.get("/", verifierToken, adhesionController.getAllAdhesions);
router.get("/:id", verifierToken, adhesionController.getAdhesionById);
router.put("/:id", verifierToken, adhesionController.updateAdhesion);
router.delete("/:id", verifierToken, adhesionController.deleteAdhesion);

module.exports = router;