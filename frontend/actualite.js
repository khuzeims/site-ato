// Charge le détail d'une actualité depuis l'API, selon l'id passé dans l'URL (?id=...)
const API_URL_ACTUALITES = '/api/actualites';

function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function formatDateLongue(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function afficherArticle() {
    const id = getParam('id');

    const titleEl = document.getElementById('article-title');
    const dateEl = document.getElementById('article-date');
    const imageEl = document.getElementById('article-image');
    const bodyEl = document.getElementById('article-body');
    const pageTitleEl = document.getElementById('page-title');

    if (!id) {
        titleEl.textContent = "Actualité introuvable";
        bodyEl.innerHTML = "<p>Aucune actualité n'a été demandée.</p>";
        return;
    }

    try {
        const response = await fetch(API_URL_ACTUALITES + '/' + id);

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const actualite = await response.json();

        titleEl.textContent = actualite.titre;
        dateEl.textContent = formatDateLongue(actualite.datePublication);
        pageTitleEl.textContent = actualite.titre + " — Association des Tchadiens d'Occitanie";

        if (actualite.photo) {
            imageEl.innerHTML = `<img src="${actualite.photo}" alt="${actualite.titre}">`;
        } else {
            imageEl.innerHTML = '';
        }

        const paragraphes = Array.isArray(actualite.contenu) ? actualite.contenu : [actualite.contenu];
        bodyEl.innerHTML = paragraphes.map(p => `<p>${p}</p>`).join('');

    } catch (error) {
        console.error('Erreur lors du chargement de l\'actualité :', error);
        titleEl.textContent = "Actualité introuvable";
        dateEl.textContent = "";
        bodyEl.innerHTML = "<p>Cette actualité n'existe pas, a été supprimée, ou le service est momentanément indisponible.</p>";
    }
}

afficherArticle();