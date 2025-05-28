const express = require('express');
const router = express.Router();
const satisfactionSurveyController = require('../controllers/satisfactionSurveyController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Create new satisfaction survey
router.post('/', auth, satisfactionSurveyController.createSurvey);

// Get all satisfaction surveys (admin only)
router.get('/', auth, roles('admin'), satisfactionSurveyController.getAllSurveys);

// Get satisfaction surveys for a specific client
router.get('/client/:clientId', auth, satisfactionSurveyController.getClientSurveys);

// Get satisfaction survey by ID
router.get('/:id', auth, satisfactionSurveyController.getSurveyById);

// Update satisfaction survey
router.put('/:id', auth, satisfactionSurveyController.updateSurvey);

// Delete satisfaction survey (admin only)
router.delete('/:id', auth, roles('admin'), satisfactionSurveyController.deleteSurvey);

// Get satisfaction survey statistics (admin only)
router.get('/stats/summary', auth, roles('admin'), satisfactionSurveyController.getSurveyStats);

module.exports = router; 