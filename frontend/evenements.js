// Galerie photo avec lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let currentGallery = [];
let currentIndex = 0;

function openLightbox(photos, index) {
    currentGallery = photos;
    currentIndex = index;
    if (currentGallery.length === 0) return;

    showImage();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
}

function showImage() {
    const src = currentGallery[currentIndex];
    lightboxImg.src = src;
    lightboxImg.alt = '';

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

// Attache les écouteurs de clic sur les galeries présentes dans le DOM à ce moment.
// À appeler après avoir injecté dynamiquement le contenu des galeries.
function attacherEcouteursGaleries() {
    document.querySelectorAll('.gallery-grid').forEach((grid) => {
        const photos = JSON.parse(grid.dataset.photos || '[]');
        const buttons = Array.from(grid.querySelectorAll('.gallery-item[data-index]'));

        buttons.forEach((button) => {
            const index = parseInt(button.dataset.index, 10);
            button.addEventListener('click', () => openLightbox(photos, index));
        });
    });
}

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
            ${evenement.photos && evenement.photos.length > 0
                ? `<div class="event-card-photo"><img src="${evenement.photos[0]}" alt="${evenement.titre}"></div>`
                : ''}
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

        const captchaToken = grecaptcha.getResponse();
        if (!captchaToken) {
            registrationStatus.textContent = 'Merci de valider le captcha avant d\'envoyer le formulaire.';
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
            dateInscription: new Date().toISOString().slice(0, 10),
            captchaToken: captchaToken
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

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || ('Réponse du serveur incorrecte (' + response.status + ')'));
            }

            registrationStatus.textContent = 'Votre inscription est confirmée. Merci et à bientôt !';
            registrationStatus.className = 'form-status success';
            registrationForm.reset();
            grecaptcha.reset();

        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            registrationStatus.textContent = error.message || 'Le service est momentanément indisponible. Merci de réessayer plus tard ou de contacter un membre du bureau exécutif.';
            registrationStatus.className = 'form-status error';
        } finally {
            registrationSubmitBtn.disabled = false;
            registrationSubmitBtn.textContent = "Confirmer mon inscription";
        }
    });
}

// Chargement et affichage des événements passés (galeries photo)
const pastContainer = document.getElementById('past-container');

function formatDateCourte(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function chargerEvenementsPasses() {
    try {
        const response = await fetch(API_URL_EVENEMENTS);

        if (!response.ok) {
            throw new Error('Réponse serveur incorrecte (' + response.status + ')');
        }

        const evenements = await response.json();
        const passes = evenements.filter((e) => e.statut === 'passé');

        afficherEvenementsPasses(passes);

    } catch (error) {
        console.error('Erreur lors du chargement des événements passés :', error);
        pastContainer.innerHTML = '<p class="news-error">Impossible de charger les événements passés pour le moment.</p>';
    }
}

function afficherEvenementsPasses(evenements) {
    if (!evenements || evenements.length === 0) {
        pastContainer.innerHTML = '<p class="news-empty">Aucun événement passé à afficher pour le moment.</p>';
        return;
    }

    pastContainer.innerHTML = evenements.map((evenement) => {
        const photos = evenement.photos || [];

        const galleryHtml = photos.length > 0
            ? photos.map((src, index) => `
                <button class="gallery-item" data-index="${index}">
                    <img src="${src}" alt="${evenement.titre}">
                </button>
              `).join('')
            : '<p class="news-empty">Aucune photo disponible pour cet événement.</p>';

        return `
            <div class="event-gallery-block">
                <div class="event-gallery-header">
                    <h3>${evenement.titre}</h3>
                    <p class="event-gallery-date">${formatDateCourte(evenement.date)} — ${evenement.lieu}</p>
                </div>
                <div class="gallery-grid" data-photos='${JSON.stringify(photos)}'>
                    ${galleryHtml}
                </div>
            </div>
        `;
    }).join('');

    attacherEcouteursGaleries();
}

chargerEvenementsAVenir();
chargerEvenementsPasses();