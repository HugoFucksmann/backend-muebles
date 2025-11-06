const supabase = require('../utils/supabase');
const PDFDocument = require('pdfkit');

const getAllRemitos = async () => {
  const { data, error } = await supabase
    .from('remitos')
    .select('*')
    .is('deleted_at', null);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const getRemitoById = async (id) => {
  const { data, error } = await supabase
    .from('remitos')
    .select('*, remito_items(*, muebles(*)), pedidos(*, clientes(*)))')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const createRemito = async (pedido_id) => {
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('*, pedido_items(*)')
    .eq('id', pedido_id)
    .single();

  if (pedidoError || !pedido) {
    throw new Error('Pedido not found for remito creation.');
  }

  const { data: remito, error: remitoError } = await supabase
    .from('remitos')
    .insert({
      pedido_id: pedido.id,
      fecha_emision: new Date(),
      fecha_entrega: pedido.fecha_entrega,
      datos_legales: { empresa: 'Muebles & Co', cuit: '30-12345678-9' }, // Default legal data
    })
    .select()
    .single();

  if (remitoError) {
    throw new Error(remitoError.message);
  }

  if (pedido.pedido_items && pedido.pedido_items.length > 0) {
    const remitoItemsToCreate = pedido.pedido_items.map(item => ({
      remito_id: remito.id,
      mueble_id: item.mueble_id,
      cantidad: item.cantidad,
      descripcion: item.descripcion,
      control: false,
    }));

    const { error: itemsError } = await supabase
      .from('remito_items')
      .insert(remitoItemsToCreate);

    if (itemsError) {
      // Ideally, we should roll back the remito creation if items fail
      throw new Error(itemsError.message);
    }
  }

  // TODO: Generate PDF, upload to GCS, and update remito.pdf_url

  const finalRemito = await getRemitoById(remito.id);
  return finalRemito;
};

const updateRemito = async (id, remitoData) => {
  const { data, error } = await supabase
    .from('remitos')
    .update(remitoData)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const deleteRemito = async (id) => {
  const { data, error } = await supabase
    .from('remitos')
    .update({ deleted_at: new Date() })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const getRemitoPdf = async (id) => {
  const remito = await getRemitoById(id);
  if (!remito) {
    throw new Error('Remito not found');
  }

  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Header
  doc.fontSize(20).text('Remito', { align: 'center' });
  doc.moveDown();

  // Company and Client Info
  doc.fontSize(12);
  doc.text(`Remito ID: ${remito.id}`, { continued: true });
  doc.text(`Fecha Emisión: ${new Date(remito.fecha_emision).toLocaleDateString()}`, { align: 'right' });
  doc.text(`Pedido ID: ${remito.pedido_id}`, { continued: true });
  doc.text(`Fecha Entrega: ${new Date(remito.fecha_entrega).toLocaleDateString()}`, { align: 'right' });
  doc.moveDown();
  doc.text(`Cliente: ${remito.pedidos.clientes.nombre}`);
  doc.text(`Dirección: ${remito.pedidos.clientes.direccion}`);
  doc.moveDown(2);

  // Table Header
  const tableTop = doc.y;
  doc.font('Helvetica-Bold');
  doc.text('Cantidad', 50, tableTop);
  doc.text('Descripción', 150, tableTop);
  doc.text('Control', 500, tableTop, { width: 50, align: 'center' });
  doc.font('Helvetica');
  doc.y += 15;
  const startX = 50;
  const endX = 550;
  doc.moveTo(startX, doc.y).lineTo(endX, doc.y).stroke();
  doc.moveDown();


  // Table Rows
  remito.remito_items.forEach(item => {
    const y = doc.y;
    doc.text(String(item.cantidad), 50, y, { width: 90 });
    doc.text(item.muebles.nombre, 150, y, { width: 340 });
    // Draw a checkbox for control
    doc.rect(518, y - 5, 15, 15).stroke();
    doc.moveDown(2);
  });

  doc.end();

  return new Promise(resolve => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
};

module.exports = {
  getAllRemitos,
  getRemitoById,
  createRemito,
  updateRemito,
  deleteRemito,
  getRemitoPdf,
};
