# 🎫 Scanner de QR Codes - Espace Comédie

Système de scan de QR codes pour billets de spectacles avec interface mobile optimisée.

## 📋 Table des Matières

- [🚀 Déploiement Rapide](#-déploiement-rapide)
- [📱 Utilisation](#-utilisation)
- [🔧 Format QR Code](#-format-qr-code)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technologies](#️-technologies)
- [📊 Fonctionnalités](#-fonctionnalités)
- [🔍 API Endpoints](#-api-endpoints)
- [📁 Structure du Projet](#-structure-du-projet)
- [⚙️ Configuration](#️-configuration)
- [🔄 Workflow de Scan](#-workflow-de-scan)
- [🚨 Gestion d'Erreurs](#-gestion-derreurs)
- [📱 Optimisations Mobile](#-optimisations-mobile)

## 🚀 Déploiement Rapide

### Sur Render (Recommandé)
1. **Forkez** ce repository
2. **Créez** un nouveau Web Service sur Render
3. **Connectez** votre repository GitHub
4. **Configurez** les variables d'environnement :
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `JWT_SECRET`: Apres_lheure_cest_plus_lheure_franchement
   - `FRONTEND_URL`: https://votre-app.onrender.com

### Local
```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Démarrage en mode production
npm start
```

**Accédez à** `http://localhost:3001/scan`

## 📱 Utilisation

1. **Ouvrez** l'application sur votre mobile
2. **Cliquez sur "Scan"** pour démarrer la caméra
3. **Pointez** vers un QR code de billet
4. **Voyez le résultat** :
   - 🟢 **Vert** : Billet valide
   - 🟠 **Orange** : Billet déjà utilisé
   - 🔴 **Rouge** : QR code invalide
5. **Cliquez "OK - Scanner suivant"** pour continuer

## 🔧 Format QR Code

Le scanner attend des QR codes contenant du JSON :
```json
{
  "reservation_id": 3,
  "spectacle_title": "L'autre, c'est moi",
  "date_spectacle": "2025-11-15T00:00:00.000Z",
  "heure_spectacle": "21:00:00",
  "nb_places": 1,
  "type": "ticket_validation",
  "timestamp": "2025-08-11T22:13:52.337Z"
}
```

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Serveur** : `server-test.js` - Serveur Express simplifié
- **API REST** : Endpoints pour vérification et statistiques
- **Mode Test** : Simulation sans base de données
- **CORS** : Configuration pour requêtes cross-origin

### Frontend (HTML5 + JavaScript)
- **Scanner** : Bibliothèque `html5-qrcode` pour détection
- **Interface** : Design responsive optimisé mobile
- **États** : Gestion des différents états de scan
- **Offline** : Sauvegarde locale des scans

### Communication
```
Mobile → Scanner QR → Frontend → API Backend → Réponse
```

## 🛠️ Technologies

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **CORS** : Gestion des requêtes cross-origin
- **dotenv** : Variables d'environnement

### Frontend
- **HTML5** : Structure de l'interface
- **CSS3** : Styles et animations
- **JavaScript ES6+** : Logique métier
- **html5-qrcode** : Détection de QR codes

### Déploiement
- **Render** : Hébergement cloud
- **Git** : Version control
- **npm** : Gestion des dépendances

## 📊 Fonctionnalités

### ✅ Fonctionnalités Principales
- **Scan dynamique** avec caméra
- **Prévention des scans multiples**
- **Mode hors ligne** avec localStorage
- **Interface mobile optimisée**
- **Sons de notification**
- **Statistiques en temps réel**
- **Couleurs distinctives par statut**

### 🔄 Fonctionnalités Avancées
- **Gestion d'état** : Évite les scans simultanés
- **Cache local** : Mémorise les billets scannés
- **Synchronisation** : Traite les scans hors ligne
- **Feedback visuel** : Indicateurs de statut
- **Feedback audio** : Sons selon le résultat

## 🔍 API Endpoints

### `GET /scan`
- **Description** : Page HTML du scanner
- **Réponse** : Fichier HTML statique

### `POST /verify-ticket`
- **Description** : Vérifie un billet scanné
- **Body** : `{ "ticketData": {...} }`
- **Réponse** : Statut de validation

### `GET /scan-stats`
- **Description** : Statistiques de scan
- **Réponse** : Données statistiques

### `GET /health`
- **Description** : Santé du serveur
- **Réponse** : État du service

## 📁 Structure du Projet

```
scanne-QR-code/
├── 📄 server-test.js          # Serveur principal (mode test)
├── 📄 package.json            # Configuration npm
├── 📄 config.env              # Variables d'environnement
├── 📄 render.yaml             # Configuration déploiement
├── 📄 README.md               # Documentation
├── 📄 .gitignore              # Fichiers ignorés par Git
└── 📁 public/                 # Fichiers statiques
    ├── 📄 scan.html           # Interface utilisateur
    └── 📄 scan.js             # Logique JavaScript
```

## ⚙️ Configuration

### Variables d'Environnement
```bash
# Serveur
PORT=3001
FRONTEND_URL=http://localhost:5173

# Base de données (future)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=espace_comedie

# Sécurité (future)
JWT_SECRET=Apres_lheure_cest_plus_lheure_franchement
```

### Dépendances Principales
```json
{
  "express": "^4.18.2",    // Framework web
  "cors": "^2.8.5",        // Gestion CORS
  "dotenv": "^16.3.1"      // Variables d'environnement
}
```

## 🔄 Workflow de Scan

### 1. Initialisation
```
Démarrage → Vérification connectivité → Chargement interface
```

### 2. Scan
```
Activation caméra → Détection QR → Parsing JSON → Validation
```

### 3. Vérification
```
Envoi API → Traitement serveur → Réponse → Affichage résultat
```

### 4. Continuation
```
Confirmation utilisateur → Masquage résultat → Nouveau scan
```

## 🚨 Gestion d'Erreurs

### Erreurs de Scan
- **QR invalide** : Affichage rouge + son d'erreur
- **Billet déjà utilisé** : Affichage orange + son d'avertissement
- **Erreur réseau** : Sauvegarde hors ligne
- **Caméra indisponible** : Message d'erreur explicite

### Erreurs Serveur
- **400** : Données manquantes ou invalides
- **404** : Route non trouvée
- **500** : Erreur interne du serveur

### Mode Hors Ligne
- **Détection automatique** de la connectivité
- **Sauvegarde locale** des scans
- **Synchronisation** lors du retour en ligne

## 📱 Optimisations Mobile

### Interface Responsive
- **Design mobile-first** : Optimisé pour petits écrans
- **Boutons tactiles** : Taille adaptée aux doigts
- **Navigation simple** : Interface épurée

### Performance
- **Scanner optimisé** : Configuration pour mobile
- **Caméra arrière** : Utilisation par défaut
- **Chargement rapide** : Fichiers minifiés

### Expérience Utilisateur
- **Feedback immédiat** : Sons et couleurs
- **Confirmation manuelle** : Bouton "OK - Scanner suivant"
- **Prévention erreurs** : Validation des données

---

## 📞 Support

Pour toute question ou problème :
- **Documentation** : Consultez ce README
- **Issues** : Créez une issue sur GitHub
- **Contact** : Espace Comédie

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Licence** : MIT
