const Environmental = require('../models/environmental.model');
const History = require('../models/history.model');
const Alert = require('../models/alert.model'); // Nouveau modèle à créer

// Ajout de données environnementales avec vérification des seuils
const addEnvironmentalData = async (req, res) => {
    try {
        const data = new Environmental(req.body);
        await data.save();

        // Vérification des seuils critiques
        const alerts = await checkThresholds(data);
        
        const history = new History({
            type: 'environmental',
            data: data,
            userId: req.user._id,
            action: 'create',
            description: `Nouvelles données environnementales: ${data.temperature}°C, ${data.humidity}%`
        });
        await history.save();

        res.status(201).send({ data, alerts });
    } catch (error) {
        res.status(400).send(error);
    }
};

// Fonction de vérification des seuils
const checkThresholds = async (data) => {
    const alerts = [];
    
    // Seuils critiques pour différents paramètres
    const thresholds = {
        temperature: { min: 18, max: 26 },
        humidity: { min: 40, max: 70 },
        lightLevel: { min: 20 }
    };

    // Vérification de chaque paramètre
    if (data.temperature < thresholds.temperature.min || data.temperature > thresholds.temperature.max) {
        alerts.push(createAlert('temperature', data.temperature));
    }
    if (data.humidity < thresholds.humidity.min || data.humidity > thresholds.humidity.max) {
        alerts.push(createAlert('humidity', data.humidity));
    }
    if (data.lightLevel < thresholds.lightLevel.min) {
        alerts.push(createAlert('light', data.lightLevel));
    }

    // Sauvegarder les alertes en base de données
    if (alerts.length > 0) {
        await Alert.insertMany(alerts);
    }

    return alerts;
};

// Fonction de création d'alerte
const createAlert = (type, value) => {
    return {
        type,
        value,
        timestamp: new Date(),
        status: 'active'
    };
};

// Récupération des données avec filtres avancés
const getEnvironmentalData = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            limit = 100,
            parameter,
            minValue,
            maxValue
        } = req.query;

        let query = {};

        // Filtres temporels
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Filtres par paramètre et valeur
        if (parameter && (minValue || maxValue)) {
            query[parameter] = {};
            if (minValue) query[parameter].$gte = parseFloat(minValue);
            if (maxValue) query[parameter].$lte = parseFloat(maxValue);
        }

        const data = await Environmental.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Obtenir les statistiques environnementales
const getEnvironmentalStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Environmental.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    avgTemperature: { $avg: '$temperature' },
                    avgHumidity: { $avg: '$humidity' },
                    avgLightLevel: { $avg: '$lightLevel' },
                    maxTemperature: { $max: '$temperature' },
                    minTemperature: { $min: '$temperature' },
                    maxHumidity: { $max: '$humidity' },
                    minHumidity: { $min: '$humidity' }
                }
            }
        ]);

        res.send(stats[0]);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Obtenir les alertes actives
const getActiveAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ status: 'active' })
            .sort({ timestamp: -1 });
        res.send(alerts);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Analyser les tendances
const getEnvironmentalTrends = async (req, res) => {
    try {
        const { parameter, interval = 'hour' } = req.query;
        
        let groupByInterval;
        if (interval === 'hour') {
            groupByInterval = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' },
                hour: { $hour: '$createdAt' }
            };
        } else if (interval === 'day') {
            groupByInterval = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
        }

        const trends = await Environmental.aggregate([
            {
                $group: {
                    _id: groupByInterval,
                    avgValue: { $avg: `$${parameter}` },
                    minValue: { $min: `$${parameter}` },
                    maxValue: { $max: `$${parameter}` }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1, '_id.hour': -1 } }
        ]);

        res.send(trends);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Contrôle automatique des équipements basé sur les données
const autoAdjustEnvironment = async (req, res) => {
    try {
        const latestData = await Environmental.findOne().sort({ createdAt: -1 });
        const adjustments = {
            ventilation: false,
            heating: false,
            cooling: false,
            lighting: false
        };

        // Logique d'ajustement automatique
        if (latestData.temperature > 26) {
            adjustments.cooling = true;
            adjustments.ventilation = true;
        } else if (latestData.temperature < 18) {
            adjustments.heating = true;
        }

        if (latestData.humidity > 70) {
            adjustments.ventilation = true;
        }

        if (latestData.lightLevel < 20) {
            adjustments.lighting = true;
        }

        // Ici, vous pourriez ajouter la logique pour contrôler réellement les équipements
        // via des APIs d'appareils connectés

        res.send(adjustments);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    addEnvironmentalData,
    getEnvironmentalData,
    getEnvironmentalStats,
    getActiveAlerts,
    getEnvironmentalTrends,
    autoAdjustEnvironment
};