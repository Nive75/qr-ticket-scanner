/**
 * 🎫 Scanner de QR Codes - Espace Comédie
 * 
 * Classe principale pour gérer le scan de QR codes de billets.
 * Utilise la bibliothèque html5-qrcode pour la détection de QR codes.
 * 
 * @author Espace Comédie
 * @version 1.0.0
 */

/**
 * Classe TicketScanner
 * Gère toute la logique de scan, vérification et affichage des résultats
 */
class TicketScanner {
    /**
     * Constructeur de la classe
     * Initialise tous les composants et états du scanner
     */
    constructor() {
        // Instance du scanner HTML5 QR Code
        this.html5QrcodeScanner = null;
        
        // États du scanner
        this.isScanning = false;           // Indique si le scan est en cours
        this.isProcessing = false;         // Évite les scans multiples simultanés
        
        // Gestion des billets déjà scannés (prévention des doublons)
        this.scannedTickets = new Set();   // Set pour stocker les IDs des billets scannés
        
        // Statistiques locales
        this.stats = {
            totalScanned: 0,               // Nombre total de billets scannés
            validTickets: 0,               // Nombre de billets valides
            invalidTickets: 0              // Nombre de billets invalides
        };
        
        // Gestion du mode hors ligne
        this.offlineScans = [];            // Scans sauvegardés en mode hors ligne
        
        // Initialisation des composants
        this.initializeElements();         // Récupération des éléments DOM
        this.bindEvents();                 // Liaison des événements
        this.checkOnlineStatus();          // Vérification de la connectivité
        this.loadOfflineScans();           // Chargement des scans hors ligne
        this.updateStats();                // Mise à jour des statistiques
    }

    /**
     * Initialise les références vers les éléments DOM
     * Récupère tous les éléments nécessaires pour l'interface
     */
    initializeElements() {
        this.elements = {
            // Éléments du scanner
            reader: document.getElementById('reader'),                    // Zone d'affichage du scanner
            startScanBtn: document.getElementById('startScanBtn'),        // Bouton démarrer le scan
            stopScanBtn: document.getElementById('stopScanBtn'),          // Bouton arrêter le scan
            
            // Éléments de contrôle
            showStatsBtn: document.getElementById('showStatsBtn'),        // Bouton afficher les stats
            clearResultsBtn: document.getElementById('clearResultsBtn'),  // Bouton effacer les résultats
            testBtn: document.getElementById('testBtn'),                  // Bouton test du scanner
            continueBtn: document.getElementById('continueBtn'),          // Bouton continuer le scan
            logoutBtn: document.getElementById('logoutBtn'),              // Bouton de déconnexion
            
            // Éléments d'affichage des résultats
            resultContainer: document.getElementById('resultContainer'),  // Conteneur des résultats
            resultTitle: document.getElementById('resultTitle'),          // Titre du résultat
            ticketInfo: document.getElementById('ticketInfo'),            // Informations du billet
            statusIndicator: document.getElementById('statusIndicator'),  // Indicateur de statut
            loading: document.getElementById('loading'),                  // Indicateur de chargement
            
            // Éléments des statistiques
            stats: document.getElementById('stats'),                      // Conteneur des statistiques
            offlineIndicator: document.getElementById('offlineIndicator'), // Indicateur hors ligne
            totalScanned: document.getElementById('totalScanned'),        // Total scannés
            validTickets: document.getElementById('validTickets'),        // Billets valides
            invalidTickets: document.getElementById('invalidTickets')     // Billets invalides
        };
    }

    /**
     * Lie les événements aux éléments DOM
     * Configure tous les listeners d'événements
     */
    bindEvents() {
        // Événements des boutons de contrôle
        this.elements.startScanBtn.addEventListener('click', () => this.startScan());
        this.elements.stopScanBtn.addEventListener('click', () => this.stopScan());
        this.elements.showStatsBtn.addEventListener('click', () => this.toggleStats());
        this.elements.clearResultsBtn.addEventListener('click', () => this.clearResults());
        this.elements.testBtn.addEventListener('click', () => this.testScanner());
        this.elements.continueBtn.addEventListener('click', () => this.continueScanning());
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        
        // Événements de connectivité réseau
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    /**
     * Vérifie le statut de connectivité au démarrage
     */
    checkOnlineStatus() {  
        this.handleOnlineStatus(navigator.onLine);
    }

    /**
     * Gère les changements de statut de connectivité
     * @param {boolean} isOnline - Indique si l'appareil est en ligne
     */
    handleOnlineStatus(isOnline) {
        if (isOnline) {
            // Mode en ligne : masquer l'indicateur hors ligne
            this.elements.offlineIndicator.style.display = 'none';
            // Synchroniser les scans sauvegardés hors ligne
            this.syncOfflineScans();
        } else {
            // Mode hors ligne : afficher l'indicateur
            this.elements.offlineIndicator.style.display = 'block';
        }
    }

    /**
     * Démarre le scanner de test (bouton "Scan")
     * Lance le vrai scanner avec la caméra
     */
    testScanner() {
        console.log('Démarrage du scan dynamique...');
        // Démarrer le vrai scanner avec la caméra
        this.startScan();
    }

    /**
     * Démarre le scan de QR codes
     * Configure et lance le scanner HTML5 QR Code
     */
    async startScan() {
        // Éviter de démarrer plusieurs scans simultanément
        if (this.isScanning) return;

        try {
            // Mise à jour de l'interface
            this.isScanning = true;
            this.elements.startScanBtn.style.display = 'none';
            this.elements.stopScanBtn.style.display = 'inline-block';
            this.elements.statusIndicator.className = 'status-indicator scanning';

            // Configuration optimisée du scanner pour mobile
            const config = {
                fps: 10,                                    // Images par seconde
                qrbox: { width: 300, height: 300 },        // Zone de détection
                aspectRatio: 1.0,                          // Ratio d'aspect carré
                disableFlip: false,                        // Permettre la rotation
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true    // Utiliser le détecteur natif si disponible
                }
            };

            // Création de l'instance du scanner
            this.html5QrcodeScanner = new Html5Qrcode("reader");
            
            console.log('Démarrage du scanner...');
            
            // Démarrage du scan avec la caméra arrière sur mobile
            await this.html5QrcodeScanner.start(
                { facingMode: "environment" }, // Utiliser la caméra arrière
                config,
                // Callback de succès : QR code détecté
                (decodedText, decodedResult) => {
                    console.log('🎯 QR Code détecté!');
                    console.log('📄 Contenu:', decodedText);
                    console.log('🔍 Détails:', decodedResult);
                    this.handleScanResult(decodedText);
                },
                // Callback d'erreur : erreurs de scan (ignorées)
                (errorMessage) => {
                    console.log('⚠️ Scan error:', errorMessage);
                }
            );

        } catch (error) {
            console.error('Erreur lors du démarrage du scan:', error);
            this.showError('Impossible de démarrer la caméra. Vérifiez les permissions.');
            this.stopScan();
        }
    }

    /**
     * Arrête le scan de QR codes
     * Nettoie les ressources du scanner
     */
    async stopScan() {
        if (!this.isScanning) return;

        try {
            // Arrêt et nettoyage du scanner
            if (this.html5QrcodeScanner) {
                await this.html5QrcodeScanner.stop();
                this.html5QrcodeScanner.clear();
            }
        } catch (error) {
            console.error('Erreur lors de l\'arrêt du scan:', error);
        }

        // Mise à jour de l'interface
        this.isScanning = false;
        this.elements.startScanBtn.style.display = 'inline-block';
        this.elements.stopScanBtn.style.display = 'none';
        this.elements.statusIndicator.className = 'status-indicator';
    }

    /**
     * Traite le résultat d'un scan de QR code
     * Parse le JSON et vérifie le billet
     * @param {string} decodedText - Texte décodé du QR code
     */
    async handleScanResult(decodedText) {
        // Éviter les scans multiples simultanés
        if (this.isProcessing) {
            console.log('Scan en cours, ignoré');
            return;
        }
        
        this.isProcessing = true;
        
        // Arrêter temporairement le scan pour éviter les scans multiples
        await this.stopScan();
        
        // Affichage du chargement
        this.showLoading(true);
        this.elements.statusIndicator.className = 'status-indicator scanning';

        try {
            // Tentative de parsing du JSON du QR code
            let ticketData;
            try {
                ticketData = JSON.parse(decodedText);
                console.log('Données du billet:', ticketData);
            } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                this.showError('QR code non reconnu');
                return;
            }

            // Création d'un identifiant unique pour ce billet
            const ticketId = `${ticketData.reservation_id}_${ticketData.spectacle_title}_${ticketData.date_spectacle}`;
            
            // Vérification si ce billet a déjà été scanné
            if (this.scannedTickets.has(ticketId)) {
                this.showError('Ce billet a déjà été scanné');
                return;
            }

            // Vérification de la connectivité pour le traitement
            if (navigator.onLine) {
                await this.verifyTicketOnline(ticketData, ticketId);
            } else {
                this.handleOfflineScan(ticketData);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
            this.showError('Erreur lors de la vérification du billet');
        } finally {
            this.showLoading(false);
            this.isProcessing = false;
        }
    }

    /**
     * Vérifie un billet en ligne via l'API
     * @param {Object} data - Données du billet
     * @param {string} ticketId - Identifiant unique du billet
     */
    async verifyTicketOnline(data, ticketId) {
        try {
            // Envoi de la requête de vérification au serveur
            const response = await fetch('/verify-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticketData: data })
            });

            const result = await response.json();
            
            if (response.ok) {
                if (result.success) {
                    // Billet valide : ajouter à la liste des scannés
                    this.scannedTickets.add(ticketId);
                    this.showSuccess(result);
                } else {
                    // Vérifier si c'est un billet déjà utilisé
                    if (result.message.includes('déjà utilisé')) {
                        // Ajouter le billet à la liste même s'il est déjà utilisé
                        this.scannedTickets.add(ticketId);
                        this.showUsedTicket(result);
                    } else {
                        this.showError(result.message, result.ticketInfo);
                    }
                }
            } else {
                this.showError(result.message, result.ticketInfo);
            }

            // Mise à jour des statistiques
            this.updateStatsFromResult(result.success);
            
        } catch (error) {
            console.error('Erreur réseau:', error);
            // En cas d'erreur réseau, sauvegarder pour traitement hors ligne
            this.handleOfflineScan(data);
        }
    }

    /**
     * Gère un scan en mode hors ligne
     * Sauvegarde le scan pour traitement ultérieur
     * @param {Object} token - Données du billet
     */
    handleOfflineScan(token) {
        const scanData = {
            token,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.offlineScans.push(scanData);
        this.saveOfflineScans();

        this.showWarning(
            'Scan sauvegardé hors ligne',
            'Le billet sera vérifié lorsque la connexion sera rétablie.'
        );
    }

    /**
     * Synchronise les scans sauvegardés hors ligne
     * Traite tous les scans en attente quand la connexion est rétablie
     */
    async syncOfflineScans() {
        if (this.offlineScans.length === 0) return;

        const scansToProcess = [...this.offlineScans];
        this.offlineScans = [];

        for (const scan of scansToProcess) {
            try {
                await this.verifyTicketOnline(scan.token);
            } catch (error) {
                console.error('Erreur lors de la synchronisation:', error);
                // Remettre dans la liste si échec
                this.offlineScans.push(scan);
            }
        }

        this.saveOfflineScans();
    }

    /**
     * Affiche/masque l'indicateur de chargement
     * @param {boolean} show - Afficher ou masquer le chargement
     */
    showLoading(show) {
        this.elements.loading.style.display = show ? 'block' : 'none';
    }

    /**
     * Affiche un résultat de succès (billet valide)
     * @param {Object} result - Résultat de la vérification
     */
    showSuccess(result) {
        this.elements.statusIndicator.className = 'status-indicator success';
        this.elements.resultContainer.className = 'result-container success';
        this.elements.resultTitle.textContent = '✅ ' + result.message;
        
        if (result.ticketInfo) {
            this.elements.ticketInfo.innerHTML = this.formatTicketInfo(result.ticketInfo);
        }
        
        this.elements.resultContainer.style.display = 'block';
        this.elements.continueBtn.style.display = 'inline-block';
        
        // Son de succès
        this.playSound('success');
    }

    /**
     * Affiche un résultat d'erreur (billet invalide)
     * @param {string} message - Message d'erreur
     * @param {Object} ticketInfo - Informations du billet (optionnel)
     */
    showError(message, ticketInfo = null) {
        this.elements.statusIndicator.className = 'status-indicator error';
        this.elements.resultContainer.className = 'result-container error';
        this.elements.resultTitle.textContent = '❌ ' + message;
        
        if (ticketInfo) {
            this.elements.ticketInfo.innerHTML = this.formatTicketInfo(ticketInfo);
        } else {
            this.elements.ticketInfo.innerHTML = '';
        }
        
        this.elements.resultContainer.style.display = 'block';
        this.elements.continueBtn.style.display = 'inline-block';
        
        // Son d'erreur
        this.playSound('error');
    }

    /**
     * Affiche un billet déjà utilisé
     * @param {Object} result - Résultat de la vérification
     */
    showUsedTicket(result) {
        this.elements.statusIndicator.className = 'status-indicator scanning';
        this.elements.resultContainer.className = 'result-container used';
        this.elements.resultTitle.textContent = '🟠 ' + result.message;
        
        if (result.ticketInfo) {
            this.elements.ticketInfo.innerHTML = this.formatTicketInfo(result.ticketInfo);
        }
        
        this.elements.resultContainer.style.display = 'block';
        this.elements.continueBtn.style.display = 'inline-block';
        
        // Son d'avertissement
        this.playSound('warning');
    }

    /**
     * Affiche un avertissement (mode hors ligne)
     * @param {string} message - Message d'avertissement
     * @param {string} details - Détails supplémentaires
     */
    showWarning(message, details = '') {
        this.elements.statusIndicator.className = 'status-indicator scanning';
        this.elements.resultContainer.className = 'result-container warning';
        this.elements.resultTitle.textContent = '⚠️ ' + message;
        this.elements.ticketInfo.innerHTML = details ? `<p>${details}</p>` : '';
        this.elements.resultContainer.style.display = 'block';
    }

    /**
     * Formate les informations du billet pour l'affichage
     * @param {Object} ticketInfo - Informations du billet
     * @returns {string} HTML formaté
     */
    formatTicketInfo(ticketInfo) {
        return `
            <h3>Informations du Billet</h3>
            <p><strong>Réservation:</strong> #${ticketInfo.reservation_id}</p>
            <p><strong>Spectacle:</strong> ${ticketInfo.spectacle_title}</p>
            <p><strong>Date:</strong> ${new Date(ticketInfo.date_spectacle).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure:</strong> ${ticketInfo.heure_spectacle}</p>
            <p><strong>Places:</strong> ${ticketInfo.nb_places}</p>
            <p><strong>Type:</strong> ${ticketInfo.type}</p>
            <p><strong>Généré le:</strong> ${new Date(ticketInfo.timestamp).toLocaleString('fr-FR')}</p>
            ${ticketInfo.usedAt ? `<p><strong>Scanné le:</strong> ${new Date(ticketInfo.usedAt).toLocaleString('fr-FR')}</p>` : ''}
        `;
    }

    /**
     * Joue un son de notification
     * @param {string} type - Type de son ('success', 'error', 'warning')
     */
    playSound(type) {
        // Création d'un contexte audio simple pour les notifications sonores
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Fréquence selon le type de son
            let frequency;
            switch(type) {
                case 'success': frequency = 800; break;  // Son aigu pour succès
                case 'error': frequency = 400; break;    // Son grave pour erreur
                case 'warning': frequency = 600; break;  // Son moyen pour avertissement
                default: frequency = 500;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Ignorer les erreurs audio
        }
    }

    /**
     * Met à jour les statistiques selon le résultat
     * @param {boolean} isValid - Indique si le billet est valide
     */
    updateStatsFromResult(isValid) {
        this.stats.totalScanned++;
        if (isValid) {
            this.stats.validTickets++;
        } else {
            this.stats.invalidTickets++;
        }
        this.updateStats();
    }

    /**
     * Met à jour l'affichage des statistiques
     */
    updateStats() {
        this.elements.totalScanned.textContent = this.stats.totalScanned;
        this.elements.validTickets.textContent = this.stats.validTickets;
        this.elements.invalidTickets.textContent = this.stats.invalidTickets;
    }

    /**
     * Affiche/masque les statistiques
     */
    toggleStats() {
        const isVisible = this.elements.stats.style.display === 'block';
        this.elements.stats.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.loadStats();
        }
    }

    /**
     * Charge les statistiques depuis le serveur
     */
    async loadStats() {
        try {
            const response = await fetch('/scan-stats');
            const result = await response.json();
            
            if (result.success) {
                this.elements.totalScanned.textContent = result.stats.today.total_scanned_today || 0;
                this.elements.validTickets.textContent = result.stats.today.used_today || 0;
                this.elements.invalidTickets.textContent = result.stats.today.unused_today || 0;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    /**
     * Continue le scan après affichage d'un résultat
     * Masque les résultats et redémarre le scanner
     */
    continueScanning() {
        this.elements.resultContainer.style.display = 'none';
        this.elements.continueBtn.style.display = 'none';
        this.elements.statusIndicator.className = 'status-indicator';
        
        // Redémarrer automatiquement le scan pour le prochain billet
        this.startScan();
    }

    /**
     * Efface tous les résultats et statistiques
     * Remet le scanner à zéro
     */
    clearResults() {
        this.elements.resultContainer.style.display = 'none';
        this.elements.continueBtn.style.display = 'none';
        this.elements.statusIndicator.className = 'status-indicator';
        
        // Remise à zéro des statistiques
        this.stats = {
            totalScanned: 0,
            validTickets: 0,
            invalidTickets: 0
        };
        
        // Vider la liste des billets scannés
        this.scannedTickets.clear();
        this.updateStats();
    }

    /**
     * Sauvegarde les scans hors ligne dans le localStorage
     */
    saveOfflineScans() {
        try {
            localStorage.setItem('offlineScans', JSON.stringify(this.offlineScans));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde hors ligne:', error);
        }
    }

    /**
     * Charge les scans hors ligne depuis le localStorage
     */
    loadOfflineScans() {
        try {
            const saved = localStorage.getItem('offlineScans');
            if (saved) {
                this.offlineScans = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des scans hors ligne:', error);
            this.offlineScans = [];
        }
    }

    /**
     * Déconnexion de l'utilisateur
     * Efface la session et redirige vers la page de connexion
     */
    logout() {
        // Confirmation de déconnexion
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            // Effacer la session
            sessionStorage.removeItem('qr_scanner_authenticated');
            
            // Arrêter le scan si en cours
            if (this.isScanning) {
                this.stopScan();
            }
            
            // Rediriger vers la page de connexion
            window.location.href = '/login';
        }
    }
}

/**
 * Vérification d'authentification
 * Redirige vers la page de connexion si non authentifié
 */
function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem('qr_scanner_authenticated');
    if (isAuthenticated !== 'true') {
        window.location.href = '/login';
        return false;
    }
    return true;
}

/**
 * Initialisation de l'application
 * Attend que le DOM soit chargé avant de créer l'instance du scanner
 */
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification avant d'initialiser le scanner
    if (checkAuthentication()) {
        new TicketScanner();
    }
});

/**
 * Gestion de l'installation PWA (Progressive Web App)
 * Enregistre un service worker pour permettre l'installation sur mobile
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
