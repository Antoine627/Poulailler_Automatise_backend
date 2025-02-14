// src/routes/feeding.routes.js
const express = require('express');
const router = express.Router();
const feedingController = require('../controllers/feeding.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const costController = require('../controllers/cost.controller');

// Route pour ajouter une nouvelle alimentation
router.post('/', authMiddleware, feedingController.addFeeding);

// Route pour obtenir l'historique des alimentations
router.get('/', authMiddleware, feedingController.getFeedingHistory);

// Route pour mettre à jour une alimentation
router.put('/:id', authMiddleware, feedingController.updateFeeding);

// Route pour supprimer une alimentation
router.delete('/:id', authMiddleware, feedingController.deleteFeeding);

// Route pour obtenir les statistiques des alimentations
router.get('/stats', authMiddleware, feedingController.getFeedingStats);

// Route pour obtenir les alertes de stock bas
router.get('/alerts/low-stock', authMiddleware, feedingController.getAlertLowStock);

// Route pour ajouter plusieurs alimentations en une seule requête
router.post('/bulk', authMiddleware, feedingController.bulkAddFeedings);

// Route pour mettre à jour l'apport en eau
router.put('/:id/water-supply', authMiddleware, feedingController.updateWaterSupply);


module.exports = router;