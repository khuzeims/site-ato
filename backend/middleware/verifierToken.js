const jwt = require("jsonwebtoken");

// Middleware à placer devant toute route admin protégée.
// Vérifie la présence et la validité du token JWT envoyé dans le header Authorization.
function verifierToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // les infos de l'admin (id, email, role) deviennent accessibles dans les routes suivantes
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
}

module.exports = verifierToken;