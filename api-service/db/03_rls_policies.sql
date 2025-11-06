-- 03_rls_policies.sql
-- Habilitación de RLS y creación de políticas de seguridad.

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muebles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuesto_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

-- 2. Función auxiliar para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt()->>'app_metadata'->>'role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Políticas de Seguridad

-- Política genérica para administradores (acceso total)
CREATE POLICY "Admins can do everything" ON public.clientes FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.proveedores FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.muebles FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.presupuestos FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.presupuesto_items FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.pedidos FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.pedido_items FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.remitos FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.remito_items FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Admins can do everything" ON public.alertas FOR ALL USING (public.get_my_role() = 'admin');

-- Políticas para usuarios autenticados (rol 'cliente')

-- Clientes: Un usuario puede ver y modificar su propia información.
CREATE POLICY "Users can view their own client data" ON public.clientes FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own client data" ON public.clientes FOR UPDATE USING (auth.uid() = id);

-- Muebles: Cualquier usuario autenticado puede ver los muebles.
CREATE POLICY "Authenticated users can view muebles" ON public.muebles FOR SELECT USING (auth.role() = 'authenticated');

-- Presupuestos: Los usuarios pueden ver/gestionar sus propios presupuestos.
CREATE POLICY "Users can view their own presupuestos" ON public.presupuestos FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Users can create their own presupuestos" ON public.presupuestos FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Users can update their own presupuestos" ON public.presupuestos FOR UPDATE USING (auth.uid() = cliente_id);

-- Pedidos: Los usuarios pueden ver/gestionar sus propios pedidos.
CREATE POLICY "Users can view their own pedidos" ON public.pedidos FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Users can create their own pedidos" ON public.pedidos FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Users can update their own pedidos" ON public.pedidos FOR UPDATE USING (auth.uid() = cliente_id);

-- Items: Los usuarios pueden ver items que pertenecen a sus presupuestos/pedidos.
-- (Estas políticas son más complejas y se basan en subconsultas)
CREATE POLICY "Users can view items of their own presupuestos" ON public.presupuesto_items FOR SELECT
  USING ( (SELECT cliente_id FROM public.presupuestos WHERE id = presupuesto_id) = auth.uid() );

CREATE POLICY "Users can view items of their own pedidos" ON public.pedido_items FOR SELECT
  USING ( (SELECT cliente_id FROM public.pedidos WHERE id = pedido_id) = auth.uid() );
