const express = require("express");
const router = express.Router();
const evenementController = require("../controllers/evenementController");
const verifierToken = require("../middleware/verifierToken");
const upload = require("../config/upload");

// Routes publiques (lecture libre, utilisées par le site public)
router.get("/", evenementController.getAllEvenements);
router.get("/:id", evenementController.getEvenementById);

// Routes protégées (réservées à l'admin connecté)
router.post("/", verifierToken, upload.single("photo"), evenementController.createEvenement);
router.put("/:id", verifierToken, upload.single("photo"), evenementController.updateEvenement);
router.delete("/:id", verifierToken, evenementController.deleteEvenement);

module.exports = router;