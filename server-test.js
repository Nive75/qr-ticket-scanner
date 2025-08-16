/**
 * 🎫 Serveur de Scanner de QR Codes - Espace Comédie
 * 
 * Ce serveur gère la vérification des billets scannés via QR codes.
 * Il fonctionne en mode TEST sans connexion à la base de données.
 * Inclut un système d'authentification par mot de passe.
 * 
 * @author Espace Comédie
 * @version 1.0.0
 */

// Import des modules nécessaires
const express = require('express');        // Framework web pour Node.js
const cors = require('cors');              // Middleware pour gérer les requêtes cross-origin
const path = require('path');              // Module pour manipuler les chemins de fichiers
require('dotenv').config({ path: './config.env' }); // Chargement des variables d'environnement

// Configuration du mot de passe (en production, utiliser des variables d'environnement)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EspaceComedie2025!';

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;     // Port du serveur (défaut: 5000)

/**
 * Configuration des middlewares
 */
// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL autorisée
  credentials: true  // Permet l'envoi de cookies et headers d'authentification
}));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('public'));

/**
 * Routes de l'application
 */

/**
 * Route GET / (page d'accueil)
 * Redirige vers la page de connexion
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/**
 * Route GET /login
 * Sert la page HTML de connexion
 */
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/**
 * Route POST /verify-password
 * Vérifie le mot de passe d'authentification
 * 
 * @param {Object} req.body.password - Mot de passe à vérifier
 * @returns {Object} Résultat de la vérification
 */
app.post('/verify-password', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe requis'
      });
    }

    // Vérification du mot de passe
    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({
        success: true,
        message: 'Authentification réussie'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * Route GET /scan
 * Sert la page HTML du scanner de QR codes
 * (Protégée par authentification côté client)
 */
app.get('/scan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scan.html'));
});

/**
 * Route POST /verify-ticket
 * Vérifie un billet scanné et retourne son statut
 * 
 * @param {Object} req.body.ticketData - Données JSON du billet scanné
 * @returns {Object} Résultat de la vérification
 */
app.post('/verify-ticket', async (req, res) => {
  try {
    // Extraction des données du billet depuis la requête
    const { ticketData } = req.body;
    
    // Vérification de la présence des données
    if (!ticketData) {
      return res.status(400).json({
        success: false,
        message: 'Données du billet manquantes'
      });
    }

    console.log('Données reçues:', ticketData);

    // Validation des champs requis dans les données du billet
    if (!ticketData.reservation_id || !ticketData.spectacle_title || !ticketData.type) {
      return res.status(400).json({
        success: false,
        message: 'Données du billet incomplètes'
      });
    }

    // Vérification que c'est bien un ticket de validation
    if (ticketData.type !== 'ticket_validation') {
      return res.status(400).json({
        success: false,
        message: 'Type de billet invalide'
      });
    }

    /**
     * Simulation de vérification (MODE TEST)
     * En production, on vérifierait dans la base de données MySQL :
     * 1. Si la réservation existe
     * 2. Si le billet n'a pas déjà été utilisé
     * 3. Si la date du spectacle est valide
     */
    const isUsed = Math.random() > 0.7; // 30% de chance que le billet soit "déjà utilisé"

    // Réponse selon le statut simulé du billet
    if (isUsed) {
      // Billet déjà utilisé
      return res.status(200).json({
        success: false,
        message: 'Billet déjà utilisé',
        ticketInfo: {
          ...ticketData,
          status: 'used',
          usedAt: new Date().toISOString() // Date d'utilisation simulée
        }
      });
    } else {
      // Billet valide
      return res.status(200).json({
        success: true,
        message: 'Billet valide',
        ticketInfo: {
          ...ticketData,
          status: 'valid'
        }
      });
    }

  } catch (error) {
    console.error('Erreur lors de la vérification du billet:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * Route GET /scan-stats
 * Retourne les statistiques de scan (simulées en mode test)
 * 
 * @returns {Object} Statistiques des scans
 */
app.get('/scan-stats', async (req, res) => {
  return res.status(200).json({
    success: true,
    stats: {
      today: {
        total_scanned_today: 15,    // Nombre total de billets scannés aujourd'hui
        used_today: 8,              // Nombre de billets utilisés aujourd'hui
        unused_today: 7             // Nombre de billets non utilisés aujourd'hui
      },
      general: {
        total_reservations: 150,    // Total des réservations
        total_used: 89,             // Total des billets utilisés
        total_unused: 61            // Total des billets non utilisés
      }
    }
  });
});

/**
 * Route GET /health
 * Endpoint de santé du serveur pour vérifier son état
 * 
 * @returns {Object} Informations sur l'état du serveur
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),       // Temps de fonctionnement en secondes
    mode: 'TEST (sans base de données)'
  });
});

/**
 * Gestion des erreurs 404 - Route non trouvée
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

/**
 * Middleware de gestion globale des erreurs
 * Capture toutes les erreurs non gérées
 */
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
  console.log(`🚀 Serveur de TEST démarré sur le port ${PORT}`);
  console.log(`📱 Page de scan disponible sur: http://localhost:${PORT}/scan`);
  console.log(`🔍 API de vérification: http://localhost:${PORT}/verify-ticket`);
  console.log(`⚠️  MODE TEST: Pas de connexion à la base de données`);
});
