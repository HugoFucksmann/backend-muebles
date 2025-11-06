-- 01_schema.sql
-- Creación de la estructura de tablas y tipos de datos.

-- 1. Creación de Tipos (ENUMS)
CREATE TYPE public.presupuesto_estado AS ENUM ('pendiente', 'convertido');
CREATE TYPE public.pedido_estado AS ENUM ('orden', 'entregado', 'cancelado');
CREATE TYPE public.pago_estado AS ENUM ('pendiente', 'pagado');
CREATE TYPE public.alerta_tipo AS ENUM ('5dias', '2dias');

-- 2. Creación de Tablas

-- Tabla de Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id),
  nombre TEXT NOT NULL,
  razon_social TEXT,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  direccion TEXT NOT NULL,
  cuit TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Tabla de Proveedores
CREATE TABLE public.proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  correo TEXT,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Tabla de Muebles
CREATE TABLE public.muebles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  categoria TEXT,
  proveedor_id UUID,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Tabla de Presupuestos
CREATE TABLE public.presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  cliente_id UUID NOT NULL,
  fecha_emision DATE DEFAULT now() NOT NULL,
  fecha_entrega DATE,
  estado public.presupuesto_estado DEFAULT 'pendiente' NOT NULL,
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Tabla de Items de Presupuesto
CREATE TABLE public.presupuesto_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  presupuesto_id UUID NOT NULL,
  mueble_id UUID NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  descripcion TEXT,
  precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0)
);

-- Tabla de Pedidos
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  cliente_id UUID NOT NULL,
  presupuesto_id UUID,
  fecha_emision DATE DEFAULT now() NOT NULL,
  fecha_entrega DATE,
  estado public.pedido_estado DEFAULT 'orden' NOT NULL,
  pago_estado public.pago_estado DEFAULT 'pendiente' NOT NULL,
  remito_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Tabla de Items de Pedido
CREATE TABLE public.pedido_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  pedido_id UUID NOT NULL,
  mueble_id UUID NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  descripcion TEXT,
  precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0)
);

-- Tabla de Remitos
CREATE TABLE public.remitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  pedido_id UUID NOT NULL,
  fecha_emision DATE DEFAULT now() NOT NULL,
  fecha_entrega DATE,
  pdf_url TEXT,
  datos_legales JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla de Items de Remito
CREATE TABLE public.remito_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  remito_id UUID NOT NULL,
  mueble_id UUID NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  descripcion TEXT,
  control BOOLEAN DEFAULT false NOT NULL
);

-- Tabla de Alertas
CREATE TABLE public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  pedido_id UUID NOT NULL,
  tipo public.alerta_tipo NOT NULL,
  activa BOOLEAN DEFAULT true NOT NULL,
  fecha_envio DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
