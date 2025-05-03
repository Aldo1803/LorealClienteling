const InteractionLog = require('../models/InteractionLog');
const path = require('path');

// Create a new interaction log with file uploads
exports.createInteraction = async (req, res) => {
  try {
    const { clientId, notes } = req.body;
    
    // Get file paths from uploaded files
    const files = req.files ? req.files.map(file => file.path) : [];

    const interaction = new InteractionLog({
      clientId,
      notes,
      files
    });

    await interaction.save();
    res.status(201).json(interaction);
  } catch (error) {
    // If there's an error, delete any uploaded files
    if (req.files) {
      req.files.forEach(file => {
        const fs = require('fs');
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(400).json({ 
      message: 'Error creating interaction log',
      error: error.message 
    });
  }
};

// Get all interactions for a client
exports.getClientInteractions = async (req, res) => {
  try {
    const interactions = await InteractionLog.find({ clientId: req.params.clientId })
      .sort({ createdAt: -1 });
    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching interactions',
      error: error.message 
    });
  }
};

// Get a single interaction
exports.getInteraction = async (req, res) => {
  try {
    const interaction = await InteractionLog.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    res.status(200).json(interaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching interaction',
      error: error.message 
    });
  }
};

// Delete an interaction and its associated files
exports.deleteInteraction = async (req, res) => {
  try {
    const interaction = await InteractionLog.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }

    // Delete associated files
    const fs = require('fs');
    interaction.files.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await interaction.remove();
    res.status(200).json({ message: 'Interaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting interaction',
      error: error.message 
    });
  }
}; 