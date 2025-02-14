// src/routes/cost.routes.js
const express = require('express');
const router = express.Router();
const costController = require('../controllers/cost.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Route pour ajouter un coût
router.post('/', authMiddleware, costController.addCost);

// Route pour obtenir l'historique des coûts
router.get('/', authMiddleware, costController.getCostHistory);

// Route pour obtenir les statistiques des coûts
router.get('/stats', authMiddleware, costController.getCostStats);

// Route pour calculer tous les coûts
router.get('/total', authMiddleware, costController.calculateTotalCosts);

module.exports = router;