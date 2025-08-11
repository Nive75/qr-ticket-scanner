/**
 * Script de test pour générer des QR codes de test
 * Utile pour tester le système de scan
 */

const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Créer le dossier de sortie s'il n'existe pas
const outputDir = path.join(__dirname, 'test-qr-codes');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Données de test basées sur votre base de données
const testReservations = [
    {
        id: 1,
        reservationId: 1,
        userId: 1,
        spectacleId: 1,
        description: "Test billet valide - D'ailleurs"
    },
    {
        id: 2,
        reservationId: 2,
        userId: 1,
        spectacleId: 2,
        description: "Test billet valide - L'autre, c'est moi"
    }
];

// Fonction pour générer un JWT
function generateJWT(reservationId, userId, spectacleId) {
    const payload = {
        reservationId,
        userId,
        spectacleId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expire dans 24h
    };

    return jwt.sign(payload, process.env.JWT_SECRET);
}

// Fonction pour générer un QR code
async function generateQRCode(token, filename, description) {
    try {
        const qrCodePath = path.join(outputDir, filename);
        
        // Générer le QR code
        await QRCode.toFile(qrCodePath, token, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        console.log(`✅ QR code généré: ${filename} - ${description}`);
        return qrCodePath;
    } catch (error) {
        console.error(`❌ Erreur lors de la génération de ${filename}:`, error.message);
        return null;
    }
}

// Fonction pour créer un fichier HTML de test
function createTestHTML(qrCodes) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Codes de Test - Espace Comédie</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .qr-container {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .qr-code {
            text-align: center;
            margin: 20px 0;
        }
        .qr-code img {
            max-width: 300px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .info {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .token {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin: 10px 0;
        }
        .instructions {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎫 QR Codes de Test</h1>
        <p>Espace Comédie - Système de Scan</p>
    </div>

    <div class="instructions">
        <h3>📋 Instructions de test</h3>
        <ol>
            <li>Ouvrez l'application de scan sur <code>http://localhost:5000/scan</code></li>
            <li>Démarrez le scan</li>
            <li>Scannez l'un des QR codes ci-dessous</li>
            <li>Vérifiez que le billet est correctement validé</li>
        </ol>
    </div>

    ${qrCodes.map(qr => `
        <div class="qr-container">
            <h3>${qr.description}</h3>
            <div class="qr-code">
                <img src="${qr.filename}" alt="QR Code de test">
            </div>
            <div class="info">
                <strong>Informations du billet:</strong><br>
                Réservation ID: ${qr.reservationId}<br>
                Utilisateur ID: ${qr.userId}<br>
                Spectacle ID: ${qr.spectacleId}
            </div>
            <div class="token">
                <strong>Token JWT:</strong><br>
                ${qr.token}
            </div>
        </div>
    `).join('')}

    <div class="instructions">
        <h3>🔍 Test de billet déjà utilisé</h3>
        <p>Pour tester un billet déjà utilisé, scannez le même QR code deux fois de suite.</p>
    </div>
</body>
</html>`;

    const htmlPath = path.join(outputDir, 'test-qr-codes.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Page de test HTML générée: ${htmlPath}`);
    return htmlPath;
}

// Fonction principale
async function generateTestQRCodes() {
    console.log('🚀 Génération des QR codes de test...\n');

    const qrCodes = [];

    for (const reservation of testReservations) {
        // Générer le JWT
        const token = generateJWT(
            reservation.reservationId,
            reservation.userId,
            reservation.spectacleId
        );

        // Générer le QR code
        const filename = `test-qr-${reservation.id}.png`;
        const qrPath = await generateQRCode(token, filename, reservation.description);

        if (qrPath) {
            qrCodes.push({
                filename,
                description: reservation.description,
                reservationId: reservation.reservationId,
                userId: reservation.userId,
                spectacleId: reservation.spectacleId,
                token
            });
        }
    }

    // Créer la page HTML de test
    if (qrCodes.length > 0) {
        const htmlPath = await createTestHTML(qrCodes);
        console.log(`\n📄 Ouvrez ${htmlPath} dans votre navigateur pour voir les QR codes de test`);
    }

    console.log(`\n✅ Génération terminée! ${qrCodes.length} QR codes créés dans le dossier '${outputDir}'`);
    console.log('\n📱 Pour tester:');
    console.log('1. Démarrez le serveur: npm start');
    console.log('2. Ouvrez: http://localhost:5000/scan');
    console.log('3. Scannez les QR codes générés');
}

// Exécuter le script
if (require.main === module) {
    generateTestQRCodes().catch(error => {
        console.error('❌ Erreur lors de la génération:', error);
        process.exit(1);
    });
}

module.exports = {
    generateJWT,
    generateQRCode,
    generateTestQRCodes
};
