const supabase = require('../utils/supabase');
const PDFDocument = require('pdfkit');

const getAllPresupuestos = async () => {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getPresupuestoById = async (id) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*, presupuesto_items(*, muebles(*)))')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createPresupuesto = async (presupuestoData) => {
  const { cliente_id, fecha_entrega, items } = presupuestoData;

  // Calculate total and prepare items
  let total = 0;
  const itemsToCreate = [];
  for (const item of items) {
    const { data: mueble, error } = await supabase
      .from('muebles')
      .select('precio')
      .eq('id', item.mueble_id)
      .single();

    if (error) throw new Error('Mueble not found');

    const precio_unitario = mueble.precio;
    total += precio_unitario * item.cantidad;
    itemsToCreate.push({
      mueble_id: item.mueble_id,
      cantidad: item.cantidad,
      descripcion: item.descripcion,
      precio_unitario,
    });
  }

  // Create presupuesto
  const { data: presupuesto, error: presupuestoError } = await supabase
    .from('presupuestos')
    .insert([{ cliente_id, fecha_entrega, total, estado: 'pendiente' }])
    .select()
    .single();

  if (presupuestoError) {
    throw new Error(presupuestoError.message);
  }

  // Add presupuesto_id to items and create them
  const finalItems = itemsToCreate.map(item => ({ ...item, presupuesto_id: presupuesto.id }));
  const { data: createdItems, error: itemsError } = await supabase
    .from('presupuesto_items')
    .insert(finalItems)
    .select();

  if (itemsError) {
    // Here we should ideally roll back the presupuesto creation
    throw new Error(itemsError.message);
  }

  return { ...presupuesto, items: createdItems };
};

const updatePresupuesto = async (id, presupuestoData) => {
  const { items, ...rest } = presupuestoData;

  // Update main presupuesto record
  const { data: updatedPresupuesto, error: updateError } = await supabase
    .from('presupuestos')
    .update(rest)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  let updatedItems = [];
  if (items && items.length > 0) {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('presupuesto_items')
      .delete()
      .eq('presupuesto_id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Create new items and calculate new total
    let newTotal = 0;
    const itemsToCreate = [];
    for (const item of items) {
      const { data: mueble, error } = await supabase
        .from('muebles')
        .select('precio')
        .eq('id', item.mueble_id)
        .single();

      if (error) throw new Error('Mueble not found');

      const precio_unitario = mueble.precio;
      newTotal += precio_unitario * item.cantidad;
      itemsToCreate.push({
        mueble_id: item.mueble_id,
        cantidad: item.cantidad,
        descripcion: item.descripcion,
        precio_unitario,
        presupuesto_id: id,
      });
    }

    const { data: createdItems, error: createItemsError } = await supabase
      .from('presupuesto_items')
      .insert(itemsToCreate)
      .select();

    if (createItemsError) {
      throw new Error(createItemsError.message);
    }
    updatedItems = createdItems;

    // Update presupuesto total
    const { error: updateTotalError } = await supabase
      .from('presupuestos')
      .update({ total: newTotal })
      .eq('id', id);

    if (updateTotalError) {
      throw new Error(updateTotalError.message);
    }
  }

  return { ...updatedPresupuesto, items: updatedItems };
};

const deletePresupuesto = async (id) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .update({ deleted_at: new Date() })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const convertirPresupuesto = async (id) => {
  // Fetch the presupuesto and its items
  const { data: presupuesto, error: fetchError } = await supabase
    .from('presupuestos')
    .select('*, presupuesto_items(*, muebles(stock, nombre)))') // Include stock and name
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  if (!presupuesto) {
    throw new Error('Presupuesto not found');
  }
  if (presupuesto.estado === 'convertido') {
    throw new Error('Presupuesto already converted');
  }

  // 1. Check for sufficient stock for all items BEFORE creating the pedido
  for (const item of presupuesto.presupuesto_items) {
    if (item.muebles.stock < item.cantidad) {
      throw new Error(`Not enough stock for ${item.muebles.nombre}. Available: ${item.muebles.stock}, Requested: ${item.cantidad}`);
    }
  }

  // 2. Create a new pedido
  const { data: newPedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      cliente_id: presupuesto.cliente_id,
      presupuesto_id: presupuesto.id,
      fecha_emision: new Date(),
      fecha_entrega: presupuesto.fecha_entrega,
      estado: 'orden',
      pago_estado: 'pendiente',
    })
    .select()
    .single();

  if (pedidoError) {
    throw new Error(pedidoError.message);
  }

  // 3. Decrement stock for each item
  for (const item of presupuesto.presupuesto_items) {
    const newStock = item.muebles.stock - item.cantidad;
    const { error: stockError } = await supabase
      .from('muebles')
      .update({ stock: newStock })
      .eq('id', item.mueble_id);

    if (stockError) {
      // This is a critical issue. Ideally, we should roll back the pedido creation.
      console.error(`Failed to update stock for mueble ${item.mueble_id}. Rollback should be implemented.`);
      throw new Error(stockError.message);
    }
  }

  // 4. Update presupuesto status
  const { error: updatePresupuestoError } = await supabase
    .from('presupuestos')
    .update({ estado: 'convertido' })
    .eq('id', id);

  if (updatePresupuestoError) {
    throw new Error(updatePresupuestoError.message);
  }

  // 5. Create pedido_items from presupuesto_items
  const pedidoItemsToCreate = presupuesto.presupuesto_items.map(item => ({
    pedido_id: newPedido.id,
    mueble_id: item.mueble_id,
    cantidad: item.cantidad,
    descripcion: item.descripcion,
    precio_unitario: item.precio_unitario,
  }));

  const { error: pedidoItemsError } = await supabase
    .from('pedido_items') // Assuming a pedido_items table exists
    .insert(pedidoItemsToCreate);

  if (pedidoItemsError) {
    throw new Error(pedidoItemsError.message);
  }

  return newPedido;
};

const getPresupuestoPdf = async (id) => {
  const { data: presupuesto, error: fetchError } = await supabase
    .from('presupuestos')
    .select('*, clientes(*), presupuesto_items(*, muebles(*)))')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  if (!presupuesto) {
    throw new Error('Presupuesto not found');
  }

  const doc = new PDFDocument();
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    let pdfData = Buffer.concat(buffers);
    // Here you would typically upload to GCS and return the URL
    // For now, we just return the buffer
  });

  doc.fontSize(25).text('Presupuesto', { align: 'center' });
  doc.fontSize(12).text(`ID: ${presupuesto.id}`);
  doc.text(`Cliente: ${presupuesto.clientes.nombre}`);
  doc.text(`Fecha Emisión: ${new Date(presupuesto.created_at).toLocaleDateString()}`);
  doc.text(`Fecha Entrega: ${new Date(presupuesto.fecha_entrega).toLocaleDateString()}`);
  doc.text(`Estado: ${presupuesto.estado}`);
  doc.moveDown();

  doc.fontSize(15).text('Items:');
  presupuesto.presupuesto_items.forEach(item => {
    doc.text(`- ${item.muebles.nombre} (${item.cantidad} unidades) - $${item.precio_unitario} c/u`);
    if (item.descripcion) {
      doc.text(`  Descripción: ${item.descripcion}`);
    }
  });
  doc.moveDown();

  doc.fontSize(18).text(`Total: $${presupuesto.total}`, { align: 'right' });

  doc.end();

  return new Promise(resolve => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
};

module.exports = {
  getAllPresupuestos,
  getPresupuestoById,
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  convertirPresupuesto,
  getPresupuestoPdf,
};
