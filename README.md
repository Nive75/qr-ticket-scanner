# 🎫 Scanner de QR Codes - Espace Comédie

Système de scan de QR codes pour billets de spectacles avec interface mobile optimisée.

## 🚀 Déploiement Rapide

### Sur Render (Recommandé)
1. Forkez ce repository
2. Créez un nouveau Web Service sur Render
3. Connectez votre repository GitHub
4. Configurez les variables d'environnement :
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `JWT_SECRET`: Apres_lheure_cest_plus_lheure_franchement
   - `FRONTEND_URL`: https://votre-app.onrender.com

### Local
```bash
npm install
npm start
```
Accédez à `http://localhost:3001/scan`

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

## 🛠️ Technologies

- **Backend** : Node.js + Express
- **Frontend** : HTML5 + JavaScript
- **Scanner** : html5-qrcode
- **Déploiement** : Render

## 📊 Fonctionnalités

- ✅ Scan dynamique avec caméra
- ✅ Prévention des scans multiples
- ✅ Mode hors ligne
- ✅ Interface mobile optimisée
- ✅ Sons de notification
- ✅ Statistiques en temps réel
- ✅ Couleurs distinctives par statut
