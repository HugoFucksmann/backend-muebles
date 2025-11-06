const supabase = require('../utils/supabase');

const getAllProveedores = async () => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .is('deleted_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createProveedor = async (proveedorData) => {
  const { data, error } = await supabase
    .from('proveedores')
    .insert([proveedorData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateProveedor = async (id, proveedorData) => {
  const { data, error } = await supabase
    .from('proveedores')
    .update(proveedorData)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deleteProveedor = async (id) => {
  const { data, error } = await supabase
    .from('proveedores')
    .update({ deleted_at: new Date() })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  getAllProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
};
