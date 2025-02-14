// src/controllers/feeding.controller.js
const Feeding = require('../models/feeding.model');
const History = require('../models/history.model');

const addFeeding = async (req, res) => {
    try {
        const feeding = new Feeding(req.body);
        await feeding.save();

        const history = new History({
            type: 'feeding',
            data: feeding,
            userId: req.user._id,
            action: 'create',
            description: `Alimentation ajoutée: ${feeding.quantity}kg de ${feeding.feedType}`
        });
        await history.save();

        res.status(201).send(feeding);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getFeedingHistory = async (req, res) => {
    try {
        const { startDate, endDate, limit = 50 } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const feedings = await Feeding.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.send(feedings);
    } catch (error) {
        res.status(500).send(error);
    }
};

const updateFeeding = async (req, res) => {
    try {
        const feeding = await Feeding.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!feeding) {
            return res.status(404).send();
        }

        const history = new History({
            type: 'feeding',
            data: feeding,
            userId: req.user._id,
            action: 'update',
            description: `Alimentation mise à jour: ${feeding.quantity}kg de ${feeding.feedType}`
        });
        await history.save();

        res.send(feeding);
    } catch (error) {
        res.status(400).send(error);
    }
};

const deleteFeeding = async (req, res) => {
    try {
        const feeding = await Feeding.findByIdAndDelete(req.params.id);
        
        if (!feeding) {
            return res.status(404).send();
        }

        const history = new History({
            type: 'feeding',
            data: feeding,
            userId: req.user._id,
            action: 'delete',
            description: `Alimentation supprimée: ${feeding.quantity}kg de ${feeding.feedType}`
        });
        await history.save();

        res.send(feeding);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getFeedingStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Feeding.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$feedType',
                    totalQuantity: { $sum: '$quantity' },
                    averageQuantity: { $avg: '$quantity' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.send(stats);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getAlertLowStock = async (req, res) => {
    try {
        const alerts = await Feeding.aggregate([
            {
                $group: {
                    _id: '$feedType',
                    currentStock: { $sum: '$stockQuantity' }
                }
            },
            {
                $match: {
                    currentStock: { $lt: 100 } // Seuil personnalisable
                }
            }
        ]);

        res.send(alerts);
    } catch (error) {
        res.status(500).send(error);
    }
};

const bulkAddFeedings = async (req, res) => {
    try {
        const feedings = await Feeding.insertMany(req.body.feedings);
        
        const historyEntries = feedings.map(feeding => ({
            type: 'feeding',
            data: feeding,
            userId: req.user._id,
            action: 'bulk_create',
            description: `Alimentation ajoutée en masse: ${feeding.quantity}kg de ${feeding.feedType}`
        }));

        await History.insertMany(historyEntries);

        res.status(201).send(feedings);
    } catch (error) {
        res.status(400).send(error);
    }
};

const updateWaterSupply = async (req, res) => {
    try {
        const { startTime, endTime, enabled } = req.body;
        const feeding = await Feeding.findByIdAndUpdate(
            req.params.id,
            { 
                waterSupply: {
                    startTime,
                    endTime,
                    enabled
                }
            },
            { new: true, runValidators: true }
        );

        if (!feeding) {
            return res.status(404).send();
        }

        const history = new History({
            type: 'feeding',
            data: feeding,
            userId: req.user._id,
            action: 'update',
            description: `Apport en eau mis à jour: Début à ${startTime}, Fin à ${endTime}`
        });
        await history.save();

        res.send(feeding);
    } catch (error) {
        res.status(400).send(error);
    }
};

module.exports = {
    addFeeding,
    getFeedingHistory,
    updateFeeding,
    deleteFeeding,
    getFeedingStats,
    getAlertLowStock,
    bulkAddFeedings,
    updateWaterSupply
};