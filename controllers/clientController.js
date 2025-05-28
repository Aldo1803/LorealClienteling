const Client = require('../models/Client');
const InteractionLog = require('../models/InteractionLog');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, preferences } = req.body;
    
    const client = new Client({
      clientId: uuidv4(),
      name,
      email,
      phone,
      preferences: preferences || []
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ clientId: req.params.clientId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, preferences } = req.body;
    const client = await Client.findOne({ clientId: req.params.clientId });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (name) client.name = name;
    if (email) client.email = email;
    if (phone) client.phone = phone;
    if (preferences) client.preferences = preferences;

    await client.save();
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({ clientId: req.params.clientId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    await client.remove();
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add purchase to client history
exports.addPurchase = async (req, res) => {
  try {
    const { product } = req.body;
    const client = await Client.findOne({ clientId: req.params.clientId });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.purchaseHistory.push({
      product,
      date: new Date()
    });

    await client.save();
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get client purchase history
exports.getPurchaseHistory = async (req, res) => {
  try {
    const client = await Client.findOne({ clientId: req.params.clientId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client.purchaseHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update client preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const client = await Client.findOne({ clientId: req.params.clientId });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.preferences = preferences;
    await client.save();
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    client.firstName = 'Anonymous';
    client.lastName = 'Client';
    client.gender = 'N/A';
    client.phoneNumber = '0000000000';
    client.email = null;
    client.preferences = [];
    client.birthday = new Date('1900-01-01');
    client.consentGiven = false;
    client.consentDate = null;
    client.termsAccepted = false;
    client.skinType = null;
    client.skinConcerns = [];
    client.currentBrands = [];
    client.interests = [];
    client.eventTypes = [];

    await client.save();

    res.status(200).json({
      message: 'Client data anonymized successfully',
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        gender: client.gender,
        phoneNumber: client.phoneNumber,
        email: client.email,
        preferences: client.preferences,
        birthday: client.birthday,
        consentGiven: client.consentGiven,
        consentDate: client.consentDate,
        termsAccepted: client.termsAccepted,
        skinType: client.skinType,
        skinConcerns: client.skinConcerns,
        currentBrands: client.currentBrands,
        interests: client.interests,
        eventTypes: client.eventTypes
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error anonymizing client data',
      error: error.message 
    });
  }
}; 