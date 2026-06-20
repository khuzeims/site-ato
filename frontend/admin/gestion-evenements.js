// Gestion des événements — protégé par authentification
AdminAuth.requireLogin();

const API_URL_EVENEMENTS = '/api/evenements';

const eventsTbody = document.getElementById('events-tbody');
const logoutBtn = document.getElementById('logout-btn');
const addEventBtn = document.getElementById('add-event-btn');

const eventModal = document.getElementById('event-modal');
const eventModalTitle = document.getElementById('event-modal-title');
const eventModalClose = document.getElementById('event-modal-close');
const eventForm = document.getElementById('event-form');
const eventFormStatus = document.getElementById('event-form-status');
const eventSubmitBtn = document.getElementById('event-submit-btn');
const eventPhotoInput = document.getElementById('event-photo');
const eventPhotoPreview = document.getElementById('event-photo-preview');

logoutBtn.addEventListener('click', () => {
    AdminAuth.logout();
});

function formatDate(isoDate) {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

// ----- CHARGEMENT DE LA LISTE -----

async function chargerEvenements() {
    try {
        const response = await fetch(API_URL_EVENEMENTS, {
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const evenements = await response.json();
        afficherEvenements(evenements);

    } catch (error) {
        console.error('Erreur lors du chargement des événements :', error);
        eventsTbody.innerHTML = `
            <tr><td colspan="7" class="admin-table-error">
                Impossible de charger les événements. Le service est peut-être indisponible.
            </td></tr>`;
    }
}

function afficherEvenements(evenements) {
    if (!evenements || evenements.length === 0) {
        eventsTbody.innerHTML = '<tr><td colspan="7" class="admin-table-empty">Aucun événement pour le moment.</td></tr>';
        return;
    }

    eventsTbody.innerHTML = evenements.map((e) => `
        <tr data-id="${e._id}">
            <td>
                ${e.photo
                    ? `<img src="${e.photo}" alt="${e.titre}" class="admin-table-thumb">`
                    : '<span class="admin-table-nothumb">—</span>'}
            </td>
            <td>${e.titre}</td>
            <td>${formatDate(e.date)}</td>
            <td>${e.lieu}</td>
            <td>${e.placesDisponibles}</td>
            <td><span class="admin-badge admin-badge-${e.statut === 'à venir' ? 'upcoming' : e.statut === 'annulé' ? 'cancelled' : 'past'}">${e.statut}</span></td>
            <td class="admin-actions">
                <button class="admin-action-edit" data-id="${e._id}">Modifier</button>
                <button class="admin-action-delete" data-id="${e._id}">Supprimer</button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.admin-action-edit').forEach((btn) => {
        btn.addEventListener('click', () => ouvrirModaleEdition(btn.dataset.id, evenements));
    });

    document.querySelectorAll('.admin-action-delete').forEach((btn) => {
        btn.addEventListener('click', () => supprimerEvenement(btn.dataset.id));
    });
}

// ----- MODALE AJOUT / MODIFICATION -----

function ouvrirModaleAjout() {
    eventForm.reset();
    document.getElementById('event-id').value = '';
    eventModalTitle.textContent = 'Ajouter un événement';
    eventPhotoPreview.hidden = true;
    eventFormStatus.textContent = '';
    eventFormStatus.className = 'form-status';
    eventModal.hidden = false;
}

function ouvrirModaleEdition(id, evenements) {
    const evenement = evenements.find((e) => e._id === id);
    if (!evenement) return;

    document.getElementById('event-id').value = evenement._id;
    document.getElementById('event-titre').value = evenement.titre;
    document.getElementById('event-description').value = evenement.description;
    document.getElementById('event-date').value = evenement.date;
    document.getElementById('event-lieu').value = evenement.lieu;
    document.getElementById('event-places').value = evenement.placesDisponibles;
    document.getElementById('event-statut').value = evenement.statut;

    if (evenement.photo) {
        eventPhotoPreview.src = evenement.photo;
        eventPhotoPreview.hidden = false;
    } else {
        eventPhotoPreview.hidden = true;
    }

    eventModalTitle.textContent = 'Modifier l\'événement';
    eventFormStatus.textContent = '';
    eventFormStatus.className = 'form-status';
    eventModal.hidden = false;
}

function fermerModale() {
    eventModal.hidden = true;
}

addEventBtn.addEventListener('click', ouvrirModaleAjout);
eventModalClose.addEventListener('click', fermerModale);
eventModal.addEventListener('click', (event) => {
    if (event.target === eventModal) fermerModale();
});

eventPhotoInput.addEventListener('change', () => {
    const file = eventPhotoInput.files[0];
    if (file) {
        eventPhotoPreview.src = URL.createObjectURL(file);
        eventPhotoPreview.hidden = false;
    }
});

// ----- ENVOI DU FORMULAIRE (ajout ou modification) -----

eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!eventForm.checkValidity()) {
        eventFormStatus.textContent = 'Merci de remplir tous les champs obligatoires (*).';
        eventFormStatus.className = 'form-status error';
        return;
    }

    const id = document.getElementById('event-id').value;
    const isEdition = !!id;

    // FormData utilisé car on envoie potentiellement un fichier (photo)
    const formData = new FormData();
    formData.append('titre', document.getElementById('event-titre').value.trim());
    formData.append('description', document.getElementById('event-description').value.trim());
    formData.append('date', document.getElementById('event-date').value);
    formData.append('lieu', document.getElementById('event-lieu').value.trim());
    formData.append('placesDisponibles', document.getElementById('event-places').value);
    formData.append('statut', document.getElementById('event-statut').value);

    const photoFile = eventPhotoInput.files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    eventSubmitBtn.disabled = true;
    eventSubmitBtn.textContent = 'Enregistrement...';
    eventFormStatus.textContent = '';
    eventFormStatus.className = 'form-status';

    try {
        const url = isEdition ? `${API_URL_EVENEMENTS}/${id}` : API_URL_EVENEMENTS;
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
        chargerEvenements();

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'événement :', error);
        eventFormStatus.textContent = 'Le service est momentanément indisponible. Merci de réessayer plus tard.';
        eventFormStatus.className = 'form-status error';
    } finally {
        eventSubmitBtn.disabled = false;
        eventSubmitBtn.textContent = 'Enregistrer';
    }
});

// ----- SUPPRESSION -----

async function supprimerEvenement(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL_EVENEMENTS}/${id}`, {
            method: 'DELETE',
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        chargerEvenements();

    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        alert('La suppression a échoué. Merci de réessayer.');
    }
}

// Chargement initial
chargerEvenements();