const alertasService = require('../services/alertas.service');

const getAllAlertas = async (req, res) => {
  try {
    const alertas = await alertasService.getAllAlertas();
    res.status(200).json({ success: true, data: alertas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const checkAlertas = async (req, res) => {
  try {
    const newAlertas = await alertasService.checkAlertas();
    res.status(201).json({ success: true, data: newAlertas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllAlertas,
  checkAlertas,
};
