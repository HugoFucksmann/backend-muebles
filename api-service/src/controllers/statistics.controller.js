// src/controllers/statistics.controller.js
const statisticsService = require('../services/statistics.service');

const getDashboardStatistics = async (req, res) => {
  try {
    const stats = await statisticsService.getDashboardStatistics();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardStatistics,
};
