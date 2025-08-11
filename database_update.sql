-- Script de mise à jour de la base de données pour le système de scan de QR codes
-- À exécuter sur votre base de données existante

USE espace_comedie;

-- Ajouter les colonnes nécessaires à la table reservation
ALTER TABLE reservation 
ADD COLUMN used BOOLEAN DEFAULT FALSE COMMENT 'Indique si le billet a été utilisé',
ADD COLUMN used_at TIMESTAMP NULL COMMENT 'Date et heure d\'utilisation du billet',
ADD COLUMN qr_code_generated BOOLEAN DEFAULT FALSE COMMENT 'Indique si un QR code a été généré pour cette réservation';

-- Créer un index pour optimiser les requêtes de vérification
CREATE INDEX idx_reservation_verification ON reservation(user_id, spectacle_id, used);

-- Créer un index pour les statistiques
CREATE INDEX idx_reservation_used_at ON reservation(used_at);

-- Mettre à jour les réservations existantes (optionnel)
-- UPDATE reservation SET used = FALSE, qr_code_generated = FALSE WHERE used IS NULL;

-- Vérifier la structure mise à jour
DESCRIBE reservation;

-- Afficher quelques exemples de réservations
SELECT 
    r.id,
    r.user_id,
    r.spectacle_id,
    r.nb_places,
    r.used,
    r.used_at,
    r.qr_code_generated,
    s.title as spectacle_title,
    u.nom,
    u.prenom
FROM reservation r
JOIN spectacle s ON r.spectacle_id = s.id
JOIN user u ON r.user_id = u.id
LIMIT 5;
