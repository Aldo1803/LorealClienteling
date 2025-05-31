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
  },
  // New fields for file uploads and additional metadata
  product_photo: {
    type: String,
    default: null
  },
  additional_files: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    location: String,
    duration: Number, // in minutes
    follow_up_required: {
      type: Boolean,
      default: false
    },
    follow_up_date: Date,
    follow_up_notes: String
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
interactionLogSchema.index({ interaction_id: 1 });
interactionLogSchema.index({ client_id: 1 });
interactionLogSchema.index({ beauty_advisor_id: 1 });
interactionLogSchema.index({ date: 1 });
interactionLogSchema.index({ action: 1 });
interactionLogSchema.index({ viewed_product: 1 });
interactionLogSchema.index({ 'metadata.follow_up_required': 1 });
interactionLogSchema.index({ 'metadata.follow_up_date': 1 });

module.exports = mongoose.model('InteractionLog', interactionLogSchema); 