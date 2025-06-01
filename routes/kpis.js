const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Get KPI summary (admin only)
router.get('/summary', auth, roles('admin'), kpiController.getSummary);

// Get clients without recent interactions (admin only)
router.get('/inactive-clients', auth, roles('admin'), kpiController.getClientsWithoutRecentInteractions);

module.exports = router; 