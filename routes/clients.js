const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Create a new client
router.post('/', auth, clientController.createClient);

// Get all clients (admin only)
router.get('/', auth, checkRole('admin'), clientController.getAllClients);

// Get client by ID
router.get('/:clientId', auth, clientController.getClientById);

// Update client
router.put('/:clientId', auth, clientController.updateClient);

// Delete client (admin only)
router.delete('/:clientId', auth, checkRole('admin'), clientController.deleteClient);

// Add purchase to client history
router.post('/:clientId/purchases', auth, clientController.addPurchase);

// Get client purchase history
router.get('/:clientId/purchases', auth, clientController.getPurchaseHistory);

// Update client preferences
router.put('/:clientId/preferences', auth, clientController.updatePreferences);

module.exports = router; 