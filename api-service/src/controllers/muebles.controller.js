const mueblesService = require('../services/muebles.service');

const getAllMuebles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const muebles = await mueblesService.getAllMuebles(page, limit);
    res.status(200).json({ success: true, data: muebles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMuebleById = async (req, res) => {
  try {
    const { id } = req.params;
    const mueble = await mueblesService.getMuebleById(id);
    if (!mueble) {
      return res.status(404).json({ success: false, error: 'Mueble not found' });
    }
    res.status(200).json({ success: true, data: mueble });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createMueble = async (req, res) => {
  try {
    const newMueble = await mueblesService.createMueble(req.body);
    res.status(201).json({ success: true, data: newMueble });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateMueble = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMueble = await mueblesService.updateMueble(id, req.body);
    if (!updatedMueble || updatedMueble.length === 0) {
      return res.status(404).json({ success: false, error: 'Mueble not found' });
    }
    res.status(200).json({ success: true, data: updatedMueble });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteMueble = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMueble = await mueblesService.deleteMueble(id);
    if (!deletedMueble || deletedMueble.length === 0) {
      return res.status(404).json({ success: false, error: 'Mueble not found' });
    }
    res.status(200).json({ success: true, message: 'Mueble deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const updatedMueble = await mueblesService.updateStock(id, stock);
    if (!updatedMueble || updatedMueble.length === 0) {
      return res.status(404).json({ success: false, error: 'Mueble not found' });
    }
    res.status(200).json({ success: true, data: updatedMueble });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllMuebles,
  getMuebleById,
  createMueble,
  updateMueble,
  deleteMueble,
  updateStock,
};
