const Alert = require('../models/alert.model');

// Créer une nouvelle alerte
const createAlert = async (req, res) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
        res.status(201).send(alert);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Obtenir toutes les alertes
const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });
        res.send(alerts);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Obtenir les alertes actives
const getActiveAlerts = async (req, res) => {
    try {
        const alerts = await Alert.findActive();
        res.send(alerts);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Obtenir les alertes critiques
const getCriticalAlerts = async (req, res) => {
    try {
        const alerts = await Alert.findCritical();
        res.send(alerts);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Acquitter une alerte
const acknowledgeAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).send({ error: 'Alert not found' });
        }
        await alert.acknowledge(req.user._id);
        res.send(alert);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Résoudre une alerte
const resolveAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).send({ error: 'Alert not found' });
        }
        await alert.resolve(req.user._id);
        res.send(alert);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Ajouter une action à une alerte
const addActionToAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).send({ error: 'Alert not found' });
        }
        await alert.addAction(req.body, req.user._id);
        res.send(alert);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    createAlert,
    getAlerts,
    getActiveAlerts,
    getCriticalAlerts,
    acknowledgeAlert,
    resolveAlert,
    addActionToAlert
};
