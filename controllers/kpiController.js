const Client = require('../models/Client');
const InteractionLog = require('../models/InteractionLog');
const SatisfactionSurvey = require('../models/SatisfactionSurvey');

exports.getSummary = async (req, res) => {
  try {
    const { fromDate, toDate, advisorId } = req.query;

    // Build base query conditions
    const baseQuery = {};
    const interactionQuery = {};

    // Add date range filter if provided
    if (fromDate || toDate) {
      interactionQuery.date = {};
      if (fromDate) {
        const fromDateObj = new Date(fromDate);
        fromDateObj.setHours(0, 0, 0, 0); // Set to start of day
        interactionQuery.date.$gte = fromDateObj;
      }
      if (toDate) {
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999); // Set to end of day
        interactionQuery.date.$lte = toDateObj;
      }
    }

    // Add advisor filter if provided
    if (advisorId) {
      interactionQuery.beauty_advisor_id = advisorId;
    }

    // Get total number of clients
    const totalClients = await Client.countDocuments();

    // Get total number of interaction logs (filtered if date range provided)
    const totalInteractions = await InteractionLog.countDocuments(interactionQuery);

    // Get interactions in the last 30 days (only if no date range provided)
    let recentInteractions;
    if (fromDate || toDate) {
      recentInteractions = totalInteractions; // If date range provided, use total filtered count
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setHours(0, 0, 0, 0); // Set to start of day
      const recentQuery = {
        ...interactionQuery,
        date: { $gte: thirtyDaysAgo }
      };
      recentInteractions = await InteractionLog.countDocuments(recentQuery);
    }

    // Get number of clients with at least one interaction (filtered if date range provided)
    const clientsWithInteractions = await InteractionLog.distinct('client_id', interactionQuery);
    const clientsWithFollowUp = clientsWithInteractions.length;

    const response = {
      totalClients,
      totalInteractions,
      recentInteractions,
      clientsWithFollowUp,
      filters: {
        fromDate: fromDate || null,
        toDate: toDate || null,
        advisorId: advisorId || null
      }
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching KPI summary',
      error: error.message
    });
  }
};

// Get clients without recent interactions
exports.getClientsWithoutRecentInteractions = async (req, res) => {
    try {
        const daysThreshold = parseInt(req.query.days) || 30; // Default to 30 days if not specified
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

        // Get all clients
        const allClients = await Client.find();
        
        // Get clients with recent interactions
        const recentInteractions = await InteractionLog.find({
            date: { $gte: cutoffDate }
        }).distinct('client_id');

        // Filter out clients with recent interactions
        const inactiveClients = allClients.filter(client => 
            !recentInteractions.includes(client._id.toString())
        );

        // Add days since last interaction for each client
        const clientsWithDetails = await Promise.all(inactiveClients.map(async (client) => {
            try {
                // Find the most recent interaction for this client
                const lastInteraction = await InteractionLog.findOne({ 
                    client_id: client._id.toString()
                }).sort({ date: -1 }).lean();
                
                let daysSinceLastInteraction = null;
                let lastInteractionDate = null;

                if (lastInteraction && lastInteraction.date) {
                    try {
                        const lastDate = new Date(lastInteraction.date);
                        if (!isNaN(lastDate.getTime())) {  // Check if date is valid
                            const now = new Date();
                            daysSinceLastInteraction = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                            lastInteractionDate = lastDate;
                        }
                    } catch (dateError) {
                        console.error('Error processing date for client', client.client_id, ':', dateError);
                    }
                } else {
                    console.log('No valid interaction found for client', client.client_id);
                }

                const clientDetails = {
                    ...client.toObject(),
                    days_since_last_interaction: daysSinceLastInteraction,
                    last_interaction_date: lastInteractionDate
                };

                return clientDetails;
            } catch (error) {
                console.error('Error processing client:', client.client_id, error);
                return {
                    ...client.toObject(),
                    days_since_last_interaction: null,
                    last_interaction_date: null,
                    error: 'Error processing interaction data'
                };
            }
        }));

        // Log the final response
        console.log('Final response:', {
            total_clients: allClients.length,
            inactive_clients: clientsWithDetails.length,
            days_threshold: daysThreshold,
            sample_client: clientsWithDetails[0] // Log first client as sample
        });

        res.json({
            total_clients: allClients.length,
            inactive_clients: clientsWithDetails.length,
            days_threshold: daysThreshold,
            clients: clientsWithDetails
        });
    } catch (error) {
        console.error('Error in getClientsWithoutRecentInteractions:', error);
        res.status(500).json({ 
            message: 'Error fetching inactive clients',
            error: error.message 
        });
    }
};

// Get average satisfaction score
exports.getAverageSatisfactionScore = async (req, res) => {
  try {
    const { fromDate, toDate, advisorId } = req.query;

    // Build base query conditions
    const surveyQuery = {};

    // Add date range filter if provided
    if (fromDate || toDate) {
      surveyQuery.date = {};
      if (fromDate) {
        const fromDateObj = new Date(fromDate);
        fromDateObj.setHours(0, 0, 0, 0); // Set to start of day
        surveyQuery.date.$gte = fromDateObj;
      }
      if (toDate) {
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999); // Set to end of day
        surveyQuery.date.$lte = toDateObj;
      }
    }

    // Add advisor filter if provided
    if (advisorId) {
      surveyQuery.userId = advisorId;
    }

    // Get all surveys matching the query
    const surveys = await SatisfactionSurvey.find(surveyQuery).lean();

    if (surveys.length === 0) {
      return res.status(200).json({
        averageScore: 0,
        totalSurveys: 0,
        scoreDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        filters: {
          fromDate: fromDate || null,
          toDate: toDate || null,
          advisorId: advisorId || null
        }
      });
    }

    // Calculate average score
    const totalScore = surveys.reduce((sum, survey) => sum + survey.overallScore, 0);
    const averageScore = totalScore / surveys.length;

    // Calculate score distribution
    const scoreDistribution = surveys.reduce((dist, survey) => {
      dist[survey.overallScore] = (dist[survey.overallScore] || 0) + 1;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    // Calculate average scores for each response category
    const categoryAverages = {
      friendliness: 0,
      productKnowledge: 0,
      usefulRecommendations: 0
    };

    surveys.forEach(survey => {
      categoryAverages.friendliness += survey.responses.friendliness;
      categoryAverages.productKnowledge += survey.responses.productKnowledge;
      categoryAverages.usefulRecommendations += survey.responses.usefulRecommendations;
    });

    Object.keys(categoryAverages).forEach(category => {
      categoryAverages[category] = categoryAverages[category] / surveys.length;
    });

    // Calculate percentage of "would return" responses
    const wouldReturnCount = surveys.filter(survey => 
      survey.responses.wouldReturn === 'Sí'
    ).length;
    const wouldReturnPercentage = (wouldReturnCount / surveys.length) * 100;

    const response = {
      averageScore: parseFloat(averageScore.toFixed(2)),
      totalSurveys: surveys.length,
      scoreDistribution,
      categoryAverages: Object.fromEntries(
        Object.entries(categoryAverages).map(([key, value]) => [key, parseFloat(value.toFixed(2))])
      ),
      wouldReturnPercentage: parseFloat(wouldReturnPercentage.toFixed(2)),
      filters: {
        fromDate: fromDate || null,
        toDate: toDate || null,
        advisorId: advisorId || null
      }
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: 'Error calculating average satisfaction score',
      error: error.message
    });
  }
}; 