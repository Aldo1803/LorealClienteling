const express = require('express');
const router = express.Router();
const interactionLogController = require('../controllers/interactionLogController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Create a new interaction log
router.post('/', auth, interactionLogController.createInteractionLog);

// Get all interaction logs (admin only)
router.get('/', auth, checkRole('admin'), interactionLogController.getAllInteractionLogs);

// Get interaction logs by client ID
router.get('/client/:client_id', auth, interactionLogController.getInteractionLogsByClient);

// Get interaction logs by beauty advisor ID
router.get('/advisor/:beauty_advisor_id', auth, interactionLogController.getInteractionLogsByBeautyAdvisor);

// Get a specific interaction log by ID
router.get('/:id', auth, interactionLogController.getInteractionLogById);

// Update an interaction log
router.put('/:id', auth, interactionLogController.updateInteractionLog);

// Delete an interaction log (admin only)
router.delete('/:id', auth, checkRole('admin'), interactionLogController.deleteInteractionLog);

module.exports = router; 