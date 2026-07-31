const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Configuration du stockage : les fichiers sont envoyés directement vers Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "asso-tchadiens", // dossier créé automatiquement sur Cloudinary
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 1200, crop: "limit" }],
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo maximum par photo
});

module.exports = upload;