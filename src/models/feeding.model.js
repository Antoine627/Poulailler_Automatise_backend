// src/models/feeding.model.js
const mongoose = require('mongoose');

const feedingSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    feedType: {
        type: String,
        required: true
    },
    automaticFeeding: {
        type: Boolean,
        default: true
    },
    remainingStock: {
        type: Number,
        required: true
    },
    waterSupply: {
        startTime: {
            type: String,
            required: false // Optionnel, selon vos besoins
        },
        endTime: {
            type: String,
            required: false // Optionnel, selon vos besoins
        },
        enabled: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feeding', feedingSchema);