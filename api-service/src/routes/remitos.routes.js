const express = require('express');
const router = express.Router();
const remitosController = require('../controllers/remitos.controller');
const { validateCreateRemito, validateUpdateRemito } = require('../middlewares/validators');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Rutas para Remitos (Admin only)
router.get('/', protect, adminOnly, remitosController.getAllRemitos);
router.get('/:id', protect, adminOnly, remitosController.getRemitoById);
router.post('/', protect, adminOnly, validateCreateRemito, remitosController.createRemito);
router.put('/:id', protect, adminOnly, validateUpdateRemito, remitosController.updateRemito);
router.delete('/:id', protect, adminOnly, remitosController.deleteRemito);
router.get('/:id/pdf', protect, adminOnly, remitosController.getRemitoPdf);

module.exports = router;
