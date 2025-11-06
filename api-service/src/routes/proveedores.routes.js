const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedores.controller');
const { validateCreateProveedor, validateUpdateProveedor } = require('../middlewares/validators');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Rutas para Proveedores (Admin only)
router.get('/', protect, adminOnly, proveedoresController.getAllProveedores);
router.post('/', protect, adminOnly, validateCreateProveedor, proveedoresController.createProveedor);
router.put('/:id', protect, adminOnly, validateUpdateProveedor, proveedoresController.updateProveedor);
router.delete('/:id', protect, adminOnly, proveedoresController.deleteProveedor);

module.exports = router;
