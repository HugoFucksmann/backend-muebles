const supabase = require('../utils/supabase');

const getAllAlertas = async () => {
  const { data, error } = await supabase
    .from('alertas')
    .select('*, pedidos(*)')
    .eq('activa', true)
    .is('deleted_at', null);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const checkAlertas = async () => {
  const today = new Date();
  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(today.getDate() + 5);

  // Find upcoming pedidos within the next 5 days
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('*')
    .eq('estado', 'orden')
    .gte('fecha_entrega', today.toISOString())
    .lte('fecha_entrega', fiveDaysFromNow.toISOString());

  if (pedidosError) {
    throw new Error(pedidosError.message);
  }

  const createdAlerts = [];

  for (const pedido of pedidos) {
    const deliveryDate = new Date(pedido.fecha_entrega);
    const twoDaysBefore = new Date(deliveryDate);
    twoDaysBefore.setDate(deliveryDate.getDate() - 2);
    const fiveDaysBefore = new Date(deliveryDate);
    fiveDaysBefore.setDate(deliveryDate.getDate() - 5);

    const alertsToCreate = [];

    // Check for 5-day alert
    if (today >= fiveDaysBefore) {
      alertsToCreate.push({
        pedido_id: pedido.id,
        tipo: '5dias',
        activa: true,
        fecha_envio: new Date(),
      });
    }

    // Check for 2-day alert
    if (today >= twoDaysBefore) {
      alertsToCreate.push({
        pedido_id: pedido.id,
        tipo: '2dias',
        activa: true,
        fecha_envio: new Date(),
      });
    }

    if (alertsToCreate.length > 0) {
      // Check if alerts of these types already exist for this pedido
      const { data: existingAlerts, error: existingError } = await supabase
        .from('alertas')
        .select('tipo')
        .eq('pedido_id', pedido.id)
        .in('tipo', alertsToCreate.map(a => a.tipo));

      if (existingError) {
        console.error('Error checking existing alerts:', existingError.message);
        continue; // Skip to next pedido on error
      }

      const existingTypes = existingAlerts.map(a => a.tipo);
      const finalAlertsToCreate = alertsToCreate.filter(a => !existingTypes.includes(a.tipo));

      if (finalAlertsToCreate.length > 0) {
        const { data: newAlerts, error: createError } = await supabase
          .from('alertas')
          .insert(finalAlertsToCreate)
          .select();

        if (createError) {
          console.error('Error creating alerts:', createError.message);
        } else {
          createdAlerts.push(...newAlerts);
        }
      }
    }
  }

  return createdAlerts;
};

module.exports = {
  getAllAlertas,
  checkAlertas,
};
