const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/auth/login — connexion admin
exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        if (!email || !motDePasse) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }

        // On cherche l'admin par email
        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.status(401).json({ message: "Identifiants incorrects." });
        }

        // On compare le mot de passe envoyé avec le hash stocké en base
        const motDePasseValide = await bcrypt.compare(motDePasse, admin.motDePasse);

        if (!motDePasseValide) {
            return res.status(401).json({ message: "Identifiants incorrects." });
        }

        // Génération du token JWT, valable 24h
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion.", erreur: error.message });
    }
};