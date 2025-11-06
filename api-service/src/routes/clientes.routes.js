const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { validateCreateCliente, validateUpdateCliente } = require('../middlewares/validators');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Rutas para Clientes (Admin only)
router.get('/', protect, adminOnly, clientesController.getAllClientes);
router.get('/export', protect, adminOnly, clientesController.exportClientes);
router.get('/:id', protect, adminOnly, clientesController.getClienteById);
router.post('/', protect, adminOnly, validateCreateCliente, clientesController.createCliente);
router.put('/:id', protect, adminOnly, validateUpdateCliente, clientesController.updateCliente);
router.delete('/:id', protect, adminOnly, clientesController.deleteCliente);

module.exports = router;
