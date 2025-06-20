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
    birthday: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                // Check if date is not in the future
                return date <= new Date();
            },
            message: 'Birthday cannot be in the future'
        }
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
    purchase_history: [purchaseHistorySchema],
    preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'whatsapp', 'sms'],
        default: 'email'
    },
    daysWithoutInteraction: {
        type: Number,
        default: 0
    },
    followUpPhase: {
        type: String,
        enum: ['initial', 'follow-up', 'maintenance', 're-engagement'],
        default: 'initial'
    }
});

// Create indexes for better query performance
clientSchema.index({ client_id: 1 });
clientSchema.index({ name: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ birthday: 1 });
clientSchema.index({ clientType: 1 });
clientSchema.index({ preferences: 1 });
clientSchema.index({ 'purchase_history.date': 1 });
clientSchema.index({ preferredContactMethod: 1 });
clientSchema.index({ followUpPhase: 1 });

// Update the updatedAt timestamp before saving
clientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client; 