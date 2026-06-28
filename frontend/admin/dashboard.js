// Dashboard admin — protégé par authentification
AdminAuth.requireLogin();

const API_URL_ADHESIONS = '/api/adhesions';
const API_URL_INSCRIPTIONS = '/api/inscriptions';

const adhesionsTbody = document.getElementById('adhesions-tbody');
const inscriptionsTbody = document.getElementById('inscriptions-tbody');
const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {
    AdminAuth.logout();
});

function formatDate(isoDate) {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

// ----- ADHÉSIONS -----

async function chargerAdhesions() {
    try {
        const response = await fetch(API_URL_ADHESIONS, {
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const adhesions = await response.json();
        afficherAdhesions(adhesions);

    } catch (error) {
        console.error('Erreur lors du chargement des adhésions :', error);
        adhesionsTbody.innerHTML = `
            <tr><td colspan="8" class="admin-table-error">
                Impossible de charger les demandes d'adhésion. Le service est peut-être indisponible.
            </td></tr>`;
    }
}

function afficherAdhesions(adhesions) {
    if (!adhesions || adhesions.length === 0) {
        adhesionsTbody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">Aucune demande d\'adhésion pour le moment.</td></tr>';
        return;
    }

    adhesionsTbody.innerHTML = adhesions.map((a) => `
        <tr data-id="${a._id}">
            <td>${a.nom}</td>
            <td>${a.prenom}</td>
            <td>${a.email}</td>
            <td>${a.telephone}</td>
            <td>${a.adresse || '—'}</td>
            <td>${formatDate(a.dateDemande)}</td>
            <td>
                <select class="admin-status-select" data-id="${a._id}" data-type="adhesion">
                    <option value="en attente" ${a.statut === 'en attente' ? 'selected' : ''}>En attente</option>
                    <option value="accepté" ${a.statut === 'accepté' ? 'selected' : ''}>Accepté</option>
                    <option value="refusé" ${a.statut === 'refusé' ? 'selected' : ''}>Refusé</option>
                </select>
            </td>
            <td>
                <button class="admin-action-delete" data-id="${a._id}" data-type="adhesion">Supprimer</button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.admin-status-select[data-type="adhesion"]').forEach((select) => {
        select.addEventListener('change', (event) => {
            mettreAJourStatutAdhesion(event.target.dataset.id, event.target.value);
        });
    });

    document.querySelectorAll('.admin-action-delete[data-type="adhesion"]').forEach((btn) => {
        btn.addEventListener('click', () => supprimerAdhesion(btn.dataset.id));
    });
}

async function supprimerAdhesion(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette demande d\'adhésion ? Cette action est irréversible.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL_ADHESIONS}/${id}`, {
            method: 'DELETE',
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Échec de la suppression (' + response.status + ')');
        }

        chargerAdhesions();

    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        alert('La suppression a échoué. Merci de réessayer.');
    }
}

async function mettreAJourStatutAdhesion(id, nouveauStatut) {
    try {
        const response = await fetch(`${API_URL_ADHESIONS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...AdminAuth.authHeaders()
            },
            body: JSON.stringify({ statut: nouveauStatut })
        });

        if (!response.ok) {
            throw new Error('Échec de la mise à jour (' + response.status + ')');
        }

    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut :', error);
        alert('Le statut n\'a pas pu être mis à jour. Merci de réessayer.');
    }
}

// ----- INSCRIPTIONS -----

async function chargerInscriptions() {
    try {
        const response = await fetch(API_URL_INSCRIPTIONS, {
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const inscriptions = await response.json();
        afficherInscriptions(inscriptions);

    } catch (error) {
        console.error('Erreur lors du chargement des inscriptions :', error);
        inscriptionsTbody.innerHTML = `
            <tr><td colspan="8" class="admin-table-error">
                Impossible de charger les inscriptions. Le service est peut-être indisponible.
            </td></tr>`;
    }
}

function afficherInscriptions(inscriptions) {
    if (!inscriptions || inscriptions.length === 0) {
        inscriptionsTbody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">Aucune inscription pour le moment.</td></tr>';
        return;
    }

    inscriptionsTbody.innerHTML = inscriptions.map((i) => `
        <tr data-id="${i._id}">
            <td>${i.evenementTitre || i.evenementId}</td>
            <td>${i.nom}</td>
            <td>${i.prenom}</td>
            <td>${i.email}</td>
            <td>${i.telephone}</td>
            <td>${i.tarif === 'adherent' ? 'Adhérent (20 €)' : 'Non-adhérent (25 €)'}</td>
            <td>${formatDate(i.dateInscription)}</td>
            <td>
                <button class="admin-action-delete" data-id="${i._id}" data-type="inscription">Supprimer</button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.admin-action-delete[data-type="inscription"]').forEach((btn) => {
        btn.addEventListener('click', () => supprimerInscription(btn.dataset.id));
    });
}

async function supprimerInscription(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette inscription ? Cette action est irréversible.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL_INSCRIPTIONS}/${id}`, {
            method: 'DELETE',
            headers: AdminAuth.authHeaders()
        });

        if (!response.ok) {
            throw new Error('Échec de la suppression (' + response.status + ')');
        }

        chargerInscriptions();

    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        alert('La suppression a échoué. Merci de réessayer.');
    }
}

// Chargement initial
chargerAdhesions();
chargerInscriptions();