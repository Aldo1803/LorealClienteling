const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const upload = require('../utils/upload');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Create a new interaction with file uploads (protected, both admin and advisor)
router.post('/', 
  auth,
  upload.array('files', 5),
  interactionController.createInteraction
);

// Get all interactions for a client (protected, both admin and advisor)
router.get('/client/:clientId', auth, interactionController.getClientInteractions);

// Get a single interaction (protected, both admin and advisor)
router.get('/:id', auth, interactionController.getInteraction);

// Delete an interaction (protected, admin only)
router.delete('/:id', auth, roles('admin'), interactionController.deleteInteraction);

module.exports = router; 