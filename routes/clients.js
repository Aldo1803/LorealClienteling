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
router.get('/:client_id', auth, clientController.getClientById);

// Update client
router.put('/:client_id', auth, clientController.updateClient);

// Delete client (admin only)
router.delete('/:client_id', auth, checkRole('admin'), clientController.deleteClient);

// Add purchase to client history
router.post('/:client_id/purchases', auth, clientController.addPurchase);

// Get client purchase history
router.get('/:client_id/purchases', auth, clientController.getPurchaseHistory);

// Update client preferences
router.put('/:client_id/preferences', auth, clientController.updatePreferences);

// Update days without interaction
router.put('/:client_id/days-without-interaction', auth, clientController.updateDaysWithoutInteraction);

module.exports = router; 