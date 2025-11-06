const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertas.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Rutas para Alertas (Admin only)
router.get('/', protect, adminOnly, alertasController.getAllAlertas);
router.post('/check', protect, adminOnly, alertasController.checkAlertas);

module.exports = router;
