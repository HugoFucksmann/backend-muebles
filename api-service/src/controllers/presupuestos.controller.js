const presupuestosService = require('../services/presupuestos.service');

const getAllPresupuestos = async (req, res) => {
  try {
    const presupuestos = await presupuestosService.getAllPresupuestos();
    res.status(200).json({ success: true, data: presupuestos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPresupuestoById = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = await presupuestosService.getPresupuestoById(id);
    if (!presupuesto) {
      return res.status(404).json({ success: false, error: 'Presupuesto not found' });
    }
    res.status(200).json({ success: true, data: presupuesto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPresupuesto = async (req, res) => {
  try {
    const newPresupuesto = await presupuestosService.createPresupuesto(req.body);
    res.status(201).json({ success: true, data: newPresupuesto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPresupuesto = await presupuestosService.updatePresupuesto(id, req.body);
    if (!updatedPresupuesto || updatedPresupuesto.length === 0) {
      return res.status(404).json({ success: false, error: 'Presupuesto not found' });
    }
    res.status(200).json({ success: true, data: updatedPresupuesto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deletePresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPresupuesto = await presupuestosService.deletePresupuesto(id);
    if (!deletedPresupuesto || deletedPresupuesto.length === 0) {
      return res.status(404).json({ success: false, error: 'Presupuesto not found' });
    }
    res.status(200).json({ success: true, message: 'Presupuesto deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const convertirPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await presupuestosService.convertirPresupuesto(id);
    res.status(201).json({ success: true, data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPresupuestoPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await presupuestosService.getPresupuestoPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllPresupuestos,
  getPresupuestoById,
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  convertirPresupuesto,
  getPresupuestoPdf,
};
