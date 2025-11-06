const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { validateCreatePedido, validateUpdatePedido } = require('../middlewares/validators');
const { protect, adminOnly, checkOwnership } = require('../middlewares/auth.middleware');

// Rutas para Pedidos
// Ruta para que un usuario autenticado cree un pedido
router.post('/', protect, validateCreatePedido, pedidosController.createPedido);

// Ruta para que un usuario autenticado obtenga sus propios pedidos
router.get('/me', protect, pedidosController.getPedidosForAuthenticatedUser);

// Rutas para un pedido específico (requieren ser propietario o admin)
router.get('/:id', protect, checkOwnership('pedidos'), pedidosController.getPedidoById);
router.post('/:id/pagar', protect, checkOwnership('pedidos'), pedidosController.pagarPedido);
router.get('/:id/pdf', protect, checkOwnership('pedidos'), pedidosController.getPedidoPdf);

// Rutas de administrador
router.get('/', protect, adminOnly, pedidosController.getAllPedidos);
router.put('/:id', protect, adminOnly, validateUpdatePedido, pedidosController.updatePedido);
router.delete('/:id', protect, adminOnly, pedidosController.deletePedido);


module.exports = router;
