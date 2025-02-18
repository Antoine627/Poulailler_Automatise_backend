// src/controllers/vaccine.controller.js
const Vaccine = require('../models/vaccine.model');
const History = require('../models/history.model');

const addVaccine = async (req, res) => {
    try {
        const vaccine = new Vaccine(req.body);
        await vaccine.save();

        const history = new History({
            type: 'vaccine',
            data: vaccine,
            userId: req.user._id,
            action: 'create',
            description: `Nouveau vaccin: ${vaccine.name}`
        });
        await history.save();

        res.status(201).send(vaccine);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getVaccines = async (req, res) => {
    try {
        const vaccines = await Vaccine.find()
            .sort({ dateAdministered: -1 });
        res.send(vaccines);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getUpcomingVaccines = async (req, res) => {
    try {
        const vaccines = await Vaccine.find({
            nextDueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000)
            }
        }).sort({ nextDueDate: 1 });
        res.send(vaccines);
    } catch (error) {
        res.status(500).send(error);
    }
};


const updateVaccine = async (req, res) => {
    try {
        const vaccine = await Vaccine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!vaccine) {
            return res.status(404).send({ error: 'Vaccine not found' });
        }

        const history = new History({
            type: 'vaccine',
            data: vaccine,
            userId: req.user._id,
            action: 'update',
            description: `Vaccine updated: ${vaccine.name}`
        });
        await history.save();

        res.send(vaccine);
    } catch (error) {
        res.status(400).send(error);
    }
};

const deleteVaccine = async (req, res) => {
    try {
        const vaccine = await Vaccine.findByIdAndDelete(req.params.id);
        if (!vaccine) {
            return res.status(404).send({ error: 'Vaccine not found' });
        }

        const history = new History({
            type: 'vaccine',
            data: vaccine,
            userId: req.user._id,
            action: 'delete',
            description: `Vaccine deleted: ${vaccine.name}`
        });
        await history.save();

        res.send(vaccine);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getVaccinesByUser = async (req, res) => {
    try {
        const vaccines = await Vaccine.find({ userId: req.user._id });
        res.send(vaccines);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    addVaccine,
    getVaccines,
    getUpcomingVaccines,
    updateVaccine,
    deleteVaccine,
    getVaccinesByUser
};
