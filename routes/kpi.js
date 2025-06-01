const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');
const { isAdmin } = require('../middleware/auth');

// Get clients without recent interactions
router.get('/inactive-clients', isAdmin, kpiController.getClientsWithoutRecentInteractions);

// ... existing code ... 