// src/routes/statistics.routes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Ruta protegida solo para administradores
router.get('/dashboard', protect, adminOnly, statisticsController.getDashboardStatistics);

module.exports = router;
