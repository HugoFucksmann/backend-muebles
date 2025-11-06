const clientesService = require('../services/clientes.service');
const { Parser } = require('json2csv');

const getAllClientes = async (req, res) => {
  try {
    const clientes = await clientesService.getAllClientes();
    res.status(200).json({ success: true, data: clientes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await clientesService.getClienteById(id);
    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente not found' });
    }
    res.status(200).json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createCliente = async (req, res) => {
  try {
    const newCliente = await clientesService.createCliente(req.body);
    res.status(201).json({ success: true, data: newCliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCliente = await clientesService.updateCliente(id, req.body);
    if (!updatedCliente || updatedCliente.length === 0) {
      return res.status(404).json({ success: false, error: 'Cliente not found' });
    }
    res.status(200).json({ success: true, data: updatedCliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCliente = await clientesService.deleteCliente(id);
    if (!deletedCliente || deletedCliente.length === 0) {
      return res.status(404).json({ success: false, error: 'Cliente not found' });
    }
    res.status(200).json({ success: true, message: 'Cliente deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const exportClientes = async (req, res) => {
  try {
    const clientes = await clientesService.exportClientes();
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(clientes);

    res.header('Content-Type', 'text/csv');
    res.attachment('clientes.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  exportClientes,
};
