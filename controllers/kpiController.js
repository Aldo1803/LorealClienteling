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

// Get clients without recent interactions
exports.getClientsWithoutRecentInteractions = async (req, res) => {
    try {
        const daysThreshold = parseInt(req.query.days) || 30; // Default to 30 days if not specified
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

        // Get all clients
        const allClients = await Client.find();
        console.log('Total clients found:', allClients.length);
        
        // Get clients with recent interactions
        const recentInteractions = await InteractionLog.find({
            date: { $gte: cutoffDate }
        }).distinct('client_id');
        console.log('Clients with recent interactions:', recentInteractions);

        // Filter out clients with recent interactions
        const inactiveClients = allClients.filter(client => 
            !recentInteractions.includes(client.client_id)
        );
        console.log('Inactive clients found:', inactiveClients.length);

        // Add days since last interaction for each client
        const clientsWithDetails = await Promise.all(inactiveClients.map(async (client) => {
            try {
                console.log('Checking client:', client.client_id);
                
                // Find the most recent interaction for this client
                const lastInteraction = await InteractionLog.findOne({ 
                    client_id: client.client_id 
                }).sort({ date: -1 }).lean();
                
                console.log('Last interaction found for client', client.client_id, ':', lastInteraction);

                let daysSinceLastInteraction = null;
                let lastInteractionDate = null;

                if (lastInteraction && lastInteraction.date) {
                    try {
                        const lastDate = new Date(lastInteraction.date);
                        if (!isNaN(lastDate.getTime())) {  // Check if date is valid
                            const now = new Date();
                            daysSinceLastInteraction = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                            lastInteractionDate = lastDate;
                            console.log('Calculated days since last interaction for client', client.client_id, ':', daysSinceLastInteraction);
                        } else {
                            console.log('Invalid date format for client', client.client_id, ':', lastInteraction.date);
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

                console.log('Final client details:', clientDetails);
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