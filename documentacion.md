# 🧱 Documentación Técnica — Backend `api-service`

## 1. Descripción General

El servicio **`api-service`** es el backend del proyecto de venta de muebles.  
Está desarrollado en **Node.js con Express**, desplegado en **Google Cloud Run**, conectado a **Supabase** (PostgreSQL + Auth) y **Google Cloud Storage**.

La API es **única** y sirve tanto a la **web pública (e-commerce)** como al **panel administrativo**, con control de acceso por **roles** (`cliente` y `admin`).

---

## 2. Arquitectura General

| Componente            | Descripción                           |
| --------------------- | ------------------------------------- |
| **Framework**         | Node.js + Express                     |
| **Base de datos**     | Supabase (PostgreSQL)                 |
| **Autenticación**     | Supabase Auth (JWT)                   |
| **Almacenamiento**    | Google Cloud Storage (imágenes, PDFs) |
| **Despliegue**        | Google Cloud Run                      |
| **Generación de PDF** | `pdfkit` o `pdf-lib` (backend)        |
| **Pagos**             | MercadoPago SDK                       |

---

## 3. Módulos Principales

### 🔐 Autenticación y Roles

- Supabase gestiona el login y registro.
- Roles definidos:
  - `cliente`: acceso a catálogo, presupuestos y pedidos propios.
  - `admin`: acceso completo al panel y operaciones CRUD.

---

## 4. Modelo de Datos (Supabase / PostgreSQL)

### 🧍 `clientes`

| Campo        | Tipo                 | Descripción               |
| ------------ | -------------------- | ------------------------- |
| id           | uuid (PK)            | Identificador del cliente |
| nombre       | text                 | Nombre completo           |
| razon_social | text                 | Razón social              |
| telefono     | text                 | Teléfono                  |
| email        | text                 | Correo electrónico        |
| direccion    | text                 | Dirección                 |
| cuit         | text                 | Opcional                  |
| created_at   | timestamp            | Fecha de creación         |
| deleted_at   | timestamp (nullable) | Soft delete               |

---

### 🪑 `muebles`

| Campo        | Tipo                 | Descripción                |
| ------------ | -------------------- | -------------------------- |
| id           | uuid (PK)            | Identificador              |
| nombre       | text                 | Nombre del mueble          |
| descripcion  | text                 | Descripción                |
| precio       | numeric              | Precio unitario            |
| categoria    | text                 | Categoría                  |
| proveedor_id | uuid (FK)            | Relación con `proveedores` |
| stock        | integer              | Cantidad disponible        |
| imagen_url   | text                 | URL en bucket de Google    |
| created_at   | timestamp            | Fecha de alta              |
| deleted_at   | timestamp (nullable) | Soft delete                |

---

### 🏭 `proveedores`

| Campo      | Tipo                 | Descripción          |
| ---------- | -------------------- | -------------------- |
| id         | uuid (PK)            | Identificador        |
| nombre     | text                 | Nombre del proveedor |
| contacto   | text                 | Persona de contacto  |
| telefono   | text                 | Teléfono             |
| correo     | text                 | Correo electrónico   |
| direccion  | text                 | Dirección            |
| created_at | timestamp            | Fecha de alta        |
| deleted_at | timestamp (nullable) | Soft delete          |

---

### 🧾 `presupuestos`

| Campo         | Tipo                           | Descripción                          |
| ------------- | ------------------------------ | ------------------------------------ |
| id            | uuid (PK)                      | Identificador                        |
| cliente_id    | uuid (FK)                      | Cliente asociado                     |
| fecha_emision | date                           | Automática                           |
| fecha_entrega | date                           | Calculada en días hábiles (editable) |
| estado        | enum(`pendiente`,`convertido`) | Estado                               |
| total         | numeric                        | Monto total                          |
| pdf_url       | text                           | URL del PDF generado                 |
| created_at    | timestamp                      | Fecha de registro                    |

**Subtabla:** `presupuesto_items`
| Campo | Tipo | Descripción |
|--------|------|-------------|
| id | uuid (PK) | Identificador |
| presupuesto_id | uuid (FK) | Relación con presupuesto |
| mueble_id | uuid (FK) | Producto |
| cantidad | integer | Unidades |
| descripcion | text | Descripción |
| precio_unitario | numeric | Precio unitario |

---

### 📦 `pedidos`

| Campo          | Tipo                                  | Descripción            |
| -------------- | ------------------------------------- | ---------------------- |
| id             | uuid (PK)                             | Identificador          |
| cliente_id     | uuid (FK)                             | Cliente asociado       |
| presupuesto_id | uuid (FK)                             | Presupuesto base       |
| fecha_emision  | date                                  | Automática             |
| fecha_entrega  | date                                  | Automática / editable  |
| estado         | enum(`orden`,`entregado`,`cancelado`) | Estado actual          |
| pago_estado    | enum(`pendiente`,`pagado`)            | Estado del pago        |
| remito_id      | uuid (FK)                             | Relación con `remitos` |
| created_at     | timestamp                             | Fecha de creación      |
| deleted_at     | timestamp (nullable)                  | Soft delete            |

---

### 📜 `remitos`

| Campo         | Tipo      | Descripción         |
| ------------- | --------- | ------------------- |
| id            | uuid (PK) | Identificador       |
| pedido_id     | uuid (FK) | Pedido asociado     |
| fecha_emision | date      | Automática          |
| fecha_entrega | date      | Copiada del pedido  |
| pdf_url       | text      | URL del PDF         |
| datos_legales | jsonb     | Datos de la empresa |
| created_at    | timestamp | Fecha de creación   |

**Subtabla:** `remito_items`
| Campo | Tipo | Descripción |
|--------|------|-------------|
| id | uuid (PK) | Identificador |
| remito_id | uuid (FK) | Relación con remito |
| mueble_id | uuid (FK) | Producto |
| cantidad | integer | Cantidad |
| descripcion | text | Descripción |
| control | boolean | Casilla de control ✅ |

---

### 🔔 `alertas`

| Campo       | Tipo                  | Descripción        |
| ----------- | --------------------- | ------------------ |
| id          | uuid (PK)             | Identificador      |
| pedido_id   | uuid (FK)             | Pedido relacionado |
| tipo        | enum(`5dias`,`2dias`) | Tipo de alerta     |
| activa      | boolean               | Estado             |
| fecha_envio | date                  | Fecha estimada     |

---

## 5. Endpoints API (REST)

### 🔐 Autenticación

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/profile` → devuelve usuario logueado (vía Supabase JWT)

---

### 👥 Clientes

- `GET /clientes` → lista (solo admin)
- `GET /clientes/:id`
- `POST /clientes`
- `PUT /clientes/:id`
- `DELETE /clientes/:id` → soft-delete
- `GET /clientes/export` → exporta CSV

---

### 🪑 Muebles

- `GET /muebles`
- `GET /muebles/:id`
- `POST /muebles`
- `PUT /muebles/:id`
- `DELETE /muebles/:id`
- `PATCH /muebles/:id/stock` → actualiza stock

---

### 🏭 Proveedores

- `GET /proveedores`
- `POST /proveedores`
- `PUT /proveedores/:id`
- `DELETE /proveedores/:id`

---

### 🧾 Presupuestos

- `GET /presupuestos`
- `GET /presupuestos/:id`
- `POST /presupuestos`
- `PUT /presupuestos/:id`
- `DELETE /presupuestos/:id`
- `POST /presupuestos/:id/convertir` → crea pedido desde presupuesto
- `GET /presupuestos/:id/pdf` → genera o retorna PDF

---

### 📦 Pedidos

- `GET /pedidos`
- `GET /pedidos/:id`
- `POST /pedidos`
- `PUT /pedidos/:id`
- `DELETE /pedidos/:id`
- `POST /pedidos/:id/pagar` → integra con MercadoPago
- `GET /pedidos/:id/pdf` → obtiene remito o presupuesto

---

### 📜 Remitos

- `GET /remitos`
- `GET /remitos/:id`
- `POST /remitos` → se genera automáticamente al entregar un pedido
- `GET /remitos/:id/pdf`
- `PUT /remitos/:id`
- `DELETE /remitos/:id`

---

### 🔔 Alertas

- `GET /alertas` → lista de alertas activas
- `POST /alertas/check` → verifica pedidos próximos a entrega

> Las alertas se calculan al consultar la API o al ingresar al panel admin, no mediante procesos automáticos externos.

---

## 6. Lógica de Negocio

### 📆 Fechas automáticas

- La **fecha de entrega** se calcula automáticamente en días hábiles (sin feriados iniciales).
- El **admin** puede editar la fecha.
- Se generan **alertas a los 5 y 2 días previos** a la fecha de entrega.

---

### 📤 PDFs

- Se generan para **presupuestos** y **remitos**.
- Incluyen datos legales de la empresa.
- Se almacenan en Google Cloud Storage.
- Se envían automáticamente al cliente por correo.

---

### 💳 Pagos

- Integración con **MercadoPago**.
- Estado del pago registrado en Supabase (`pendiente` / `pagado`).

---

### 🗑️ Eliminaciones

- Todas las tablas usan **soft-delete** (`deleted_at`).

---

## 7. Estructura de Carpetas

api-service/
├── src/
│ ├── routes/
│ │ ├── clientes.routes.js
│ │ ├── muebles.routes.js
│ │ ├── pedidos.routes.js
│ │ ├── presupuestos.routes.js
│ │ ├── remitos.routes.js
│ │ └── proveedores.routes.js
│ ├── controllers/
│ ├── services/
│ ├── middlewares/
│ ├── utils/
│ └── app.js
├── package.json
├── Dockerfile
└── README.md

---

## 8. Observaciones Finales

- La API debe ser **stateless**, segura y optimizada para consumo por los dos frontends.
- Las validaciones deben manejarse con `express-validator` o esquema propio.
- Se recomienda manejar todas las respuestas con un formato estándar `{ success, data, error }`.
- Los PDFs deben generarse con la plantilla base editable desde el panel admin.
- El control de stock y las alertas de entrega deben calcularse desde el backend en tiempo real.

# Documentación de Requisitos – API Service (Backend)

## Descripción General

El **API Service** es el backend principal del proyecto de venta de muebles.  
Administra la lógica de negocio y provee endpoints tanto para el **front e-commerce (clientes)** como para el **front admin (panel de gestión)**.  
Está construido en **Node.js con Express**, desplegado en **Google Cloud Run** y utiliza **Supabase** como base de datos y servicio de autenticación.

---

## Arquitectura General

- **Frontend E-commerce:** interfaz pública para clientes, consume endpoints de la API.
- **Frontend Admin:** panel de gestión interno, utiliza la misma API para administración.
- **API Service:** lógica central, maneja datos de clientes, pedidos, proveedores, presupuestos, remitos y alertas.

---

## Tecnologías

| Componente          | Tecnología / Servicio                                          |
| ------------------- | -------------------------------------------------------------- |
| Lenguaje            | Node.js                                                        |
| Framework HTTP      | Express                                                        |
| Base de Datos       | Supabase (PostgreSQL)                                          |
| Autenticación       | Supabase Auth                                                  |
| Archivos e Imágenes | Google Cloud Storage (Bucket)                                  |
| Despliegue          | Google Cloud Run                                               |
| Pagos               | MercadoPago                                                    |
| PDFs                | Generación en backend (con librería tipo `pdfkit` o `pdfmake`) |

---

## Entidades Principales

### 1. Clientes

- **Datos:** nombre, razón social, teléfono, email, dirección.
- **Relaciones:** pueden tener múltiples presupuestos, pedidos y remitos.
- **Requisitos:**
  - CRUD completo.
  - Exportación de datos a CSV o PDF desde el panel admin.
  - Campo “estado” (activo / inactivo) con **soft delete**.

---

### 2. Proveedores

- **Datos:** nombre, contacto, email, teléfono, dirección.
- **Requisitos:**
  - CRUD completo.
  - Soft delete.

---

### 3. Muebles

- **Datos:** nombre, descripción, categoría, precio fijo, stock, imágenes (en bucket).
- **Requisitos:**
  - CRUD completo desde el panel admin.
  - Carga y edición de imágenes (Google Cloud Storage).
  - Soft delete.
  - Stock mínimo definido (por ahora 5 unidades).

---

### 4. Presupuestos

- **Datos:** cliente, lista de muebles (cantidad y descripción), fecha de emisión, fecha de entrega, estado.
- **Requisitos:**
  - Generación de PDF con estructura estándar.
  - Envío automático del PDF al cliente por correo.
  - Fechas automáticas (emisión = actual, entrega = días hábiles).
  - Editable por el administrador.

---

### 5. Pedidos

- **Datos:** cliente, muebles, fechas (emisión, entrega), estado (pendiente, en curso, entregado).
- **Requisitos:**
  - Fechas automáticas (luego editables por admin).
  - Alerta interna cuando falten:
    - 5 días para entrega.
    - 2 días para entrega.
  - Estados visibles en pestañas: **Presupuesto**, **Orden de pedido**, **Pedido entregado**.

---

### 6. Remitos

- **Datos:** número, cliente, lista de muebles, fecha de emisión, firma o check por producto.
- **Requisitos:**
  - Generación automática al marcar un pedido como entregado.
  - Generación de PDF con plantilla editable (incluye datos legales).
  - Envío del PDF al cliente.
  - Asociado a pedido y cliente.
  - Soft delete.

---

### 7. Alertas y Fechas

- Las alertas se manejan **dentro de la API**, sin workers ni cron jobs.
- Al consultar pedidos, la API determina si corresponde emitir alertas por proximidad de entrega.
- Los días hábiles se calculan automáticamente (sin feriados en esta etapa).

---

## Endpoints Principales (borrador)

| Entidad      | Método                | Ruta                                 | Descripción |
| ------------ | --------------------- | ------------------------------------ | ----------- |
| Clientes     | GET /clientes         | Lista todos los clientes             |
| Clientes     | POST /clientes        | Crea un cliente                      |
| Clientes     | PUT /clientes/:id     | Edita un cliente                     |
| Clientes     | DELETE /clientes/:id  | Soft delete                          |
| Muebles      | GET /muebles          | Lista muebles                        |
| Muebles      | POST /muebles         | Crea mueble                          |
| Muebles      | PUT /muebles/:id      | Edita mueble                         |
| Muebles      | DELETE /muebles/:id   | Soft delete                          |
| Proveedores  | CRUD completo similar |
| Presupuestos | POST /presupuestos    | Crea presupuesto y genera PDF        |
| Pedidos      | GET /pedidos          | Lista pedidos con alertas calculadas |
| Pedidos      | POST /pedidos         | Crea pedido                          |
| Remitos      | POST /remitos         | Genera y envía PDF                   |
| Alertas      | GET /alertas          | Devuelve alertas activas (internas)  |

---

## PDFs

- Generación en backend (Express) para garantizar coherencia.
- Plantillas editables para **remitos** y **presupuestos**.
- Incluyen:
  - Datos legales.
  - Información del cliente y muebles.
  - Fechas y estado.
  - Campos de verificación (check por producto en remitos).

---

## Lógica de Negocio

1. **Creación de Presupuesto:**

   - Admin selecciona cliente y muebles.
   - API genera PDF y lo envía al cliente.

2. **Transformación en Pedido:**

   - Desde un presupuesto aprobado.
   - Se crean las fechas automáticas (emisión, entrega).
   - Se habilitan alertas de entrega.

3. **Generación de Remito:**

   - Automática al marcar pedido como entregado.
   - PDF enviado al cliente con datos legales y checks.

4. **Alertas Internas:**
   - Calculadas dinámicamente según fecha actual.

---

## Seguridad y Autenticación

- **Auth:** Supabase Auth (JWT).
- Roles:
  - `admin` → acceso completo.
  - `cliente` → acceso a pedidos y presupuestos propios.
- Validación de tokens en cada endpoint protegido.

---

## Consideraciones Finales

- **Soft Delete** en todas las entidades.
- **Fechas automáticas** basadas en días hábiles (sin feriados).
- **MercadoPago** será el único medio de pago por ahora.
- **Arquitectura escalable**, con endpoints diseñados para futura modularización.

---
