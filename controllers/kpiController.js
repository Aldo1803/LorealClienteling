const Client = require('../models/Client');
const InteractionLog = require('../models/InteractionLog');

exports.getSummary = async (req, res) => {
  try {
    const { fromDate, toDate, advisorId } = req.query;
    console.log('Query parameters:', { fromDate, toDate, advisorId });

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
        console.log('From date:', fromDateObj);
      }
      if (toDate) {
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999); // Set to end of day
        interactionQuery.date.$lte = toDateObj;
        console.log('To date:', toDateObj);
      }
    }
    console.log('Interaction query:', JSON.stringify(interactionQuery, null, 2));

    // Add advisor filter if provided
    if (advisorId) {
      interactionQuery.beauty_advisor_id = advisorId;
    }

    // Get total number of clients
    const totalClients = await Client.countDocuments();
    console.log('Total clients:', totalClients);

    // Debug: Check all interactions without filters
    const allInteractions = await InteractionLog.find().lean();
    console.log('All interactions in database:', allInteractions.length);
    if (allInteractions.length > 0) {
      console.log('Sample interaction:', allInteractions[0]);
      // Log date ranges of all interactions
      const dateRanges = allInteractions.map(interaction => ({
        id: interaction.interaction_id,
        date: interaction.date,
        client_id: interaction.client_id
      }));
      console.log('All interaction dates:', dateRanges);
    }

    // Get total number of interaction logs (filtered if date range provided)
    const totalInteractions = await InteractionLog.countDocuments(interactionQuery);
    console.log('Total interactions with filters:', totalInteractions);

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
      console.log('Recent interactions query:', JSON.stringify(recentQuery, null, 2));
      recentInteractions = await InteractionLog.countDocuments(recentQuery);
    }
    console.log('Recent interactions:', recentInteractions);

    // Get number of clients with at least one interaction (filtered if date range provided)
    const clientsWithInteractions = await InteractionLog.distinct('client_id', interactionQuery);
    console.log('Clients with interactions:', clientsWithInteractions);
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
    console.log('Final response:', response);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getSummary:', error);
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
        
        // Debug: Check all interactions
        const allInteractions = await InteractionLog.find().lean();
        console.log('All interactions in database:', allInteractions);
        
        // Get clients with recent interactions
        const recentInteractions = await InteractionLog.find({
            date: { $gte: cutoffDate }
        }).distinct('client_id');
        console.log('Clients with recent interactions:', recentInteractions);

        // Filter out clients with recent interactions
        const inactiveClients = allClients.filter(client => 
            !recentInteractions.includes(client._id.toString())
        );
        console.log('Inactive clients found:', inactiveClients.length);

        // Add days since last interaction for each client
        const clientsWithDetails = await Promise.all(inactiveClients.map(async (client) => {
            try {
                console.log('Checking client:', client.client_id);
                
                // Debug: Check all interactions for this client
                const clientInteractions = await InteractionLog.find({ 
                    client_id: client._id.toString()
                }).lean();
                console.log('All interactions for client', client.client_id, ':', clientInteractions);
                
                // Find the most recent interaction for this client
                const lastInteraction = await InteractionLog.findOne({ 
                    client_id: client._id.toString()
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