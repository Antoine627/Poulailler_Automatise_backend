const express = require('express');
const router = express.Router();
const environmentalController = require('../controllers/environmental.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Assurez-vous d'avoir un middleware d'authentification

// Route pour ajouter des données environnementales
router.post('/', authMiddleware, environmentalController.addEnvironmentalData);

// Route pour obtenir les données environnementales avec filtres avancés
router.get('/', authMiddleware, environmentalController.getEnvironmentalData);

// Route pour obtenir les statistiques environnementales
router.get('/stats', authMiddleware, environmentalController.getEnvironmentalStats);

// Route pour obtenir les alertes actives
router.get('/alerts/active', authMiddleware, environmentalController.getActiveAlerts);

// Route pour analyser les tendances environnementales
router.get('/trends', authMiddleware, environmentalController.getEnvironmentalTrends);

// Route pour le contrôle automatique des équipements
router.post('/auto-adjust', authMiddleware, environmentalController.autoAdjustEnvironment);

module.exports = router;
