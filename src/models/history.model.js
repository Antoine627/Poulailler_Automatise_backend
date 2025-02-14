// src/models/history.model.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['environmental', 'feeding', 'vaccine', 'production', 'alert', 'maintenance', 'cost']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    description: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index pour une recherche efficace
historySchema.index({ type: 1, createdAt: -1 });
historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);