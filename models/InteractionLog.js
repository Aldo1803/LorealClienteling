const mongoose = require('mongoose');

const interactionLogSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required'],
    validate: {
      validator: async function(v) {
        const client = await mongoose.model('Client').findById(v);
        return client !== null;
      },
      message: 'Client ID does not exist'
    }
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    minlength: [1, 'SKU cannot be empty'],
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  product: {
    type: String,
    required: [true, 'Product is required'],
    trim: true,
    minlength: [1, 'Product name cannot be empty'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    minlength: [1, 'Brand name cannot be empty'],
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  productPhoto: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Product photo must be a valid file path'
    }
  },
  recommendationDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Recommendation date must be a valid date'
    }
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Additional notes cannot exceed 1000 characters']
  },
  notes: {
    type: String,
    required: [true, 'Notes are required'],
    trim: true,
    minlength: [1, 'Notes cannot be empty'],
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  files: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(file => typeof file === 'string' && file.length > 0);
      },
      message: 'Files must be an array of non-empty strings'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
interactionLogSchema.index({ clientId: 1 });
interactionLogSchema.index({ createdAt: -1 });
interactionLogSchema.index({ sku: 1 });
interactionLogSchema.index({ product: 1 });
interactionLogSchema.index({ brand: 1 });
interactionLogSchema.index({ recommendationDate: -1 });

const InteractionLog = mongoose.model('InteractionLog', interactionLogSchema);

module.exports = InteractionLog; 