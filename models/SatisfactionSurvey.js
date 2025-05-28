const mongoose = require('mongoose');

const satisfactionSurveySchema = new mongoose.Schema({
  surveyId: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  overallScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  responses: {
    friendliness: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    productKnowledge: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    usefulRecommendations: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    wouldReturn: {
      type: String,
      required: true,
      enum: ['Sí', 'No', 'Tal vez']
    }
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
satisfactionSurveySchema.index({ clientId: 1 });
satisfactionSurveySchema.index({ userId: 1 });
satisfactionSurveySchema.index({ date: -1 });
satisfactionSurveySchema.index({ overallScore: -1 });

const SatisfactionSurvey = mongoose.model('SatisfactionSurvey', satisfactionSurveySchema);

module.exports = SatisfactionSurvey; 