#!/bin/bash

echo "========================================"
echo "  Scanner de QR Codes - Espace Comedie"
echo "========================================"
echo

echo "[1/4] Installation des dépendances..."
npm install

echo
echo "[2/4] Génération des QR codes de test..."
node test-qr-generator.js

echo
echo "[3/4] Démarrage du serveur..."
echo
echo "Le serveur sera accessible sur: http://localhost:5000"
echo "Page de scan: http://localhost:5000/scan"
echo
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo

npm start
