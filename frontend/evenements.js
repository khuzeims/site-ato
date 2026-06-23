// Galerie photo avec lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let currentGallery = [];
let currentIndex = 0;

function buildGalleries() {
    const galleries = {};
    document.querySelectorAll('.gallery-grid').forEach((grid) => {
        const name = grid.dataset.gallery;
        const items = Array.from(grid.querySelectorAll('.gallery-item[data-src]'));
        galleries[name] = items.map((item) => ({
            src: item.dataset.src,
            alt: item.dataset.alt || ''
        }));
    });
    return galleries;
}

function openLightbox(galleryName, index) {
    const galleries = buildGalleries();
    currentGallery = galleries[galleryName] || [];
    currentIndex = index;
    if (currentGallery.length === 0) return;

    showImage();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
}

function showImage() {
    const photo = currentGallery[currentIndex];
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;

    const multiple = currentGallery.length > 1;
    lightboxPrev.style.display = multiple ? 'flex' : 'none';
    lightboxNext.style.display = multiple ? 'flex' : 'none';
}

function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
}

function showNext() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showImage();
}

function showPrev() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showImage();
}

document.querySelectorAll('.gallery-grid').forEach((grid) => {
    const galleryName = grid.dataset.gallery;
    const buttons = Array.from(grid.querySelectorAll('.gallery-item[data-src]'));

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => openLightbox(galleryName, index));
    });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', showNext);
lightboxPrev.addEventListener('click', showPrev);

lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') showNext();
    if (event.key === 'ArrowLeft') showPrev();
});

// Chargement et affichage des événements à venir
const API_URL_EVENEMENTS = '/api/evenements';
const API_URL_INSCRIPTIONS = '/api/inscriptions';

const upcomingContainer = document.getElementById('upcoming-container');
const registrationSection = document.getElementById('registration-section');
const registrationTitle = document.getElementById('registration-title');
const registrationSub = document.getElementById('registration-sub');
const registrationEvenementId = document.getElementById('registration-evenement-id');
const closeRegistrationBtn = document.getElementById('close-registration');
const registrationForm = document.getElementById('registration-form');
const registrationStatus = document.getElementById('registration-status');
const registrationSubmitBtn = document.getElementById('registration-submit-btn');

function formatDateLongue(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

async function chargerEvenementsAVenir() {
    try {
        const response = await fetch(API_URL_EVENEMENTS);

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const evenements = await response.json();
        const aVenir = evenements.filter((e) => e.statut === 'à venir');

        afficherEvenementsAVenir(aVenir);

    } catch (error) {
        console.error('Erreur lors du chargement des événements :', error);
        upcomingContainer.innerHTML = '<p class="news-error">Impossible de charger les événements pour le moment. Merci de réessayer plus tard.</p>';
    }
}

function afficherEvenementsAVenir(evenements) {
    if (!evenements || evenements.length === 0) {
        upcomingContainer.innerHTML = `
            <div class="empty-state">
                <p>Aucun événement n'est programmé pour le moment.</p>
                <p class="empty-state-sub">Revenez bientôt, ou suivez-nous sur les réseaux sociaux pour ne rien manquer.</p>
            </div>`;
        return;
    }

    upcomingContainer.innerHTML = evenements.map((evenement) => `
        <div class="event-card-upcoming">
            <div class="event-card-info">
                <span class="event-status-badge">À venir</span>
                <h3>${evenement.titre}</h3>
                <p class="event-card-meta">${formatDateLongue(evenement.date)} · ${evenement.lieu}</p>
                <p class="event-card-desc">${evenement.description}</p>
                <p class="event-card-places">${evenement.placesDisponibles} places disponibles</p>
                <button class="btn-primary open-registration" data-id="${evenement._id}" data-titre="${evenement.titre}" data-date="${formatDateLongue(evenement.date)}" data-lieu="${evenement.lieu}">S'inscrire</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.open-registration').forEach((btn) => {
        btn.addEventListener('click', () => ouvrirFormulaireInscription(btn.dataset));
    });
}

function ouvrirFormulaireInscription(data) {
    registrationEvenementId.value = data.id;
    registrationTitle.textContent = 'S\'inscrire — ' + data.titre;
    registrationSub.textContent = data.date + ' · ' + data.lieu;
    registrationStatus.textContent = '';
    registrationStatus.className = 'form-status';
    registrationSection.hidden = false;
    registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (closeRegistrationBtn && registrationSection) {
    closeRegistrationBtn.addEventListener('click', () => {
        registrationSection.hidden = true;
    });
}

if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!registrationForm.checkValidity()) {
            registrationStatus.textContent = 'Merci de remplir tous les champs obligatoires (*), y compris le tarif.';
            registrationStatus.className = 'form-status error';
            return;
        }

        const tarifChoisi = registrationForm.querySelector('input[name="tarif"]:checked').value;

        // Payload conforme au schéma MongoDB de la collection "inscription"
        const payload = {
            evenementId: registrationEvenementId.value,
            nom: document.getElementById('insc-nom').value.trim(),
            prenom: document.getElementById('insc-prenom').value.trim(),
            email: document.getElementById('insc-email').value.trim(),
            telephone: document.getElementById('insc-telephone').value.trim(),
            tarif: tarifChoisi,
            dateInscription: new Date().toISOString().slice(0, 10)
        };

        registrationSubmitBtn.disabled = true;
        registrationSubmitBtn.textContent = "Envoi en cours...";
        registrationStatus.textContent = '';
        registrationStatus.className = 'form-status';

        try {
            const response = await fetch(API_URL_INSCRIPTIONS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Réponse du serveur incorrecte (' + response.status + ')');
            }

            registrationStatus.textContent = 'Votre inscription est confirmée. Merci et à bientôt !';
            registrationStatus.className = 'form-status success';
            registrationForm.reset();

        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            registrationStatus.textContent = 'Le service est momentanément indisponible. Merci de réessayer plus tard ou de contacter un membre du bureau exécutif.';
            registrationStatus.className = 'form-status error';
        } finally {
            registrationSubmitBtn.disabled = false;
            registrationSubmitBtn.textContent = "Confirmer mon inscription";
        }
    });
}

chargerEvenementsAVenir();