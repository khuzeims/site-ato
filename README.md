# Site web de l'Association des Tchadiens d'Occitanie

## Présentation

Ce projet consiste en la conception et le développement du site web
de l'Association des Tchadiens d'Occitanie (ATO).

Le site permet notamment de présenter l'association, publier des
actualités, gérer les événements, recueillir les demandes d'adhésion
et les inscriptions aux événements.

## Fonctionnalités

- Présentation de l'association
- Publication des actualités
- Gestion des événements
- Formulaire d'adhésion
- Inscription aux événements
- Interface d'administration
- Authentification administrateur
- Gestion des images
- Envoi d'emails
- Protection des formulaires par reCAPTCHA

## Technologies utilisées

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

### Services externes

- MongoDB Atlas
- Cloudinary
- Brevo
- Google reCAPTCHA
- Render

## Architecture du projet

Le projet est organisé en deux parties principales :

### Backend

Le backend contient :

- server.js/ : point d'entrée du serveur
- models/ : modèles Mongoose
- controllers/ : logique métier
- routes/ : routes de l'API
- middleware/ : middlewares d'authentification et de sécurité
- config/ : configuration des services

### Frontend

Le frontend contient les pages publiques du site ainsi que
l'interface d'administration.

## Installation

### Prérequis

- Node.js
- npm
- MongoDB ou un compte MongoDB Atlas
- Git

### Cloner le projet

bash
git clone URL_DU_DEPOT
cd site-ato
