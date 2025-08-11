# 🎫 Système de Scan de QR Codes - Espace Comédie

Système complet de scan de QR codes pour la vérification des billets de spectacles, développé en Node.js avec MySQL.

## 🚀 Fonctionnalités

- **Scan de QR codes** en temps réel avec la caméra
- **Vérification sécurisée** des billets via JWT
- **Interface responsive** optimisée pour mobile
- **Mode hors ligne** avec synchronisation automatique
- **Statistiques en temps réel** des scans
- **Notifications sonores** et visuelles
- **Gestion des erreurs** robuste

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- MySQL (version 5.7 ou supérieure)
- Base de données `espace_comedie` avec les tables existantes

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd qr-ticket-scanner
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de la base de données

Exécutez le script de mise à jour de la base de données :
```bash
mysql -u root -p < database_update.sql
```

Ou connectez-vous à MySQL et exécutez manuellement le contenu de `database_update.sql`.

### 4. Configuration des variables d'environnement

Renommez `config.env` en `.env` et ajustez les valeurs selon votre configuration :

```env
# Configuration du serveur
PORT=5000
FRONTEND_URL=http://localhost:5173

# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=espace_comedie

# Configuration JWT
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe

# Configuration Stripe (optionnel)
STRIPE_SECRET_KEY=votre_cle_stripe
```

### 5. Démarrer le serveur
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:5000`

## 📱 Utilisation

### Accès à l'interface de scan
- Ouvrez votre navigateur sur `http://localhost:5000/scan`
- Autorisez l'accès à la caméra
- Cliquez sur "Démarrer le Scan"

### Fonctionnalités de l'interface

#### 🎯 Scan de QR codes
- **Démarrer le Scan** : Active la caméra pour scanner les QR codes
- **Arrêter le Scan** : Désactive temporairement la caméra
- **Redémarrage automatique** : Le scan reprend automatiquement après 3 secondes

#### 📊 Statistiques
- **Statistiques** : Affiche les statistiques du jour
- **Total Scannés** : Nombre total de billets scannés aujourd'hui
- **Billets Valides** : Nombre de billets valides traités
- **Billets Invalides** : Nombre de billets invalides ou déjà utilisés

#### 🔧 Contrôles
- **Effacer** : Réinitialise les résultats et statistiques locales
- **Mode hors ligne** : Indicateur automatique de l'état de la connexion

## 🔒 Sécurité

### JWT (JSON Web Tokens)
- Les QR codes contiennent des tokens JWT signés
- Chaque token contient : `reservationId`, `userId`, `spectacleId`
- Expiration automatique configurable
- Clé secrète stockée dans les variables d'environnement

### Protection contre la réutilisation
- Chaque billet ne peut être utilisé qu'une seule fois
- Horodatage de l'utilisation stocké en base
- Vérification en temps réel de l'état du billet

### Validation des données
- Vérification de l'existence de la réservation
- Validation des relations entre utilisateur et spectacle
- Gestion des erreurs de base de données

## 📡 API Endpoints

### POST `/verify-ticket`
Vérifie un billet scanné.

**Request :**
```json
{
  "token": "jwt_token_from_qr_code"
}
```

**Response (Succès) :**
```json
{
  "success": true,
  "message": "Billet valide - Accès autorisé",
  "ticketInfo": {
    "reservationId": 1,
    "spectacleTitle": "D'ailleurs",
    "dateSpectacle": "2025-12-25",
    "heureSpectacle": "20:30:00",
    "lieu": "L'espace comedie",
    "nom": "Test",
    "prenom": "Jean",
    "nbPlaces": 2,
    "usedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

**Response (Erreur) :**
```json
{
  "success": false,
  "message": "Billet déjà utilisé",
  "ticketInfo": { ... }
}
```

### GET `/scan-stats`
Récupère les statistiques de scan.

**Response :**
```json
{
  "success": true,
  "stats": {
    "today": {
      "total_scanned_today": 25,
      "used_today": 20,
      "unused_today": 5
    },
    "general": {
      "total_reservations": 150,
      "total_used": 120,
      "total_unused": 30
    }
  }
}
```

### GET `/health`
Vérifie l'état du serveur.

**Response :**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "uptime": 3600
}
```

## 🔧 Configuration avancée

### Optimisation des performances
- Pool de connexions MySQL configuré
- Index sur les colonnes fréquemment utilisées
- Compression des réponses HTTP

### Gestion des erreurs
- Logs détaillés des erreurs
- Gestion gracieuse des déconnexions
- Retry automatique pour les opérations critiques

### Mode hors ligne
- Stockage local des scans en attente
- Synchronisation automatique lors du retour en ligne
- Indicateur visuel de l'état de la connexion

## 📱 Compatibilité mobile

### Navigateurs supportés
- Chrome (Android/iOS)
- Safari (iOS)
- Firefox (Android)
- Edge (Windows Mobile)

### Fonctionnalités mobiles
- Interface responsive
- Caméra arrière par défaut
- Gestes tactiles optimisés
- Notifications sonores
- Mode plein écran

## 🚨 Dépannage

### Problèmes courants

#### La caméra ne démarre pas
- Vérifiez les permissions du navigateur
- Assurez-vous d'utiliser HTTPS en production
- Testez sur un autre navigateur

#### Erreur de connexion à la base de données
- Vérifiez les paramètres de connexion dans `.env`
- Assurez-vous que MySQL est démarré
- Vérifiez les permissions utilisateur

#### QR codes non reconnus
- Vérifiez la qualité de l'image
- Assurez-vous que le QR code est bien éclairé
- Testez avec un QR code de test

### Logs de débogage
Activez les logs détaillés en ajoutant dans `server.js` :
```javascript
console.log('Debug:', decodedText);
```

## 🔄 Mise à jour

### Mise à jour de la base de données
```bash
mysql -u root -p < database_update.sql
```

### Mise à jour du code
```bash
git pull origin main
npm install
npm start
```

## 📞 Support

Pour toute question ou problème :
- Vérifiez les logs du serveur
- Consultez la documentation de l'API
- Testez avec les endpoints de santé

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé pour l'Espace Comédie** 🎭
