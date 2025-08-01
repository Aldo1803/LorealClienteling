const express = require('express');
const router = express.Router();

// Import route modules
const clientRoutes = require('./clients');
const interactionLogRoutes = require('./interactionLogs');
const kpiRoutes = require('./kpis');
const authRoutes = require('./auth');
const healthRoutes = require('./health');
const satisfactionSurveyRoutes = require('./satisfactionSurveys');

// Mount routes
router.use('/clients', clientRoutes);
router.use('/interaction-logs', interactionLogRoutes);
router.use('/kpis', kpiRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/satisfaction-surveys', satisfactionSurveyRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = router; 