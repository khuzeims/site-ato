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

        // Construction de l'objet envoyé à l'API, conforme au schéma MongoDB :
        // { nom, prenom, email, telephone, adresse, statut, dateDemande }
        const payload = {
            nom: document.getElementById('nom').value.trim(),
            prenom: document.getElementById('prenom').value.trim(),
            email: document.getElementById('email').value.trim(),
            telephone: document.getElementById('telephone').value.trim(),
            adresse: document.getElementById('adresse').value.trim(),
            statut: "en attente",
            dateDemande: new Date().toISOString().slice(0, 10) // format "AAAA-MM-JJ"
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

            if (!response.ok) {
                throw new Error('Réponse du serveur incorrecte (' + response.status + ')');
            }

            formStatus.textContent = 'Votre demande a bien été envoyée. Nous reviendrons vers vous rapidement.';
            formStatus.className = 'form-status success';
            adhesionForm.reset();

        } catch (error) {
            // Le backend n'est pas encore disponible, ou une erreur réseau est survenue.
            console.error('Erreur lors de l\'envoi du formulaire :', error);
            formStatus.textContent = 'Le service est momentanément indisponible. Merci de réessayer plus tard ou de nous contacter directement par e-mail.';
            formStatus.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Envoyer ma demande";
        }
    });
}