const mongoose = require('mongoose');

const interactionLogSchema = new mongoose.Schema({
  interaction_id: {
    type: String,
    required: true,
    unique: true
  },
  client_id: {
    type: String,
    required: true,
    ref: 'Client'
  },
  beauty_advisor_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  action: {
    type: String,
    required: true,
    enum: ['consulta', 'prueba', 'compra', 'devolución', 'recomendación']
  },
  viewed_product: {
    type: String,
    required: true
  },
  comments: {
    type: String,
    maxlength: 500
  }
});

// Create indexes for better query performance
interactionLogSchema.index({ interaction_id: 1 });
interactionLogSchema.index({ client_id: 1 });
interactionLogSchema.index({ beauty_advisor_id: 1 });
interactionLogSchema.index({ date: 1 });
interactionLogSchema.index({ action: 1 });
interactionLogSchema.index({ viewed_product: 1 });

module.exports = mongoose.model('InteractionLog', interactionLogSchema); 