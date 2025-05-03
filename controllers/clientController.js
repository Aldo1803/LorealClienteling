const Client = require('../models/Client');
const InteractionLog = require('../models/InteractionLog');
const fs = require('fs');
const path = require('path');

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating client',
      error: error.message 
    });
  }
};

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching clients',
      error: error.message 
    });
  }
};

// Get a single client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching client',
      error: error.message 
    });
  }
};

// Update a client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating client',
      error: error.message 
    });
  }
};

// Delete a client and all related data
exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Find all interactions for this client
    const interactions = await InteractionLog.find({ clientId });
    
    // Delete all associated files
    for (const interaction of interactions) {
      for (const filePath of interaction.files) {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }
    
    // Delete all interactions for this client
    await InteractionLog.deleteMany({ clientId });
    
    // Delete the client
    const client = await Client.findByIdAndDelete(clientId);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.status(200).json({ 
      message: 'Client and all related data deleted successfully',
      deleted: {
        clientId: client._id,
        interactionsCount: interactions.length,
        filesCount: interactions.reduce((count, interaction) => count + interaction.files.length, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting client and related data',
      error: error.message 
    });
  }
};

// Anonymize client data
exports.anonymizeClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Anonymize PII fields while preserving data structure
    client.name = 'Anonymous Client';
    client.preferences = [];
    client.birthday = new Date('1900-01-01'); // Set to a default date
    client.consentGiven = false;
    client.consentDate = null;

    await client.save();

    res.status(200).json({
      message: 'Client data anonymized successfully',
      client: {
        id: client._id,
        name: client.name,
        preferences: client.preferences,
        birthday: client.birthday,
        consentGiven: client.consentGiven,
        consentDate: client.consentDate
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error anonymizing client data',
      error: error.message 
    });
  }
}; 