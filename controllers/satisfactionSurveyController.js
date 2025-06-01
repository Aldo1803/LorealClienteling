const SatisfactionSurvey = require('../models/SatisfactionSurvey');
const { v4: uuidv4 } = require('uuid');

// Create a new satisfaction survey
exports.createSurvey = async (req, res) => {
  try {
    const {
      clientId,
      interactionId,
      overallScore,
      responses,
      comments
    } = req.body;

    // Validate required fields
    const requiredFields = ['clientId', 'interactionId', 'overallScore', 'responses'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    // Validate responses object
    const requiredResponses = ['friendliness', 'productKnowledge', 'usefulRecommendations', 'wouldReturn'];
    const missingResponses = requiredResponses.filter(response => !responses[response]);
    
    if (missingResponses.length > 0) {
      return res.status(400).json({
        message: 'Missing required responses',
        fields: missingResponses
      });
    }

    const survey = new SatisfactionSurvey({
      surveyId: uuidv4(),
      clientId,
      interactionId,
      userId: req.user._id,
      overallScore,
      responses,
      comments
    });

    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(400).json({
      message: 'Error creating satisfaction survey',
      error: error.message
    });
  }
};

// Get all surveys
exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await SatisfactionSurvey.find()
      .populate('clientId', 'firstName lastName')
      .populate('userId', 'name')
      .sort({ date: -1 });
    res.status(200).json(surveys);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching satisfaction surveys',
      error: error.message
    });
  }
};

// Get surveys by client ID
exports.getClientSurveys = async (req, res) => {
  try {
    const surveys = await SatisfactionSurvey.find({ clientId: req.params.clientId })
      .populate('userId', 'name')
      .sort({ date: -1 });
    res.status(200).json(surveys);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching client satisfaction surveys',
      error: error.message
    });
  }
};

// Get survey by ID
exports.getSurveyById = async (req, res) => {
  try {
    const survey = await SatisfactionSurvey.findById(req.params.id)
      .populate('clientId', 'firstName lastName')
      .populate('userId', 'name');
    
    if (!survey) {
      return res.status(404).json({ message: 'Satisfaction survey not found' });
    }
    
    res.status(200).json(survey);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching satisfaction survey',
      error: error.message
    });
  }
};

// Get survey by interaction ID
exports.getSurveyByInteractionId = async (req, res) => {
  try {
    const survey = await SatisfactionSurvey.findOne({ interactionId: req.params.interactionId })
      .populate('clientId', 'firstName lastName')
      .populate('userId', 'name')
      .populate('interactionId');
    
    if (!survey) {
      return res.status(404).json({ message: 'Satisfaction survey not found for this interaction' });
    }
    
    res.status(200).json(survey);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching satisfaction survey',
      error: error.message
    });
  }
};

// Update survey
exports.updateSurvey = async (req, res) => {
  try {
    const {
      overallScore,
      responses,
      comments
    } = req.body;

    // Validate responses if being updated
    if (responses) {
      const requiredResponses = ['friendliness', 'productKnowledge', 'usefulRecommendations', 'wouldReturn'];
      const missingResponses = requiredResponses.filter(response => !responses[response]);
      
      if (missingResponses.length > 0) {
        return res.status(400).json({
          message: 'Missing required responses',
          fields: missingResponses
        });
      }
    }

    const survey = await SatisfactionSurvey.findByIdAndUpdate(
      req.params.id,
      {
        overallScore,
        responses,
        comments
      },
      { new: true, runValidators: true }
    );

    if (!survey) {
      return res.status(404).json({ message: 'Satisfaction survey not found' });
    }

    res.status(200).json(survey);
  } catch (error) {
    res.status(400).json({
      message: 'Error updating satisfaction survey',
      error: error.message
    });
  }
};

// Delete survey
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await SatisfactionSurvey.findByIdAndDelete(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Satisfaction survey not found' });
    }

    res.status(200).json({ message: 'Satisfaction survey deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting satisfaction survey',
      error: error.message
    });
  }
};

// Get survey statistics
exports.getSurveyStats = async (req, res) => {
  try {
    const { fromDate, toDate, userId } = req.query;
    
    const query = {};
    
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }
    
    if (userId) {
      query.userId = userId;
    }

    const stats = await SatisfactionSurvey.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageOverallScore: { $avg: '$overallScore' },
          averageFriendliness: { $avg: '$responses.friendliness' },
          averageProductKnowledge: { $avg: '$responses.productKnowledge' },
          averageUsefulRecommendations: { $avg: '$responses.usefulRecommendations' },
          wouldReturnCount: {
            $sum: {
              $cond: [{ $eq: ['$responses.wouldReturn', 'Sí'] }, 1, 0]
            }
          },
          totalSurveys: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(stats[0] || {
      averageOverallScore: 0,
      averageFriendliness: 0,
      averageProductKnowledge: 0,
      averageUsefulRecommendations: 0,
      wouldReturnCount: 0,
      totalSurveys: 0
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching survey statistics',
      error: error.message
    });
  }
}; 