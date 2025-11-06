const pedidosService = require('../services/pedidos.service');

const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await pedidosService.getAllPedidos();
    res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPedidosForAuthenticatedUser = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from authenticated session
    const pedidos = await pedidosService.getPedidosByUserId(userId);
    res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidosService.getPedidoById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido not found' });
    }
    res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPedido = async (req, res) => {
  try {
    const newPedido = await pedidosService.createPedido(req.body);
    res.status(201).json({ success: true, data: newPedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPedido = await pedidosService.updatePedido(id, req.body);
    if (!updatedPedido) {
      return res.status(404).json({ success: false, error: 'Pedido not found' });
    }
    res.status(200).json({ success: true, data: updatedPedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPedido = await pedidosService.deletePedido(id);
    if (!deletedPedido || deletedPedido.length === 0) {
      return res.status(404).json({ success: false, error: 'Pedido not found' });
    }
    res.status(200).json({ success: true, message: 'Pedido deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const pagarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentUrl = await pedidosService.pagarPedido(id);
    res.status(200).json({ success: true, data: { payment_url: paymentUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPedidoPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await pedidosService.getPedidoPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pedido-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllPedidos,
  getPedidosForAuthenticatedUser,
  getPedidoById,
  createPedido,
  updatePedido,
  deletePedido,
  pagarPedido,
  getPedidoPdf,
};
