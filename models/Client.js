const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  preferences: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(pref => typeof pref === 'string' && pref.length > 0);
      },
      message: 'Preferences must be an array of non-empty strings'
    }
  },
  birthday: {
    type: Date,
    required: [true, 'Birthday is required'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v) && v < new Date();
      },
      message: 'Birthday must be a valid date in the past'
    }
  },
  importantDates: {
    type: [Date],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(date => date instanceof Date && !isNaN(date));
      },
      message: 'Important dates must be valid dates'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  consentGiven: {
    type: Boolean,
    default: false
  },
  consentDate: {
    type: Date,
    required: function() {
      return this.consentGiven === true;
    },
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Consent date must be a valid date'
    }
  }
});

// Create indexes for better query performance
clientSchema.index({ name: 1 });
clientSchema.index({ birthday: 1 });
clientSchema.index({ consentGiven: 1 });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client; 