const supabase = require('../utils/supabase');
const remitosService = require('./remitos.service');
// const mercadopago = require('mercadopago');
const PDFDocument = require('pdfkit');

// mercadopago.configure({
//   access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
// });

const getAllPedidos = async () => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getPedidosByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, clientes(*), presupuestos(*, presupuesto_items(*, muebles(*))))')
    .eq('cliente_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getPedidoById = async (id) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, clientes(*), presupuestos(*, presupuesto_items(*, muebles(*))))')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createPedido = async (pedidoData) => {
  const { data, error } = await supabase
    .from('pedidos')
    .insert([pedidoData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updatePedido = async (id, pedidoData) => {
  const { data, error } = await supabase
    .from('pedidos')
    .update(pedidoData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (pedidoData.estado === 'entregado') {
    await remitosService.createRemito(id);
  }

  return data;
};

const deletePedido = async (id) => {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ deleted_at: new Date() })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const pagarPedido = async (id) => {
  // Mocking MercadoPago for now
  console.log(`Mocking payment for pedido ID: ${id}`);
  return `https://mock-mercadopago.com/checkout?pedido_id=${id}&status=pending`;
};

const getPedidoPdf = async (id) => {
  const pedido = await getPedidoById(id);
  if (!pedido) {
    throw new Error('Pedido not found');
  }

  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  doc.fontSize(20).text('Orden de Pedido', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Pedido ID: ${pedido.id}`);
  doc.text(`Cliente: ${pedido.clientes.nombre}`);
  doc.text(`Fecha Emisión: ${new Date(pedido.fecha_emision).toLocaleDateString()}`);
  doc.text(`Fecha Entrega: ${new Date(pedido.fecha_entrega).toLocaleDateString()}`);
  doc.text(`Estado: ${pedido.estado}`);
  doc.text(`Pago: ${pedido.pago_estado}`);
  doc.moveDown(2);

  doc.fontSize(15).text('Detalle del Pedido:');
  let total = 0;
  pedido.presupuestos.presupuesto_items.forEach(item => {
    doc.text(`- ${item.muebles.nombre} (x${item.cantidad}) - $${item.precio_unitario} c/u`);
    total += item.cantidad * item.precio_unitario;
  });
  doc.moveDown();

  doc.fontSize(18).text(`Total: $${total}`, { align: 'right' });

  doc.end();

  return new Promise(resolve => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
};

module.exports = {
  getAllPedidos,
  getPedidosByUserId,
  getPedidoById,
  createPedido,
  updatePedido,
  deletePedido,
  pagarPedido,
  getPedidoPdf,
};
