const InteractionLog = require('../models/InteractionLog');
const path = require('path');
const fs = require('fs');

// Create a new interaction log with file uploads
exports.createInteraction = async (req, res) => {
  try {
    const { 
      clientId, 
      notes, 
      sku, 
      product, 
      brand, 
      recommendationDate,
      additionalNotes 
    } = req.body;
    
    // Validate required fields
    const requiredFields = ['clientId', 'notes', 'sku', 'product', 'brand'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    // Handle product photo upload
    let productPhoto = null;
    if (req.files && req.files.productPhoto) {
      const photoFile = req.files.productPhoto[0];
      productPhoto = photoFile.path;
    }

    // Get file paths from other uploaded files
    const files = req.files && req.files.files ? 
      req.files.files.map(file => file.path) : [];

    const interaction = new InteractionLog({
      clientId,
      notes,
      sku,
      product,
      brand,
      productPhoto,
      recommendationDate: recommendationDate || new Date(),
      additionalNotes,
      files
    });

    await interaction.save();
    res.status(201).json(interaction);
  } catch (error) {
    // If there's an error, delete any uploaded files
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
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

// Update an interaction
exports.updateInteraction = async (req, res) => {
  try {
    const { 
      notes, 
      sku, 
      product, 
      brand, 
      recommendationDate,
      additionalNotes 
    } = req.body;

    // Validate required fields if they are being updated
    const requiredFields = ['sku', 'product', 'brand'];
    const missingFields = requiredFields.filter(field => 
      req.body[field] === undefined || req.body[field] === null
    );
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    // Handle product photo upload
    let productPhoto = undefined;
    if (req.files && req.files.productPhoto) {
      const photoFile = req.files.productPhoto[0];
      productPhoto = photoFile.path;

      // Delete old product photo if it exists
      const oldInteraction = await InteractionLog.findById(req.params.id);
      if (oldInteraction && oldInteraction.productPhoto) {
        if (fs.existsSync(oldInteraction.productPhoto)) {
          fs.unlinkSync(oldInteraction.productPhoto);
        }
      }
    }

    const updateData = {
      notes,
      sku,
      product,
      brand,
      recommendationDate,
      additionalNotes
    };

    if (productPhoto) {
      updateData.productPhoto = productPhoto;
    }

    const interaction = await InteractionLog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }

    res.status(200).json(interaction);
  } catch (error) {
    // If there's an error, delete any uploaded files
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(400).json({ 
      message: 'Error updating interaction',
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

    // Delete product photo if it exists
    if (interaction.productPhoto && fs.existsSync(interaction.productPhoto)) {
      fs.unlinkSync(interaction.productPhoto);
    }

    // Delete associated files
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