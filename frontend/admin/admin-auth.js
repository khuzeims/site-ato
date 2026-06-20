// Module partagé d'authentification admin
// Stocke le token JWT reçu après connexion, et permet de protéger les pages admin.

const ADMIN_TOKEN_KEY = 'ato_admin_token';

const AdminAuth = {
    setToken(token) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    },

    getToken() {
        return sessionStorage.getItem(ADMIN_TOKEN_KEY);
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    logout() {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        window.location.href = 'login.html';
    },

    // À appeler en haut de chaque page admin protégée (dashboard, gestion-*.html)
    // Redirige vers la page de connexion si aucun token n'est présent.
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },

    // Pratique pour préparer les headers des appels fetch vers l'API protégée
    authHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }
};