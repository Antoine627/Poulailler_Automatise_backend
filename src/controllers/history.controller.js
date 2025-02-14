// src/controllers/history.controller.js
const History = require('../models/history.model');

const getHistory = async (req, res) => {
    try {
        const { type, startDate, endDate, limit = 50, page = 1 } = req.query;
        let query = {};

        if (type) {
            query.type = type;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const skip = (page - 1) * limit;

        const history = await History.find(query)
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await History.countDocuments(query);

        res.send({
            history,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

const getHistoryByType = async (req, res) => {
    try {
        const { type } = req.params;
        const history = await History.find({ type })
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .limit(50);
        res.send(history);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getHistoryStats = async (req, res) => {
    try {
        const stats = await History.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    lastAction: { $max: '$createdAt' }
                }
            }
        ]);
        res.send(stats);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getHistoryByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await History.find({ userId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .limit(50);
        res.send(history);
    } catch (error) {
        res.status(500).send(error);
    }
};

const searchHistory = async (req, res) => {
    try {
        const { keyword } = req.query;
        const history = await History.find({ description: { $regex: keyword, $options: 'i' } })
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .limit(50);
        res.send(history);
    } catch (error) {
        res.status(500).send(error);
    }
};

const deleteHistoryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await History.findByIdAndDelete(id);
        if (!history) {
            return res.status(404).send({ error: 'History entry not found' });
        }
        res.send(history);
    } catch (error) {
        res.status(500).send(error);
    }
};


const getHistoryByDay = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let matchQuery = {};

        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const historyByDay = await History.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    entries: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } }
        ]);

        res.send(historyByDay);
    } catch (error) {
        res.status(500).send(error);
    }
};



const getHistoryByWeek = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let matchQuery = {};

        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const historyByWeek = await History.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        week: { $week: "$createdAt" }
                    },
                    entries: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.week": -1 } }
        ]);

        res.send(historyByWeek);
    } catch (error) {
        res.status(500).send(error);
    }
};



const getHistoryByMonth = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let matchQuery = {};

        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const historyByMonth = await History.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    entries: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        res.send(historyByMonth);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    getHistory,
    getHistoryByType,
    getHistoryStats,
    getHistoryByUser,
    searchHistory,
    deleteHistoryEntry,
    getHistoryByDay,
    getHistoryByWeek,
    getHistoryByMonth
};
