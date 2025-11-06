-- 04_functions.sql
-- Creación de funciones atómicas (RPC) para lógica de negocio compleja.

CREATE OR REPLACE FUNCTION public.convertir_presupuesto_a_pedido(presupuesto_id_in UUID)
RETURNS UUID -- Devuelve el ID del nuevo pedido
LANGUAGE plpgsql
-- SECURITY DEFINER se usa para que la función se ejecute con los permisos del que la creó (el admin),
-- permitiendo así que modifique tablas a las que el usuario final podría no tener acceso directo.
SECURITY DEFINER
AS $$
DECLARE
  presupuesto_rec RECORD;
  item_rec RECORD;
  new_pedido_id UUID;
BEGIN
  -- 1. Obtener el presupuesto y verificar su estado
  SELECT * INTO presupuesto_rec FROM public.presupuestos WHERE id = presupuesto_id_in;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Presupuesto con ID % no encontrado', presupuesto_id_in;
  END IF;

  IF presupuesto_rec.estado = 'convertido' THEN
    RAISE EXCEPTION 'El presupuesto ya ha sido convertido';
  END IF;

  -- 2. Verificar stock para cada ítem del presupuesto
  FOR item_rec IN (SELECT pi.cantidad, m.stock, m.nombre FROM public.presupuesto_items pi JOIN public.muebles m ON pi.mueble_id = m.id WHERE pi.presupuesto_id = presupuesto_id_in)
  LOOP
    IF item_rec.stock < item_rec.cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para el producto: %. Disponible: %, Solicitado: %', item_rec.nombre, item_rec.stock, item_rec.cantidad;
    END IF;
  END LOOP;

  -- 3. Crear el nuevo pedido
  INSERT INTO public.pedidos (cliente_id, presupuesto_id, fecha_emision, fecha_entrega, estado, pago_estado)
  VALUES (presupuesto_rec.cliente_id, presupuesto_rec.id, now(), presupuesto_rec.fecha_entrega, 'orden', 'pendiente')
  RETURNING id INTO new_pedido_id;

  -- 4. Copiar los items del presupuesto a los items del pedido
  INSERT INTO public.pedido_items (pedido_id, mueble_id, cantidad, descripcion, precio_unitario)
  SELECT new_pedido_id, mueble_id, cantidad, descripcion, precio_unitario
  FROM public.presupuesto_items
  WHERE presupuesto_id = presupuesto_id_in;

  -- 5. Actualizar el stock de los muebles
  FOR item_rec IN (SELECT mueble_id, cantidad FROM public.presupuesto_items WHERE presupuesto_id = presupuesto_id_in)
  LOOP
    UPDATE public.muebles
    SET stock = stock - item_rec.cantidad
    WHERE id = item_rec.mueble_id;
  END LOOP;

  -- 6. Actualizar el estado del presupuesto a 'convertido'
  UPDATE public.presupuestos
  SET estado = 'convertido'
  WHERE id = presupuesto_id_in;

  -- 7. Devolver el ID del nuevo pedido
  RETURN new_pedido_id;
END;
$$;
