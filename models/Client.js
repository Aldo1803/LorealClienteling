const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const clientSchema = new mongoose.Schema({
    client_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true
    },
    clientType: {
        type: String,
        required: true,
        enum: ['nuevo', 'recurrente', 'VIP'],
        default: 'nuevo'
    },
    preferences: [{
        type: String
    }],
    purchase_history: [purchaseHistorySchema]
});

// Create indexes for better query performance
clientSchema.index({ client_id: 1 });
clientSchema.index({ name: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ clientType: 1 });
clientSchema.index({ preferences: 1 });
clientSchema.index({ 'purchase_history.date': 1 });

// Update the updatedAt timestamp before saving
clientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client; 