@echo off
echo ========================================
echo   Scanner de QR Codes - Espace Comedie
echo ========================================
echo.

echo [1/4] Installation des dependances...
call npm install

echo.
echo [2/4] Generation des QR codes de test...
call node test-qr-generator.js

echo.
echo [3/4] Demarrage du serveur...
echo.
echo Le serveur sera accessible sur: http://localhost:5000
echo Page de scan: http://localhost:5000/scan
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm start

pause
