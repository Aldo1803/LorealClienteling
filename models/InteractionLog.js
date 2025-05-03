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

const InteractionLog = mongoose.model('InteractionLog', interactionLogSchema);

module.exports = InteractionLog; 