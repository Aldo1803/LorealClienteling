const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { auth } = require('../middleware/auth');
const { combinedUpload } = require('../utils/upload');

// Create new interaction
router.post('/', auth, combinedUpload, interactionController.createInteraction);

// Get all interactions
router.get('/', auth, interactionController.getAllInteractions);

// Get interaction by ID
router.get('/:id', auth, interactionController.getInteractionById);

// Update interaction
router.put('/:id', auth, combinedUpload, interactionController.updateInteraction);

// Delete interaction
router.delete('/:id', auth, interactionController.deleteInteraction);

module.exports = router; 