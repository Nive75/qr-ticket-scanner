class TicketScanner {
    constructor() {
        this.html5QrcodeScanner = null;
        this.isScanning = false;
        this.isProcessing = false; // Pour éviter les scans multiples
        this.scannedTickets = new Set(); // Pour tracker les billets déjà scannés
        this.stats = {
            totalScanned: 0,
            validTickets: 0,
            invalidTickets: 0
        };
        this.offlineScans = [];
        
        this.initializeElements();
        this.bindEvents();
        this.checkOnlineStatus();
        this.loadOfflineScans();
        this.updateStats();
    }

    initializeElements() {
        this.elements = {
            reader: document.getElementById('reader'),
            startScanBtn: document.getElementById('startScanBtn'),
            stopScanBtn: document.getElementById('stopScanBtn'),
            showStatsBtn: document.getElementById('showStatsBtn'),
            clearResultsBtn: document.getElementById('clearResultsBtn'),
            testBtn: document.getElementById('testBtn'),
            testDataBtn: document.getElementById('testDataBtn'),
            continueBtn: document.getElementById('continueBtn'),
            resultContainer: document.getElementById('resultContainer'),
            resultTitle: document.getElementById('resultTitle'),
            ticketInfo: document.getElementById('ticketInfo'),
            statusIndicator: document.getElementById('statusIndicator'),
            loading: document.getElementById('loading'),
            stats: document.getElementById('stats'),
            offlineIndicator: document.getElementById('offlineIndicator'),
            totalScanned: document.getElementById('totalScanned'),
            validTickets: document.getElementById('validTickets'),
            invalidTickets: document.getElementById('invalidTickets')
        };
    }

    bindEvents() {
        this.elements.startScanBtn.addEventListener('click', () => this.startScan());
        this.elements.stopScanBtn.addEventListener('click', () => this.stopScan());
        this.elements.showStatsBtn.addEventListener('click', () => this.toggleStats());
        this.elements.clearResultsBtn.addEventListener('click', () => this.clearResults());
        this.elements.testBtn.addEventListener('click', () => this.testScanner());
        this.elements.testDataBtn.addEventListener('click', () => this.testData());
        this.elements.continueBtn.addEventListener('click', () => this.continueScanning());
        
        // Écouter les changements de connectivité
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    checkOnlineStatus() {
        this.handleOnlineStatus(navigator.onLine);
    }

    handleOnlineStatus(isOnline) {
        if (isOnline) {
            this.elements.offlineIndicator.style.display = 'none';
            // Synchroniser les scans hors ligne
            this.syncOfflineScans();
        } else {
            this.elements.offlineIndicator.style.display = 'block';
        }
    }

    testScanner() {
        console.log('Démarrage du scan dynamique...');
        // Démarrer le vrai scanner avec la caméra
        this.startScan();
    }

    testData() {
        console.log('Test avec données simulées...');
        // Simuler un scan réussi avec le format exact (pour tests uniquement)
        const testData = {
            reservation_id: Math.floor(Math.random() * 1000) + 1,
            spectacle_title: "L'autre, c'est moi",
            date_spectacle: "2025-11-15T00:00:00.000Z",
            heure_spectacle: "21:00:00",
            nb_places: 1,
            type: "ticket_validation",
            timestamp: "2025-08-11T22:13:52.337Z"
        };
        this.handleScanResult(JSON.stringify(testData));
    }

    async startScan() {
        if (this.isScanning) return;

        try {
            this.isScanning = true;
            this.elements.startScanBtn.style.display = 'none';
            this.elements.stopScanBtn.style.display = 'inline-block';
            this.elements.statusIndicator.className = 'status-indicator scanning';

            // Configuration du scanner optimisée pour mobile
            const config = {
                fps: 10,
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0,
                disableFlip: false,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            this.html5QrcodeScanner = new Html5Qrcode("reader");
            
            console.log('Démarrage du scanner...');
            
            // Démarrer le scan
            await this.html5QrcodeScanner.start(
                { facingMode: "environment" }, // Utiliser la caméra arrière sur mobile
                config,
                (decodedText, decodedResult) => {
                    console.log('🎯 QR Code détecté!');
                    console.log('📄 Contenu:', decodedText);
                    console.log('🔍 Détails:', decodedResult);
                    this.handleScanResult(decodedText);
                },
                (errorMessage) => {
                    // Erreurs de scan ignorées (continuer à scanner)
                    console.log('⚠️ Scan error:', errorMessage);
                }
            );

        } catch (error) {
            console.error('Erreur lors du démarrage du scan:', error);
            this.showError('Impossible de démarrer la caméra. Vérifiez les permissions.');
            this.stopScan();
        }
    }

    async stopScan() {
        if (!this.isScanning) return;

        try {
            if (this.html5QrcodeScanner) {
                await this.html5QrcodeScanner.stop();
                this.html5QrcodeScanner.clear();
            }
        } catch (error) {
            console.error('Erreur lors de l\'arrêt du scan:', error);
        }

        this.isScanning = false;
        this.elements.startScanBtn.style.display = 'inline-block';
        this.elements.stopScanBtn.style.display = 'none';
        this.elements.statusIndicator.className = 'status-indicator';
    }

    async handleScanResult(decodedText) {
        // Éviter les scans multiples
        if (this.isProcessing) {
            console.log('Scan en cours, ignoré');
            return;
        }
        
        this.isProcessing = true;
        
        // Arrêter temporairement le scan pour éviter les scans multiples
        await this.stopScan();
        
        this.showLoading(true);
        this.elements.statusIndicator.className = 'status-indicator scanning';

        try {
            // Essayer de parser le JSON du QR code
            let ticketData;
            try {
                ticketData = JSON.parse(decodedText);
                console.log('Données du billet:', ticketData);
            } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                this.showError('QR code non reconnu');
                return;
            }

            // Créer un identifiant unique pour ce billet
            const ticketId = `${ticketData.reservation_id}_${ticketData.spectacle_title}_${ticketData.date_spectacle}`;
            
            // Vérifier si ce billet a déjà été scanné
            if (this.scannedTickets.has(ticketId)) {
                this.showError('Ce billet a déjà été scanné');
                return;
            }

            // Vérifier si nous sommes en ligne
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

    async verifyTicketOnline(data, ticketId) {
        try {
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
                    // Ajouter le billet à la liste des billets scannés
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

            // Mettre à jour les statistiques
            this.updateStatsFromResult(result.success);
            
        } catch (error) {
            console.error('Erreur réseau:', error);
            // En cas d'erreur réseau, sauvegarder pour traitement hors ligne
            this.handleOfflineScan(data);
        }
    }

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

    showLoading(show) {
        this.elements.loading.style.display = show ? 'block' : 'none';
    }

    showSuccess(result) {
        this.elements.statusIndicator.className = 'status-indicator success';
        this.elements.resultContainer.className = 'result-container success';
        this.elements.resultTitle.textContent = '✅ ' + result.message;
        
        if (result.ticketInfo) {
            this.elements.ticketInfo.innerHTML = this.formatTicketInfo(result.ticketInfo);
        }
        
        this.elements.resultContainer.style.display = 'block';
        this.elements.continueBtn.style.display = 'inline-block';
        
        // Son de succès (si supporté)
        this.playSound('success');
    }

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
        
        // Son d'erreur (si supporté)
        this.playSound('error');
    }

    showUsedTicket(result) {
        this.elements.statusIndicator.className = 'status-indicator scanning';
        this.elements.resultContainer.className = 'result-container used';
        this.elements.resultTitle.textContent = '🟠 ' + result.message;
        
        if (result.ticketInfo) {
            this.elements.ticketInfo.innerHTML = this.formatTicketInfo(result.ticketInfo);
        }
        
        this.elements.resultContainer.style.display = 'block';
        this.elements.continueBtn.style.display = 'inline-block';
        
        // Son d'avertissement (si supporté)
        this.playSound('warning');
    }

    showWarning(message, details = '') {
        this.elements.statusIndicator.className = 'status-indicator scanning';
        this.elements.resultContainer.className = 'result-container warning';
        this.elements.resultTitle.textContent = '⚠️ ' + message;
        this.elements.ticketInfo.innerHTML = details ? `<p>${details}</p>` : '';
        this.elements.resultContainer.style.display = 'block';
    }

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

    playSound(type) {
        // Créer un contexte audio simple pour les notifications sonores
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency;
            switch(type) {
                case 'success':
                    frequency = 800;
                    break;
                case 'error':
                    frequency = 400;
                    break;
                case 'warning':
                    frequency = 600;
                    break;
                default:
                    frequency = 500;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Ignorer les erreurs audio
        }
    }

    updateStatsFromResult(isValid) {
        this.stats.totalScanned++;
        if (isValid) {
            this.stats.validTickets++;
        } else {
            this.stats.invalidTickets++;
        }
        this.updateStats();
    }

    updateStats() {
        this.elements.totalScanned.textContent = this.stats.totalScanned;
        this.elements.validTickets.textContent = this.stats.validTickets;
        this.elements.invalidTickets.textContent = this.stats.invalidTickets;
    }

    toggleStats() {
        const isVisible = this.elements.stats.style.display === 'block';
        this.elements.stats.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.loadStats();
        }
    }

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

    continueScanning() {
        this.elements.resultContainer.style.display = 'none';
        this.elements.continueBtn.style.display = 'none';
        this.elements.statusIndicator.className = 'status-indicator';
        
        // Redémarrer automatiquement le scan pour le prochain billet
        this.startScan();
    }

    clearResults() {
        this.elements.resultContainer.style.display = 'none';
        this.elements.continueBtn.style.display = 'none';
        this.elements.statusIndicator.className = 'status-indicator';
        this.stats = {
            totalScanned: 0,
            validTickets: 0,
            invalidTickets: 0
        };
        this.scannedTickets.clear(); // Vider la liste des billets scannés
        this.updateStats();
    }

    saveOfflineScans() {
        try {
            localStorage.setItem('offlineScans', JSON.stringify(this.offlineScans));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde hors ligne:', error);
        }
    }

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
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    new TicketScanner();
});

// Gestion de l'installation PWA (si applicable)
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
