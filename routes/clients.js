const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Create a new client
router.post('/', auth, clientController.createClient);

// Get all clients
router.get('/', auth, clientController.getAllClients);

// Get a single client
router.get('/:id', auth, clientController.getClientById);

// Update a client
router.put('/:id', auth, clientController.updateClient);

// Delete a client
router.delete('/:id', auth, roles('admin'), clientController.deleteClient);

// Anonymize client data
router.put('/:id/anonymize', auth, roles('admin'), clientController.anonymizeClient);

module.exports = router; 