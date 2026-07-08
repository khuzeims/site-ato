const transporter = require("../config/mailer");

const FROM = `"ATO - Association des Tchadiens d'Occitanie" <${process.env.EMAIL_USER}>`;

// 1. Confirmation d'adhésion (au demandeur)
async function envoyerConfirmationAdhesion(destinataire, nom, prenom) {
    return transporter.sendMail({
        from: FROM,
        to: destinataire,
        subject: "Votre demande d'adhésion à l'ATO",
        html: `
            <h2>Bonjour ${prenom} ${nom},</h2>
            <p>Nous avons bien reçu votre demande d'adhésion à l'Association des Tchadiens d'Occitanie.</p>
            <p>Elle est en cours d'examen par notre équipe. Vous recevrez un email dès qu'une décision sera prise.</p>
            <p>Cordialement,<br>L'équipe ATO</p>
        `,
    });
}

// 2. Confirmation d'inscription à un événement (au participant)
async function envoyerConfirmationInscription(destinataire, nom, prenom, titreEvenement) {
    return transporter.sendMail({
        from: FROM,
        to: destinataire,
        subject: `Inscription confirmée : ${titreEvenement}`,
        html: `
            <h2>Bonjour ${prenom} ${nom},</h2>
            <p>Votre inscription à l'événement <strong>${titreEvenement}</strong> a bien été enregistrée.</p>
            <p>À très bientôt !</p>
            <p>Cordialement,<br>L'équipe ATO</p>
        `,
    });
}

// 3. Notification admin (nouvelle demande/inscription)
async function notifierAdmin(sujet, contenuHtml) {
    return transporter.sendMail({
        from: FROM,
        to: process.env.ADMIN_EMAIL,
        subject: sujet,
        html: contenuHtml,
    });
}

// 4. Changement de statut d'adhésion (valeurs enum réelles : "accepté" / "refusé")
async function envoyerChangementStatut(destinataire, nom, prenom, statut) {
    const messages = {
        "accepté": "Votre adhésion a été acceptée ! Bienvenue à l'ATO.",
        "refusé": "Votre demande d'adhésion n'a malheureusement pas été retenue.",
    };
    return transporter.sendMail({
        from: FROM,
        to: destinataire,
        subject: "Mise à jour de votre statut d'adhésion",
        html: `
            <h2>Bonjour ${prenom} ${nom},</h2>
            <p>${messages[statut] || "Le statut de votre adhésion a été mis à jour."}</p>
            <p>Cordialement,<br>L'équipe ATO</p>
        `,
    });
}

module.exports = {
    envoyerConfirmationAdhesion,
    envoyerConfirmationInscription,
    notifierAdmin,
    envoyerChangementStatut,
};