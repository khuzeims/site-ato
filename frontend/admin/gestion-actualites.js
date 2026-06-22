// Gestion des actualités — protégé par authentification
AdminAuth.requireLogin();

const API_URL_ACTUALITES = '/api/actualites';

const newsTbody = document.getElementById('news-tbody');
const logoutBtn = document.getElementById('logout-btn');
const addNewsBtn = document.getElementById('add-news-btn');

const newsModal = document.getElementById('news-modal');
const newsModalTitle = document.getElementById('news-modal-title');
const newsModalClose = document.getElementById('news-modal-close');
const newsForm = document.getElementById('news-form');
const newsFormStatus = document.getElementById('news-form-status');
const newsSubmitBtn = document.getElementById('news-submit-btn');
const newsPhotoInput = document.getElementById('news-photo');
const newsPhotoPreview = document.getElementById('news-photo-preview');

logoutBtn.addEventListener('click', () => {
    AdminAuth.logout();
});

function formatDate(isoDate) {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

function extraitTexte(contenu, longueur = 80) {
    if (!contenu) return '—';
    const texte = Array.isArray(contenu) ? contenu.join(' ') : contenu;
    return texte.length > longueur ? texte.slice(0, longueur).trim() + '…' : texte;
}

// ----- CHARGEMENT DE LA LISTE -----

async function chargerActualites() {
    try {
        const response = await fetch(API_URL_ACTUALITES, {
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const actualites = await response.json();
        afficherActualites(actualites);

    } catch (error) {
        console.error('Erreur lors du chargement des actualités :', error);
        newsTbody.innerHTML = `
            <tr><td colspan="5" class="admin-table-error">
                Impossible de charger les actualités. Le service est peut-être indisponible.
            </td></tr>`;
    }
}

function afficherActualites(actualites) {
    if (!actualites || actualites.length === 0) {
        newsTbody.innerHTML = '<tr><td colspan="5" class="admin-table-empty">Aucune actualité pour le moment.</td></tr>';
        return;
    }

    newsTbody.innerHTML = actualites.map((n) => `
        <tr data-id="${n._id}">
            <td>
                ${n.photo
                    ? `<img src="${n.photo}" alt="${n.titre}" class="admin-table-thumb">`
                    : '<span class="admin-table-nothumb">—</span>'}
            </td>
            <td>${n.titre}</td>
            <td>${formatDate(n.datePublication)}</td>
            <td class="admin-table-excerpt">${extraitTexte(n.contenu)}</td>
            <td class="admin-actions">
                <button class="admin-action-edit" data-id="${n._id}">Modifier</button>
                <button class="admin-action-delete" data-id="${n._id}">Supprimer</button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.admin-action-edit').forEach((btn) => {
        btn.addEventListener('click', () => ouvrirModaleEdition(btn.dataset.id, actualites));
    });

    document.querySelectorAll('.admin-action-delete').forEach((btn) => {
        btn.addEventListener('click', () => supprimerActualite(btn.dataset.id));
    });
}

// ----- MODALE AJOUT / MODIFICATION -----

function ouvrirModaleAjout() {
    newsForm.reset();
    document.getElementById('news-id').value = '';
    newsModalTitle.textContent = 'Ajouter une actualité';
    newsPhotoPreview.hidden = true;
    newsFormStatus.textContent = '';
    newsFormStatus.className = 'form-status';
    newsModal.hidden = false;
}

function ouvrirModaleEdition(id, actualites) {
    const actualite = actualites.find((n) => n._id === id);
    if (!actualite) return;

    document.getElementById('news-id').value = actualite._id;
    document.getElementById('news-titre').value = actualite.titre;
    document.getElementById('news-date').value = actualite.datePublication;

    const contenuTexte = Array.isArray(actualite.contenu)
        ? actualite.contenu.join('\n')
        : (actualite.contenu || '');
    document.getElementById('news-contenu').value = contenuTexte;

    if (actualite.photo) {
        newsPhotoPreview.src = actualite.photo;
        newsPhotoPreview.hidden = false;
    } else {
        newsPhotoPreview.hidden = true;
    }

    newsModalTitle.textContent = 'Modifier l\'actualité';
    newsFormStatus.textContent = '';
    newsFormStatus.className = 'form-status';
    newsModal.hidden = false;
}

function fermerModale() {
    newsModal.hidden = true;
}

addNewsBtn.addEventListener('click', ouvrirModaleAjout);
newsModalClose.addEventListener('click', fermerModale);
newsModal.addEventListener('click', (event) => {
    if (event.target === newsModal) fermerModale();
});

newsPhotoInput.addEventListener('change', () => {
    const file = newsPhotoInput.files[0];
    if (file) {
        newsPhotoPreview.src = URL.createObjectURL(file);
        newsPhotoPreview.hidden = false;
    }
});

// ----- ENVOI DU FORMULAIRE (ajout ou modification) -----

newsForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!newsForm.checkValidity()) {
        newsFormStatus.textContent = 'Merci de remplir tous les champs obligatoires (*).';
        newsFormStatus.className = 'form-status error';
        return;
    }

    const id = document.getElementById('news-id').value;
    const isEdition = !!id;

    // Le contenu est découpé en paragraphes (un par ligne non vide)
    const contenuLignes = document.getElementById('news-contenu').value
        .split('\n')
        .map((ligne) => ligne.trim())
        .filter((ligne) => ligne.length > 0);

    // FormData utilisé car on envoie potentiellement un fichier (photo)
    const formData = new FormData();
    formData.append('titre', document.getElementById('news-titre').value.trim());
    formData.append('datePublication', document.getElementById('news-date').value);
    formData.append('contenu', JSON.stringify(contenuLignes));

    const photoFile = newsPhotoInput.files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    newsSubmitBtn.disabled = true;
    newsSubmitBtn.textContent = 'Enregistrement...';
    newsFormStatus.textContent = '';
    newsFormStatus.className = 'form-status';

    try {
        const url = isEdition ? `${API_URL_ACTUALITES}/${id}` : API_URL_ACTUALITES;
        const method = isEdition ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: AdminAuth.authHeaders(), // pas de Content-Type : FormData le définit automatiquement
            body: formData
        });

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        fermerModale();
        chargerActualites();

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'actualité :', error);
        newsFormStatus.textContent = 'Le service est momentanément indisponible. Merci de réessayer plus tard.';
        newsFormStatus.className = 'form-status error';
    } finally {
        newsSubmitBtn.disabled = false;
        newsSubmitBtn.textContent = 'Enregistrer';
    }
});

// ----- SUPPRESSION -----

async function supprimerActualite(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette actualité ? Cette action est irréversible.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL_ACTUALITES}/${id}`, {
            method: 'DELETE',
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        chargerActualites();

    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        alert('La suppression a échoué. Merci de réessayer.');
    }
}

// Chargement initial
chargerActualites();