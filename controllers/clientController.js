const Client = require('../models/Client');
const InteractionLog = require('../models/InteractionLog');
const fs = require('fs');
const path = require('path');

// Create a new client
exports.createClient = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['firstName', 'phoneNumber', 'language', 'termsAccepted'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    // Validate terms acceptance
    if (req.body.termsAccepted !== true) {
      return res.status(400).json({
        message: 'Terms and conditions must be accepted'
      });
    }

    // Validate skin concerns if provided
    if (req.body.skinConcerns) {
      const validConcerns = [
        'Piel sensible',
        'Envejecimiento',
        'Imperfecciones',
        'Brillo en la piel',
        'Maquillaje',
        'Proteger piel vs factores externos',
        'Piel seca rostro',
        'Piel seca cuerpo'
      ];
      const invalidConcerns = req.body.skinConcerns.filter(concern => !validConcerns.includes(concern));
      if (invalidConcerns.length > 0) {
        return res.status(400).json({
          message: 'Invalid skin concerns provided',
          invalidConcerns
        });
      }
    }

    // Validate current brands if provided
    if (req.body.currentBrands) {
      const validBrands = [
        'LA ROCHE POSAY',
        'AVENE',
        'BIODERMA',
        'VICHY',
        'EUCERIN',
        'CETAPHIL',
        'CERAVE',
        'ISDIN',
        'OTRO'
      ];
      const invalidBrands = req.body.currentBrands.filter(brand => !validBrands.includes(brand));
      if (invalidBrands.length > 0) {
        return res.status(400).json({
          message: 'Invalid brands provided',
          invalidBrands
        });
      }
    }

    // Validate interests if provided
    if (req.body.interests) {
      const validInterests = [
        'Lanzamientos',
        'Packs promocionales',
        'Promociones/descuentos',
        'Muestras gratis',
        'Otros'
      ];
      const invalidInterests = req.body.interests.filter(interest => !validInterests.includes(interest));
      if (invalidInterests.length > 0) {
        return res.status(400).json({
          message: 'Invalid interests provided',
          invalidInterests
        });
      }
    }

    // Validate event types if provided
    if (req.body.eventTypes) {
      const validEventTypes = [
        'Exp. con expertos',
        'Eventos de cuidado de la piel',
        'Maquillaje',
        'Faciales'
      ];
      const invalidEventTypes = req.body.eventTypes.filter(eventType => !validEventTypes.includes(eventType));
      if (invalidEventTypes.length > 0) {
        return res.status(400).json({
          message: 'Invalid event types provided',
          invalidEventTypes
        });
      }
    }

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
    // Validate required fields if they are being updated
    const requiredFields = ['firstName', 'phoneNumber', 'language', 'termsAccepted'];
    const missingFields = requiredFields.filter(field => 
      req.body[field] === undefined || req.body[field] === null
    );
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    // Validate terms acceptance if being updated
    if (req.body.termsAccepted !== undefined && req.body.termsAccepted !== true) {
      return res.status(400).json({
        message: 'Terms and conditions must be accepted'
      });
    }

    // Validate skin concerns if being updated
    if (req.body.skinConcerns) {
      const validConcerns = [
        'Piel sensible',
        'Envejecimiento',
        'Imperfecciones',
        'Brillo en la piel',
        'Maquillaje',
        'Proteger piel vs factores externos',
        'Piel seca rostro',
        'Piel seca cuerpo'
      ];
      const invalidConcerns = req.body.skinConcerns.filter(concern => !validConcerns.includes(concern));
      if (invalidConcerns.length > 0) {
        return res.status(400).json({
          message: 'Invalid skin concerns provided',
          invalidConcerns
        });
      }
    }

    // Validate current brands if being updated
    if (req.body.currentBrands) {
      const validBrands = [
        'LA ROCHE POSAY',
        'AVENE',
        'BIODERMA',
        'VICHY',
        'EUCERIN',
        'CETAPHIL',
        'CERAVE',
        'ISDIN',
        'OTRO'
      ];
      const invalidBrands = req.body.currentBrands.filter(brand => !validBrands.includes(brand));
      if (invalidBrands.length > 0) {
        return res.status(400).json({
          message: 'Invalid brands provided',
          invalidBrands
        });
      }
    }

    // Validate interests if being updated
    if (req.body.interests) {
      const validInterests = [
        'Lanzamientos',
        'Packs promocionales',
        'Promociones/descuentos',
        'Muestras gratis',
        'Otros'
      ];
      const invalidInterests = req.body.interests.filter(interest => !validInterests.includes(interest));
      if (invalidInterests.length > 0) {
        return res.status(400).json({
          message: 'Invalid interests provided',
          invalidInterests
        });
      }
    }

    // Validate event types if being updated
    if (req.body.eventTypes) {
      const validEventTypes = [
        'Exp. con expertos',
        'Eventos de cuidado de la piel',
        'Maquillaje',
        'Faciales'
      ];
      const invalidEventTypes = req.body.eventTypes.filter(eventType => !validEventTypes.includes(eventType));
      if (invalidEventTypes.length > 0) {
        return res.status(400).json({
          message: 'Invalid event types provided',
          invalidEventTypes
        });
      }
    }

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

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting client',
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