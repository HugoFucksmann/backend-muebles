-- 02_relationships.sql
-- Creación de las relaciones (claves foráneas) entre las tablas.

-- Muebles -> Proveedores
ALTER TABLE public.muebles
ADD CONSTRAINT fk_proveedor
FOREIGN KEY (proveedor_id)
REFERENCES public.proveedores(id);

-- Presupuestos -> Clientes
ALTER TABLE public.presupuestos
ADD CONSTRAINT fk_cliente
FOREIGN KEY (cliente_id)
REFERENCES public.clientes(id);

-- Presupuesto Items -> Presupuestos y Muebles
ALTER TABLE public.presupuesto_items
ADD CONSTRAINT fk_presupuesto
FOREIGN KEY (presupuesto_id)
REFERENCES public.presupuestos(id)
ON DELETE CASCADE; -- Si se borra un presupuesto, se borran sus items

ALTER TABLE public.presupuesto_items
ADD CONSTRAINT fk_mueble
FOREIGN KEY (mueble_id)
REFERENCES public.muebles(id);

-- Pedidos -> Clientes, Presupuestos, Remitos
ALTER TABLE public.pedidos
ADD CONSTRAINT fk_cliente
FOREIGN KEY (cliente_id)
REFERENCES public.clientes(id);

ALTER TABLE public.pedidos
ADD CONSTRAINT fk_presupuesto
FOREIGN KEY (presupuesto_id)
REFERENCES public.presupuestos(id);

-- La FK de remito_id en pedidos es un poco extraña, usualmente es al revés.
-- La tabla remitos ya tiene un pedido_id. Se puede omitir aquí si la relación es 1 a N (1 pedido -> N remitos).
-- Si es 1 a 1, se puede mantener, pero se crea una dependencia circular.
-- Por ahora, la comentamos para seguir el modelo más estándar.
-- ALTER TABLE public.pedidos
-- ADD CONSTRAINT fk_remito
-- FOREIGN KEY (remito_id)
-- REFERENCES public.remitos(id);

-- Pedido Items -> Pedidos y Muebles
ALTER TABLE public.pedido_items
ADD CONSTRAINT fk_pedido
FOREIGN KEY (pedido_id)
REFERENCES public.pedidos(id)
ON DELETE CASCADE;

ALTER TABLE public.pedido_items
ADD CONSTRAINT fk_mueble
FOREIGN KEY (mueble_id)
REFERENCES public.muebles(id);

-- Remitos -> Pedidos
ALTER TABLE public.remitos
ADD CONSTRAINT fk_pedido
FOREIGN KEY (pedido_id)
REFERENCES public.pedidos(id);

-- Remito Items -> Remitos y Muebles
ALTER TABLE public.remito_items
ADD CONSTRAINT fk_remito
FOREIGN KEY (remito_id)
REFERENCES public.remitos(id)
ON DELETE CASCADE;

ALTER TABLE public.remito_items
ADD CONSTRAINT fk_mueble
FOREIGN KEY (mueble_id)
REFERENCES public.muebles(id);

-- Alertas -> Pedidos
ALTER TABLE public.alertas
ADD CONSTRAINT fk_pedido
FOREIGN KEY (pedido_id)
REFERENCES public.pedidos(id)
ON DELETE CASCADE;
