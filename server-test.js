const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Route pour servir la page de scan
app.get('/scan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scan.html'));
});

// Route pour vérifier un billet scanné (version de test sans DB)
app.post('/verify-ticket', async (req, res) => {
  try {
    const { ticketData } = req.body;
    
    if (!ticketData) {
      return res.status(400).json({
        success: false,
        message: 'Données du billet manquantes'
      });
    }

    console.log('Données reçues:', ticketData);

    // Vérifier que les données requises sont présentes
    if (!ticketData.reservation_id || !ticketData.spectacle_title || !ticketData.type) {
      return res.status(400).json({
        success: false,
        message: 'Données du billet incomplètes'
      });
    }

    // Vérifier que c'est bien un ticket de validation
    if (ticketData.type !== 'ticket_validation') {
      return res.status(400).json({
        success: false,
        message: 'Type de billet invalide'
      });
    }

    // Simulation de vérification (pour test)
    // En mode réel, on vérifierait dans la base de données
    const isUsed = Math.random() > 0.7; // 30% de chance que le billet soit "déjà utilisé"

    if (isUsed) {
      return res.status(200).json({
        success: false,
        message: 'Billet déjà utilisé',
        ticketInfo: {
          ...ticketData,
          status: 'used',
          usedAt: new Date().toISOString()
        }
      });
    } else {
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

// Route pour obtenir les statistiques de scan (version de test)
app.get('/scan-stats', async (req, res) => {
  return res.status(200).json({
    success: true,
    stats: {
      today: {
        total_scanned_today: 15,
        used_today: 8,
        unused_today: 7
      },
      general: {
        total_reservations: 150,
        total_used: 89,
        total_unused: 61
      }
    }
  });
});

// Route de santé du serveur
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: 'TEST (sans base de données)'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur de TEST démarré sur le port ${PORT}`);
  console.log(`📱 Page de scan disponible sur: http://localhost:${PORT}/scan`);
  console.log(`🔍 API de vérification: http://localhost:${PORT}/verify-ticket`);
  console.log(`⚠️  MODE TEST: Pas de connexion à la base de données`);
});
