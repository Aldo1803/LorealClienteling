const Client = require('../models/Client');
const InteractionLog = require('../models/InteractionLog');

exports.getSummary = async (req, res) => {
  try {
    const { fromDate, toDate, advisorId } = req.query;

    // Build base query conditions
    const baseQuery = {};
    const interactionQuery = {};

    // Add date range filter if provided
    if (fromDate || toDate) {
      interactionQuery.createdAt = {};
      if (fromDate) {
        interactionQuery.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        interactionQuery.createdAt.$lte = new Date(toDate);
      }
    }

    // Prepare for future advisorId filter
    if (advisorId) {
      // This will be implemented when advisor functionality is added
      // interactionQuery.advisorId = advisorId;
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
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      recentInteractions = await InteractionLog.countDocuments({
        ...interactionQuery,
        createdAt: { $gte: thirtyDaysAgo }
      });
    }

    // Get number of clients with at least one interaction (filtered if date range provided)
    const clientsWithInteractions = await InteractionLog.distinct('clientId', interactionQuery);
    const clientsWithFollowUp = clientsWithInteractions.length;

    res.status(200).json({
      totalClients,
      totalInteractions,
      recentInteractions,
      clientsWithFollowUp,
      filters: {
        fromDate: fromDate || null,
        toDate: toDate || null,
        advisorId: advisorId || null
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching KPI summary',
      error: error.message
    });
  }
}; 