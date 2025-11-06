-- 05_statistics.sql
-- Creación de funciones para obtener estadísticas para el dashboard.

CREATE OR REPLACE FUNCTION public.get_dashboard_statistics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_ingresos NUMERIC;
  conteo_pedidos_mes INT;
  conteo_clientes_nuevos INT;
  productos_bajo_stock JSON;
BEGIN
  -- 1. Calcular ingresos totales (de pedidos pagados)
  SELECT COALESCE(SUM(p.total), 0) INTO total_ingresos
  FROM public.pedidos pd
  JOIN public.presupuestos p ON pd.presupuesto_id = p.id
  WHERE pd.pago_estado = 'pagado';

  -- 2. Contar pedidos del último mes
  SELECT COUNT(*) INTO conteo_pedidos_mes
  FROM public.pedidos
  WHERE created_at >= date_trunc('month', now());

  -- 3. Contar clientes nuevos del último mes
  SELECT COUNT(*) INTO conteo_clientes_nuevos
  FROM public.clientes
  WHERE created_at >= date_trunc('month', now());

  -- 4. Obtener los 5 productos con stock más bajo (ej: < 10)
  SELECT json_agg(json_build_object('nombre', nombre, 'stock', stock)) INTO productos_bajo_stock
  FROM (
    SELECT nombre, stock
    FROM public.muebles
    WHERE stock < 10 AND deleted_at IS NULL
    ORDER BY stock ASC
    LIMIT 5
  ) AS subquery;

  -- Construir y devolver el objeto JSON final
  RETURN json_build_object(
    'totalIngresos', total_ingresos,
    'pedidosEsteMes', conteo_pedidos_mes,
    'clientesNuevosEsteMes', conteo_clientes_nuevos,
    'productosBajoStock', COALESCE(productos_bajo_stock, '[]'::json)
  );
END;
$$;
