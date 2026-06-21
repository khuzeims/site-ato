const express = require("express");
const router = express.Router();
const actualiteController = require("../controllers/actualiteController");

router.get("/", actualiteController.getAllActualites);
router.get("/:id", actualiteController.getActualiteById);
router.post("/", actualiteController.createActualite);
router.put("/:id", actualiteController.updateActualite);
router.delete("/:id", actualiteController.deleteActualite);

module.exports = router;