const supabase = require('../utils/supabase');

const getAllClientes = async () => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .is('deleted_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getClienteById = async (id) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createCliente = async (clienteData) => {
  const { data, error } = await supabase
    .from('clientes')
    .insert([clienteData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateCliente = async (id, clienteData) => {
  const { data, error } = await supabase
    .from('clientes')
    .update(clienteData)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deleteCliente = async (id) => {
  const { data, error } = await supabase
    .from('clientes')
    .update({ deleted_at: new Date() })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const exportClientes = async () => {
  return await getAllClientes();
};

module.exports = {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  exportClientes,
};
