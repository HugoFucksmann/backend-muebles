const proveedoresService = require('../services/proveedores.service');

const getAllProveedores = async (req, res) => {
  try {
    const proveedores = await proveedoresService.getAllProveedores();
    res.status(200).json({ success: true, data: proveedores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createProveedor = async (req, res) => {
  try {
    const newProveedor = await proveedoresService.createProveedor(req.body);
    res.status(201).json({ success: true, data: newProveedor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProveedor = await proveedoresService.updateProveedor(id, req.body);
    if (!updatedProveedor || updatedProveedor.length === 0) {
      return res.status(404).json({ success: false, error: 'Proveedor not found' });
    }
    res.status(200).json({ success: true, data: updatedProveedor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProveedor = await proveedoresService.deleteProveedor(id);
    if (!deletedProveedor || deletedProveedor.length === 0) {
      return res.status(404).json({ success: false, error: 'Proveedor not found' });
    }
    res.status(200).json({ success: true, message: 'Proveedor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
};
