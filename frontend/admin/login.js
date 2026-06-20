// Connexion admin — envoie vers l'API backend (collection "admin")
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const loginSubmitBtn = document.getElementById('login-submit-btn');

// URL de l'API. À adapter selon l'environnement (local ou déployé).
const API_URL_LOGIN = '/api/auth/login';

// Si déjà connecté, on passe directement au dashboard.
if (AdminAuth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!loginForm.checkValidity()) {
            loginStatus.textContent = 'Merci de remplir tous les champs.';
            loginStatus.className = 'form-status error';
            return;
        }

        const payload = {
            email: document.getElementById('email').value.trim(),
            motDePasse: document.getElementById('motDePasse').value
        };

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = "Connexion en cours...";
        loginStatus.textContent = '';
        loginStatus.className = 'form-status';

        try {
            const response = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Identifiants incorrects.');
                }
                throw new Error('Réponse du serveur incorrecte (' + response.status + ')');
            }

            const data = await response.json();

            // On attend une réponse de la forme { token: "..." } depuis le backend.
            if (!data.token) {
                throw new Error('Le serveur n\'a pas renvoyé de jeton de connexion.');
            }

            AdminAuth.setToken(data.token);
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Erreur de connexion :', error);
            const message = error.message === 'Identifiants incorrects.'
                ? 'Email ou mot de passe incorrect.'
                : 'Le service est momentanément indisponible. Merci de réessayer plus tard.';
            loginStatus.textContent = message;
            loginStatus.className = 'form-status error';
        } finally {
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.textContent = "Se connecter";
        }
    });
}