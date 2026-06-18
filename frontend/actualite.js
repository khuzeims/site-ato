// Données des actualités (en attendant le backend)
// TODO : remplacer par fetch('/api/actualites/' + id) une fois l'API prête
const actualites = {
    "lancement-site": {
        titre: "Lancement officiel du nouveau site internet",
        date: "2 juin 2026",
        image: null,
        imageClass: "thumb-terre",
        contenu: [
            "L'association se modernise avec une présence en ligne pour faciliter les adhésions, centraliser les événements et simplifier la communication avec ses membres.",
            "Ce nouveau site a été conçu pour que chacun puisse facilement consulter les actualités, découvrir les événements à venir et rejoindre l'association en quelques clics.",
            "Nous remercions toutes les personnes qui ont contribué à ce projet et vous souhaitons une bonne navigation."
        ]
    },
    "forum-langues": {
        titre: "Notre participation au Forum des Langues à Toulouse",
        date: "24 mai 2026",
        image: "image/Forum_langue.jpeg",
        imageAlt: "Bénévoles et membres de l'association tenant le drapeau du Tchad au Forum des Langues, Toulouse",
        contenu: [
            "Notre participation au Forum des Langues, organisé Place Saint-Sernin à Toulouse en compagnie de nombreuses autres associations, a été une expérience particulièrement riche et inspirante.",
            "Nous adressons un immense merci à nos bénévoles, qui se sont mobilisés avec générosité, disponibilité et enthousiasme pour assurer le bon fonctionnement de notre stand. Sans leur engagement, rien n'aurait été possible.",
            "Nos remerciements vont également à toute la communauté tchadienne pour sa présence, son soutien indéfectible et l'énergie positive qu'elle apporte à chacun de nos événements.",
            "Cette journée, placée sous le signe du partage, de la découverte et de la diversité culturelle et linguistique, restera un souvenir marquant pour toutes et tous. Ensemble, nous faisons vivre et rayonner nos langues, nos cultures et notre identité tchadienne en Occitanie."
        ]
    },
    "journee-culturelle": {
        titre: "Retour sur notre journée culturelle à Toulouse",
        date: "2 mai 2026",
        image: "image/Journee_culturelle.jpeg",
        imageAlt: "Journée culturelle des Tchadiens à Toulouse",
        contenu: [
            "Cette semaine nous a permis de revenir sur les moments forts de notre journée culturelle du 2 mai 2026 à Toulouse.",
            "Mais au-delà des images et des souvenirs, c'est une dynamique qui se met en place, portée par une volonté collective d'agir, de partager et de construire dans la durée.",
            "L'Association des Tchadiens d'Occitanie poursuit son chemin, avec celles et ceux qui souhaitent s'y investir, à leur manière.",
            "Parce que les projets les plus solides sont ceux que l'on construit ensemble."
        ]
    },
    "journee-integration": {
        titre: "Retour sur notre journée d'intégration des nouveaux étudiants",
        date: "26 octobre 2025",
        image: "image/Journee_integration.jpeg",
        imageAlt: "Journée d'intégration des nouveaux étudiants à Toulouse",
        contenu: [
            "Une journée chaleureuse a été organisée pour accueillir les nouveaux étudiants tchadiens arrivés à Toulouse, afin de créer du lien dès leur arrivée et leur présenter la vie de l'association.",
            "Ce moment d'échange a permis aux nouveaux arrivants de rencontrer d'autres membres de la communauté, de poser leurs questions sur la vie à Toulouse et de découvrir les activités proposées par l'association tout au long de l'année."
        ]
    }
};

function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function afficherArticle() {
    const id = getParam('id');
    const article = actualites[id];

    const titleEl = document.getElementById('article-title');
    const dateEl = document.getElementById('article-date');
    const imageEl = document.getElementById('article-image');
    const bodyEl = document.getElementById('article-body');
    const pageTitleEl = document.getElementById('page-title');

    if (!article) {
        titleEl.textContent = "Actualité introuvable";
        dateEl.textContent = "";
        bodyEl.innerHTML = "<p>Cette actualité n'existe pas ou a été déplacée.</p>";
        return;
    }

    titleEl.textContent = article.titre;
    dateEl.textContent = article.date;
    pageTitleEl.textContent = article.titre + " — Association des Tchadiens d'Occitanie";

    if (article.image) {
        imageEl.innerHTML = `<img src="${article.image}" alt="${article.imageAlt || ''}">`;
    } else {
        imageEl.className = 'article-image ' + (article.imageClass || '');
    }

    bodyEl.innerHTML = article.contenu.map(p => `<p>${p}</p>`).join('');
}

afficherArticle();