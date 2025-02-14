// src/controllers/cost.controller.js
const Cost = require('../models/cost.model');
const History = require('../models/history.model');

// Ajouter un nouveau coût
const addCost = async (req, res) => {
    try {
        const cost = new Cost(req.body);
        await cost.save();

        const history = new History({
            type: 'cost',
            data: cost,
            userId: req.user._id,
            action: 'create',
            description: `Coût ajouté: ${cost.amount}€ pour ${cost.type}`
        });
        await history.save();

        res.status(201).send(cost);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Obtenir l'historique des coûts
const getCostHistory = async (req, res) => {
    try {
        const { startDate, endDate, limit = 50 } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const costs = await Cost.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.send(costs);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Obtenir les statistiques des coûts
const getCostStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Cost.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$type', // Grouper par type de coût
                    totalAmount: { $sum: '$amount' }, // Somme des coûts par catégorie
                    averageAmount: { $avg: '$amount' }, // Moyenne des coûts par catégorie
                    count: { $sum: 1 } // Nombre d'entrées par catégorie
                }
            }
        ]);

        res.send(stats);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Calculer tous les coûts pour le bien-être du poulailler
const calculateTotalCosts = async (req, res) => {
    try {
        const userId = req.user._id; // Récupérer l'ID de l'utilisateur connecté

        // Agréger les coûts par catégorie
        const costsByCategory = await Cost.aggregate([
            { $match: { userId: userId } }, // Filtrer par utilisateur
            {
                $group: {
                    _id: '$type', // Grouper par type de coût
                    totalAmount: { $sum: '$amount' } // Calculer le total pour chaque catégorie
                }
            }
        ]);

        // Calculer le total général
        const totalCosts = costsByCategory.reduce((acc, category) => acc + category.totalAmount, 0);

        // Formater la réponse
        const response = {
            totalCosts,
            costsByCategory
        };

        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({ message: "Erreur lors du calcul des coûts", error: error.message });
    }
};

module.exports = {
    addCost,
    getCostHistory,
    getCostStats,
    calculateTotalCosts
};