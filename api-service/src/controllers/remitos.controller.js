const remitosService = require('../services/remitos.service');

const getAllRemitos = async (req, res) => {
  try {
    const remitos = await remitosService.getAllRemitos();
    res.status(200).json({ success: true, data: remitos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRemitoById = async (req, res) => {
  try {
    const { id } = req.params;
    const remito = await remitosService.getRemitoById(id);
    if (!remito) {
      return res.status(404).json({ success: false, error: 'Remito not found' });
    }
    res.status(200).json({ success: true, data: remito });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createRemito = async (req, res) => {
  try {
    // Note: Remitos are typically created automatically when a pedido is delivered.
    // This endpoint can be used for manual creation if necessary.
    const { pedido_id } = req.body;
    if (!pedido_id) {
      return res.status(400).json({ success: false, error: 'pedido_id is required' });
    }
    const newRemito = await remitosService.createRemito(pedido_id);
    res.status(201).json({ success: true, data: newRemito });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRemito = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRemito = await remitosService.updateRemito(id, req.body);
    if (!updatedRemito || updatedRemito.length === 0) {
      return res.status(404).json({ success: false, error: 'Remito not found' });
    }
    res.status(200).json({ success: true, data: updatedRemito });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteRemito = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRemito = await remitosService.deleteRemito(id);
    if (!deletedRemito || deletedRemito.length === 0) {
      return res.status(404).json({ success: false, error: 'Remito not found' });
    }
    res.status(200).json({ success: true, message: 'Remito deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRemitoPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await remitosService.getRemitoPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=remito-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllRemitos,
  getRemitoById,
  createRemito,
  updateRemito,
  deleteRemito,
  getRemitoPdf,
};
