const supabase = require('../utils/supabase');

const getAllMuebles = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('muebles')
    .select('*')
    .is('deleted_at', null)
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getMuebleById = async (id) => {
  const { data, error } = await supabase
    .from('muebles')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createMueble = async (muebleData) => {
  const { data, error } = await supabase
    .from('muebles')
    .insert([muebleData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateMueble = async (id, muebleData) => {
  const { data, error } = await supabase
    .from('muebles')
    .update(muebleData)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deleteMueble = async (id) => {
  const { data, error } = await supabase
    .from('muebles')
    .update({ deleted_at: new Date() })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateStock = async (id, stock) => {
  const { data, error } = await supabase
    .from('muebles')
    .update({ stock })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  getAllMuebles,
  getMuebleById,
  createMueble,
  updateMueble,
  deleteMueble,
  updateStock,
};
