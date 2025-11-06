const express = require('express');
const router = express.Router();
const mueblesController = require('../controllers/muebles.controller');
const { validateCreateMueble, validateUpdateMueble, validateUpdateStock } = require('../middlewares/validators');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Rutas para Muebles
// Rutas públicas para la tienda
router.get('/', mueblesController.getAllMuebles);
router.get('/:id', mueblesController.getMuebleById);

// Rutas de administrador
router.post('/', protect, adminOnly, validateCreateMueble, mueblesController.createMueble);
router.put('/:id', protect, adminOnly, validateUpdateMueble, mueblesController.updateMueble);
router.delete('/:id', protect, adminOnly, mueblesController.deleteMueble);
router.patch('/:id/stock', protect, adminOnly, validateUpdateStock, mueblesController.updateStock);

module.exports = router;
