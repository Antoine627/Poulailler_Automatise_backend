// src/models/vaccine.model.js
const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateAdministered: {
        type: Date,
        required: true
    },
    nextDueDate: {
        type: Date,
        required: true
    },
    batchNumber: String,
    numberOfChickens: Number,
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Vaccine', vaccineSchema);