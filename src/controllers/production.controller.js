// src/controllers/production.controller.js
const Production = require('../models/production.model');
const History = require('../models/history.model');

const addProduction = async (req, res) => {
    try {
        const production = new Production(req.body);
        await production.save();

        const history = new History({
            type: 'production',
            data: production,
            userId: req.user._id,
            action: 'create',
            description: `Production: ${production.chickenCount} poulets`
        });
        await history.save();

        res.status(201).send(production);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getProductionStats = async (req, res) => {
    try {
        const stats = await Production.aggregate([
            {
                $group: {
                    _id: null,
                    totalChickens: { $sum: '$chickenCount' },
                    totalMortality: { $sum: '$mortality' },
                    totalFeedConsumption: { $sum: '$feedConsumption' },
                    totalCosts: {
                        $sum: {
                            $add: [
                                '$costs.feed',
                                '$costs.vaccines',
                                '$costs.utilities',
                                '$costs.other'
                            ]
                        }
                    },
                    totalRevenue: { $sum: '$revenue' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalChickens: 1,
                    totalMortality: 1,
                    totalFeedConsumption: 1,
                    totalCosts: 1,
                    totalRevenue: 1,
                    profit: { $subtract: ['$totalRevenue', '$totalCosts'] }
                }
            }
        ]);
        res.send(stats[0]);
    } catch (error) {
        res.status(500).send(error);
    }
};



const updateProduction = async (req, res) => {
    try {
        const production = await Production.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!production) {
            return res.status(404).send({ error: 'Production not found' });
        }

        const history = new History({
            type: 'production',
            data: production,
            userId: req.user._id,
            action: 'update',
            description: `Production updated: ${production.chickenCount} poulets`
        });
        await history.save();

        res.send(production);
    } catch (error) {
        res.status(400).send(error);
    }
};

const deleteProduction = async (req, res) => {
    try {
        const production = await Production.findByIdAndDelete(req.params.id);
        if (!production) {
            return res.status(404).send({ error: 'Production not found' });
        }

        const history = new History({
            type: 'production',
            data: production,
            userId: req.user._id,
            action: 'delete',
            description: `Production deleted: ${production.chickenCount} poulets`
        });
        await history.save();

        res.send(production);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getProductionsByUser = async (req, res) => {
    try {
        const productions = await Production.find({ userId: req.user._id });
        res.send(productions);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    addProduction,
    getProductionStats,
    updateProduction,
    deleteProduction,
    getProductionsByUser
};
