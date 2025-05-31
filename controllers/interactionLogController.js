const InteractionLog = require('../models/InteractionLog');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Create a new interaction log with file uploads
const createInteractionLog = async (req, res) => {
    try {
        const { 
            client_id, 
            beauty_advisor_id, 
            action, 
            viewed_product, 
            comments,
            metadata 
        } = req.body;

        // Validate required fields
        const requiredFields = ['client_id', 'beauty_advisor_id', 'action', 'viewed_product'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                fields: missingFields
            });
        }

        // Handle product photo upload
        let product_photo = null;
        if (req.files && req.files.product_photo) {
            const photoFile = req.files.product_photo[0];
            product_photo = photoFile.path;
        }

        // Handle additional files
        const additional_files = [];
        if (req.files && req.files.additional_files) {
            req.files.additional_files.forEach(file => {
                additional_files.push({
                    filename: file.originalname,
                    path: file.path,
                    mimetype: file.mimetype,
                    size: file.size
                });
            });
        }

        const interactionLog = new InteractionLog({
            interaction_id: uuidv4(),
            client_id,
            beauty_advisor_id,
            action,
            viewed_product,
            comments,
            product_photo,
            additional_files,
            metadata: metadata || {}
        });

        await interactionLog.save();
        res.status(201).json(interactionLog);
    } catch (error) {
        // If there's an error, delete any uploaded files
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Get all interaction logs (admin only)
const getAllInteractionLogs = async (req, res) => {
    try {
        const interactionLogs = await InteractionLog.find()
            .populate('client_id', 'name email')
            .populate('beauty_advisor_id', 'name email')
            .sort({ date: -1 });
        res.json(interactionLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get interaction logs by client ID
const getInteractionLogsByClient = async (req, res) => {
    try {
        const interactionLogs = await InteractionLog.find({ client_id: req.params.client_id })
            .populate('beauty_advisor_id', 'name email')
            .sort({ date: -1 });
        res.json(interactionLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get interaction logs by beauty advisor ID
const getInteractionLogsByBeautyAdvisor = async (req, res) => {
    try {
        const interactionLogs = await InteractionLog.find({ beauty_advisor_id: req.params.beauty_advisor_id })
            .populate('client_id', 'name email')
            .sort({ date: -1 });
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
        const { 
            action, 
            viewed_product, 
            comments,
            metadata 
        } = req.body;

        const interactionLog = await InteractionLog.findById(req.params.id);
        
        if (!interactionLog) {
            return res.status(404).json({ message: 'Interaction log not found' });
        }

        // Handle product photo upload
        if (req.files && req.files.product_photo) {
            const photoFile = req.files.product_photo[0];
            
            // Delete old product photo if it exists
            if (interactionLog.product_photo && fs.existsSync(interactionLog.product_photo)) {
                fs.unlinkSync(interactionLog.product_photo);
            }
            
            interactionLog.product_photo = photoFile.path;
        }

        // Handle additional files
        if (req.files && req.files.additional_files) {
            // Delete old additional files
            interactionLog.additional_files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });

            // Add new files
            interactionLog.additional_files = req.files.additional_files.map(file => ({
                filename: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        // Update other fields
        if (action) interactionLog.action = action;
        if (viewed_product) interactionLog.viewed_product = viewed_product;
        if (comments) interactionLog.comments = comments;
        if (metadata) interactionLog.metadata = { ...interactionLog.metadata, ...metadata };

        await interactionLog.save();
        res.json(interactionLog);
    } catch (error) {
        // If there's an error, delete any uploaded files
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
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

        // Delete product photo if it exists
        if (interactionLog.product_photo && fs.existsSync(interactionLog.product_photo)) {
            fs.unlinkSync(interactionLog.product_photo);
        }

        // Delete additional files
        interactionLog.additional_files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

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