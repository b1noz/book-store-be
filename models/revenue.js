// models/revenue.js
const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    orderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Orders', required: true },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Revenue', revenueSchema);
