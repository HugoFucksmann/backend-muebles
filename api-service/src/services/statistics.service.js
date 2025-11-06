// src/services/statistics.service.js
const supabase = require('../utils/supabase');

const getDashboardStatistics = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_statistics');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  getDashboardStatistics,
};
