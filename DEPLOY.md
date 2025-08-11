# 🚀 Déploiement sur Render

## Étapes pour déployer sur Render

### 1. Préparer le repository Git

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit for Render deployment"
```

### 2. Créer un repository sur GitHub

1. Allez sur [GitHub](https://github.com)
2. Créez un nouveau repository
3. Poussez votre code :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/qr-ticket-scanner.git
git branch -M main
git push -u origin main
```

### 3. Déployer sur Render

1. Allez sur [Render](https://render.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New +" → "Web Service"
4. Connectez votre repository GitHub
5. Configurez le service :

**Configuration :**
- **Name** : `qr-ticket-scanner`
- **Environment** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `node server-test.js`
- **Plan** : `Free`

**Environment Variables :**
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `JWT_SECRET` = `Apres_lheure_cest_plus_lheure_franchement`
- `FRONTEND_URL` = `https://qr-ticket-scanner.onrender.com`

### 4. Accéder à votre application

Une fois déployé, votre application sera accessible sur :
```
https://qr-ticket-scanner.onrender.com/scan
```

## 📱 Utilisation sur mobile

1. **Ouvrez le lien** sur votre portable
2. **Autorisez l'accès à la caméra**
3. **Scannez les QR codes de test**

## 🔧 Variables d'environnement importantes

- `PORT` : Render utilise le port 10000
- `JWT_SECRET` : Clé secrète pour signer les JWT
- `FRONTEND_URL` : URL de votre application déployée

## ⚠️ Mode TEST

L'application est déployée en mode TEST (sans base de données). Pour passer en production :

1. Configurez une base de données MySQL sur Render
2. Ajoutez les variables d'environnement de base de données
3. Modifiez le `startCommand` pour utiliser `server.js`

## 🔄 Mise à jour

Pour mettre à jour l'application :

```bash
git add .
git commit -m "Update application"
git push origin main
```

Render redéploiera automatiquement !
