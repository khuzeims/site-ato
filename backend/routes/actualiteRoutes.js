const express = require("express");
const router = express.Router();
const actualiteController = require("../controllers/actualiteController");
const verifierToken = require("../middleware/verifierToken");
const upload = require("../config/upload");

// Routes publiques (lecture libre, utilisées par le site public)
router.get("/", actualiteController.getAllActualites);
router.get("/:id", actualiteController.getActualiteById);

// Routes protégées (réservées à l'admin connecté)
router.post("/", verifierToken, upload.single("photo"), actualiteController.createActualite);
router.put("/:id", verifierToken, upload.single("photo"), actualiteController.updateActualite);
router.delete("/:id", verifierToken, actualiteController.deleteActualite);

module.exports = router;