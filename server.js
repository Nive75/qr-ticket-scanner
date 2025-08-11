const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
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

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'espace_comedie',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de connexions MySQL
const pool = mysql.createPool(dbConfig);

// Test de connexion à la base de données
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données MySQL réussie');
    connection.release();
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
}

// Fonction pour obtenir une connexion à la base de données
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Erreur lors de l\'obtention d\'une connexion:', error);
    throw error;
  }
}

// Route pour servir la page de scan
app.get('/scan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scan.html'));
});

// Route pour vérifier un billet scanné
app.post('/verify-ticket', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token manquant'
      });
    }

    // Vérifier et décoder le JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    const { reservationId, userId, spectacleId } = decoded;

    // Récupérer les informations de la réservation
    const connection = await getConnection();
    
    try {
      // Vérifier si la réservation existe et récupérer les détails
      const [reservations] = await connection.execute(`
        SELECT 
          r.id,
          r.nb_places,
          r.date as reservation_date,
          r.used as is_used,
          r.used_at,
          s.title as spectacle_title,
          s.date_spectacle,
          s.heure_spectacle,
          s.lieu,
          u.nom,
          u.prenom,
          u.email
        FROM reservation r
        JOIN spectacle s ON r.spectacle_id = s.id
        JOIN user u ON r.user_id = u.id
        WHERE r.id = ? AND r.user_id = ? AND r.spectacle_id = ?
      `, [reservationId, userId, spectacleId]);

      if (reservations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée'
        });
      }

      const reservation = reservations[0];

      // Vérifier si le billet a déjà été utilisé
      if (reservation.is_used) {
        return res.status(409).json({
          success: false,
          message: 'Billet déjà utilisé',
          usedAt: reservation.used_at,
          ticketInfo: {
            reservationId: reservation.id,
            spectacleTitle: reservation.spectacle_title,
            dateSpectacle: reservation.date_spectacle,
            heureSpectacle: reservation.heure_spectacle,
            lieu: reservation.lieu,
            nom: reservation.nom,
            prenom: reservation.prenom,
            nbPlaces: reservation.nb_places
          }
        });
      }

      // Marquer le billet comme utilisé
      await connection.execute(`
        UPDATE reservation 
        SET used = TRUE, used_at = NOW() 
        WHERE id = ?
      `, [reservationId]);

      // Récupérer la réservation mise à jour
      const [updatedReservations] = await connection.execute(`
        SELECT used_at FROM reservation WHERE id = ?
      `, [reservationId]);

      return res.status(200).json({
        success: true,
        message: 'Billet valide - Accès autorisé',
        ticketInfo: {
          reservationId: reservation.id,
          spectacleTitle: reservation.spectacle_title,
          dateSpectacle: reservation.date_spectacle,
          heureSpectacle: reservation.heure_spectacle,
          lieu: reservation.lieu,
          nom: reservation.nom,
          prenom: reservation.prenom,
          nbPlaces: reservation.nb_places,
          usedAt: updatedReservations[0].used_at
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erreur lors de la vérification du billet:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour obtenir les statistiques de scan
app.get('/scan-stats', async (req, res) => {
  try {
    const connection = await getConnection();
    
    try {
      // Statistiques des billets scannés aujourd'hui
      const [todayStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_scanned_today,
          COUNT(CASE WHEN used = TRUE THEN 1 END) as used_today,
          COUNT(CASE WHEN used = FALSE THEN 1 END) as unused_today
        FROM reservation 
        WHERE DATE(used_at) = CURDATE()
      `);

      // Statistiques générales
      const [generalStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_reservations,
          COUNT(CASE WHEN used = TRUE THEN 1 END) as total_used,
          COUNT(CASE WHEN used = FALSE THEN 1 END) as total_unused
        FROM reservation
      `);

      return res.status(200).json({
        success: true,
        stats: {
          today: todayStats[0],
          general: generalStats[0]
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route de santé du serveur
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
async function startServer() {
  await testDatabaseConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 Page de scan disponible sur: http://localhost:${PORT}/scan`);
    console.log(`🔍 API de vérification: http://localhost:${PORT}/verify-ticket`);
  });
}

startServer().catch(error => {
  console.error('Erreur lors du démarrage du serveur:', error);
  process.exit(1);
});
