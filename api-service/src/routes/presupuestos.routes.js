const express = require('express');
const router = express.Router();
const presupuestosController = require('../controllers/presupuestos.controller');
const { validateCreatePresupuesto, validateUpdatePresupuesto } = require('../middlewares/validators');
const { protect, adminOnly, checkOwnership } = require('../middlewares/auth.middleware');

// Rutas para Presupuestos
// Ruta para que un usuario autenticado cree un presupuesto
router.post('/', protect, validateCreatePresupuesto, presupuestosController.createPresupuesto);

// Rutas para un presupuesto específico (requieren ser propietario o admin)
router.get('/:id', protect, checkOwnership('presupuestos'), presupuestosController.getPresupuestoById);
router.get('/:id/pdf', protect, checkOwnership('presupuestos'), presupuestosController.getPresupuestoPdf);

// Rutas de administrador
router.get('/', protect, adminOnly, presupuestosController.getAllPresupuestos);
router.put('/:id', protect, adminOnly, validateUpdatePresupuesto, presupuestosController.updatePresupuesto);
router.delete('/:id', protect, adminOnly, presupuestosController.deletePresupuesto);
router.post('/:id/convertir', protect, adminOnly, presupuestosController.convertirPresupuesto);

module.exports = router;
