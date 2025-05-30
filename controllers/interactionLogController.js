const InteractionLog = require('../models/InteractionLog');
const { v4: uuidv4 } = require('uuid');

// Create a new interaction log
const createInteractionLog = async (req, res) => {
    try {
        const { client_id, beauty_advisor_id, action, viewed_product, comments } = req.body;

        const interactionLog = new InteractionLog({
            interaction_id: uuidv4(),
            client_id,
            beauty_advisor_id,
            action,
            viewed_product,
            comments
        });

        await interactionLog.save();
        res.status(201).json(interactionLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all interaction logs (admin only)
const getAllInteractionLogs = async (req, res) => {
    try {
        const interactionLogs = await InteractionLog.find()
            .populate('client_id', 'name email')
            .populate('beauty_advisor_id', 'name email');
        res.json(interactionLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get interaction logs by client ID
const getInteractionLogsByClient = async (req, res) => {
    try {
        const interactionLogs = await InteractionLog.find({ client_id: req.params.client_id })
            .populate('beauty_advisor_id', 'name email');
        res.json(interactionLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get interaction logs by beauty advisor ID
const getInteractionLogsByBeautyAdvisor = async (req, res) => {
    try {
        const interactionLogs = await InteractionLog.find({ beauty_advisor_id: req.params.beauty_advisor_id })
            .populate('client_id', 'name email');
        res.json(interactionLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific interaction log by ID
const getInteractionLogById = async (req, res) => {
    try {
        const interactionLog = await InteractionLog.findById(req.params.id)
            .populate('client_id', 'name email')
            .populate('beauty_advisor_id', 'name email');
        
        if (!interactionLog) {
            return res.status(404).json({ message: 'Interaction log not found' });
        }
        
        res.json(interactionLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an interaction log
const updateInteractionLog = async (req, res) => {
    try {
        const { action, viewed_product, comments } = req.body;
        const interactionLog = await InteractionLog.findById(req.params.id);
        
        if (!interactionLog) {
            return res.status(404).json({ message: 'Interaction log not found' });
        }

        if (action) interactionLog.action = action;
        if (viewed_product) interactionLog.viewed_product = viewed_product;
        if (comments) interactionLog.comments = comments;

        await interactionLog.save();
        res.json(interactionLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an interaction log (admin only)
const deleteInteractionLog = async (req, res) => {
    try {
        const interactionLog = await InteractionLog.findById(req.params.id);
        
        if (!interactionLog) {
            return res.status(404).json({ message: 'Interaction log not found' });
        }

        await interactionLog.deleteOne();
        res.json({ message: 'Interaction log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInteractionLog,
    getAllInteractionLogs,
    getInteractionLogsByClient,
    getInteractionLogsByBeautyAdvisor,
    getInteractionLogById,
    updateInteractionLog,
    deleteInteractionLog
}; 