const express = require('express');
const router = express.Router();

// Import route modules
const clientRoutes = require('./clients');
const interactionRoutes = require('./interactions');
const kpiRoutes = require('./kpis');
const authRoutes = require('./auth');
const healthRoutes = require('./health');

// Mount routes
router.use('/clients', clientRoutes);
router.use('/interactions', interactionRoutes);
router.use('/kpis', kpiRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = router; 