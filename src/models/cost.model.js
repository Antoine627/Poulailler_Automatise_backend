// src/models/cost.model.js
const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['food', 'water', 'health', 'equipment', 'other']
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cost', costSchema);