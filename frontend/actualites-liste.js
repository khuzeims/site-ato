// Charge la liste des actualités depuis l'API et génère les cartes dynamiquement
const API_URL_ACTUALITES = '/api/actualites';

const newsGrid = document.getElementById('news-grid');

function formatDateLongue(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function extraitTexte(contenu, longueur = 220) {
    if (!contenu || contenu.length === 0) return '';
    const texte = Array.isArray(contenu) ? contenu[0] : contenu;
    return texte.length > longueur ? texte.slice(0, longueur).trim() + '…' : texte;
}

async function chargerActualites() {
    try {
        const response = await fetch(API_URL_ACTUALITES);

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const actualites = await response.json();
        afficherActualites(actualites);

    } catch (error) {
        console.error('Erreur lors du chargement des actualités :', error);
        newsGrid.innerHTML = '<p class="news-error">Impossible de charger les actualités pour le moment. Merci de réessayer plus tard.</p>';
    }
}

function afficherActualites(actualites) {
    if (!actualites || actualites.length === 0) {
        newsGrid.innerHTML = '<p class="news-empty">Aucune actualité publiée pour le moment.</p>';
        return;
    }

    // Les plus récentes en premier (l'API les renvoie déjà triées, mais on s'assure ici aussi)
    const actualitesTriees = [...actualites].sort((a, b) =>
        new Date(b.datePublication) - new Date(a.datePublication)
    );

    newsGrid.innerHTML = actualitesTriees.map((actualite) => `
        <article class="news-card">
            <div class="news-thumb">
                ${actualite.photo
                    ? `<img src="${actualite.photo}" alt="${actualite.titre}">`
                    : ''}
            </div>
            <div class="news-body">
                <p class="news-date">${formatDateLongue(actualite.datePublication)}</p>
                <h3>${actualite.titre}</h3>
                <p>${extraitTexte(actualite.contenu)}</p>
                <a href="/actualite?id=${actualite._id}" class="link-arrow">Lire la suite →</a>
            </div>
        </article>
    `).join('');
}

chargerActualites();