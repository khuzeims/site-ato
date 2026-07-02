// Formulaire d'adhésion — envoie vers l'API backend (collection MongoDB "adhesion")
const adhesionForm = document.getElementById('adhesion-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

// URL de l'API. À adapter selon l'environnement (local ou déployé).
const API_URL = '/api/adhesions';

if (adhesionForm) {
    adhesionForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!adhesionForm.checkValidity()) {
            formStatus.textContent = 'Merci de remplir tous les champs obligatoires (*).';
            formStatus.className = 'form-status error';
            return;
        }

        const captchaToken = grecaptcha.getResponse();
        if (!captchaToken) {
            formStatus.textContent = 'Merci de valider le captcha avant d\'envoyer le formulaire.';
            formStatus.className = 'form-status error';
            return;
        }

        // Construction de l'objet envoyé à l'API, conforme au schéma MongoDB :
        // { nom, prenom, email, telephone, adresse, statut, dateDemande, captchaToken }
        const payload = {
            nom: document.getElementById('nom').value.trim(),
            prenom: document.getElementById('prenom').value.trim(),
            email: document.getElementById('email').value.trim(),
            telephone: document.getElementById('telephone').value.trim(),
            adresse: document.getElementById('adresse').value.trim(),
            statut: "en attente",
            dateDemande: new Date().toISOString().slice(0, 10), // format "AAAA-MM-JJ"
            captchaToken: captchaToken
        };

        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // On affiche le message précis renvoyé par le serveur (ex: captcha invalide),
                // plutôt qu'un message générique qui masquerait la vraie cause.
                throw new Error(data.message || ('Réponse du serveur incorrecte (' + response.status + ')'));
            }

            formStatus.textContent = 'Votre demande a bien été envoyée. Nous reviendrons vers vous rapidement.';
            formStatus.className = 'form-status success';
            adhesionForm.reset();
            grecaptcha.reset();

        } catch (error) {
            console.error('Erreur lors de l\'envoi du formulaire :', error);
            formStatus.textContent = error.message || 'Le service est momentanément indisponible. Merci de réessayer plus tard ou de nous contacter directement par e-mail.';
            formStatus.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Envoyer ma demande";
        }
    });
}