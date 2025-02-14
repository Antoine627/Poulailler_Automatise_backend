// src/models/production.model.js
const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
    chickenCount: {
        type: Number,
        required: true
    },
    mortality: {
        type: Number,
        default: 0
    },
    feedConsumption: {
        type: Number,
        required: true
    },
    costs: {
        feed: Number,
        vaccines: Number,
        utilities: Number,
        other: Number
    },
    revenue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Production', productionSchema);