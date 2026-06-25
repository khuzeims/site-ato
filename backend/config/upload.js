const multer = require("multer");
const path = require("path");

// Configuration du stockage : où et comment les fichiers sont enregistrés sur le disque
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: function (req, file, cb) {
        // Nom unique : timestamp + nom original, pour éviter les doublons/écrasements
        const nomUnique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, nomUnique);
    }
});

// Filtre : on n'accepte que les images (jpg, jpeg, png, webp)
function filtrerFichiers(req, file, cb) {
    const typesAutorises = /jpeg|jpg|png|webp/;
    const extensionValide = typesAutorises.test(path.extname(file.originalname).toLowerCase());
    const mimeTypeValide = typesAutorises.test(file.mimetype);

    if (extensionValide && mimeTypeValide) {
        cb(null, true);
    } else {
        cb(new Error("Seules les images JPG, PNG ou WEBP sont autorisées."));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: filtrerFichiers,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo maximum par photo
});

module.exports = upload;