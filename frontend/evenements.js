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

// Formulaire d'inscription à l'événement
const openRegistrationBtn = document.getElementById('open-registration');
const closeRegistrationBtn = document.getElementById('close-registration');
const registrationSection = document.getElementById('registration-section');
const registrationForm = document.getElementById('registration-form');
const registrationStatus = document.getElementById('registration-status');
const registrationSubmitBtn = document.getElementById('registration-submit-btn');

// Identifiant de l'événement (collection "evenement")
const EVENEMENT_ID = "6a310dab16f54263992b97dc"; // BBQ géant — à remplacer par l'ID réel renvoyé par l'API
const API_URL_INSCRIPTIONS = '/api/inscriptions';

if (openRegistrationBtn && registrationSection) {
    openRegistrationBtn.addEventListener('click', () => {
        registrationSection.hidden = false;
        registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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
            evenementId: EVENEMENT_ID,
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