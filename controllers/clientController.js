const Client = require('../models/Client');
const { v4: uuidv4 } = require('uuid');
const InteractionLog = require('../models/InteractionLog');

// Create a new client
exports.createClient = async (req, res) => {
    try {
        const { name, email, phone, preferences, preferredContactMethod, followUpPhase } = req.body;
        
        const client = new Client({
            client_id: uuidv4(),
            name,
            email,
            phone,
            preferences: preferences || [],
            preferredContactMethod: preferredContactMethod || 'email',
            followUpPhase: followUpPhase || 'initial',
            daysWithoutInteraction: 0
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
        const clients = await Client.find();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get client by ID
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findOne({ client_id: req.params.client_id });
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
        const { name, email, phone, preferences, preferredContactMethod, followUpPhase } = req.body;
        const client = await Client.findOne({ client_id: req.params.client_id });
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (name) client.name = name;
        if (email) client.email = email;
        if (phone) client.phone = phone;
        if (preferences) client.preferences = preferences;
        if (preferredContactMethod) client.preferredContactMethod = preferredContactMethod;
        if (followUpPhase) client.followUpPhase = followUpPhase;

        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete client
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findOne({ client_id: req.params.client_id });
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
        const client = await Client.findOne({ client_id: req.params.client_id });
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        client.purchase_history.push({
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
        const client = await Client.findOne({ client_id: req.params.client_id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(client.purchase_history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update client preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const client = await Client.findOne({ client_id: req.params.client_id });
    
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

// Add a new function to update days without interaction
exports.updateDaysWithoutInteraction = async (req, res) => {
    try {
        const client = await Client.findOne({ client_id: req.params.client_id });
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Get the last interaction date from the interaction logs
        const lastInteraction = await InteractionLog.findOne({ client_id: client.client_id })
            .sort({ date: -1 });

        if (lastInteraction) {
            const daysDiff = Math.floor((new Date() - new Date(lastInteraction.date)) / (1000 * 60 * 60 * 24));
            client.daysWithoutInteraction = daysDiff;
        } else {
            client.daysWithoutInteraction = 0;
        }

        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 