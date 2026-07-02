const axios = require("axios");

// Middleware à placer sur les routes publiques sensibles (adhésion, inscription)
// Vérifie auprès de Google que le token reCAPTCHA envoyé par le formulaire est valide.
async function verifierCaptcha(req, res, next) {
    try {
        const token = req.body.captchaToken;

        if (!token) {
            return res.status(400).json({ message: "Veuillez valider le captcha avant d'envoyer le formulaire." });
        }

        const reponse = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: token
                }
            }
        );

        if (!reponse.data.success) {
            return res.status(400).json({ message: "Validation du captcha échouée. Merci de réessayer." });
        }

        next(); // captcha valide, on laisse passer vers le contrôleur

    } catch (error) {
        console.error("Erreur lors de la vérification du captcha :", error.message);
        return res.status(500).json({ message: "Impossible de vérifier le captcha pour le moment." });
    }
}

module.exports = verifierCaptcha;