# Documentación de Endpoints para Frontend - Panel de Administración

## 1. Información General

-   **URL Base:** La URL raíz de la API (ej: `https://api.tu-dominio.com`).
-   **Formato de Datos:** Todas las peticiones y respuestas usan `JSON`.
-   **Autenticación:** Todos los endpoints de este panel requieren un `Bearer Token` con rol de `admin` en la cabecera `Authorization`.
    ```
    Authorization: Bearer <TU_JWT_DE_ADMIN>
    ```
-   **Formato de Respuesta Estándar:**
    ```json
    {
      "success": true,
      "data": { ... },
      "error": "Mensaje de error"
    }
    ```

---

## 2. Autenticación (`/auth`)

*(Los endpoints de `login`, `logout` y `profile` son los mismos que para la tienda web, pero se debe usar una cuenta con rol de `admin`)*.

---

## 3. Clientes (`/clientes`)

-   **`GET /clientes`**: Lista todos los clientes activos.
-   **`GET /clientes/export`**: Descarga un archivo `clientes.csv` con todos los datos.
-   **`GET /clientes/:id`**: Obtiene un cliente específico.
-   **`POST /clientes`**: Crea un nuevo cliente.
    -   **Body:** `{ "nombre": "...", "email": "...", "telefono": "...", "direccion": "..." }`
-   **`PUT /clientes/:id`**: Actualiza un cliente.
    -   **Body:** `{ "nombre": "(opcional)", "email": "(opcional)", ... }`
-   **`DELETE /clientes/:id`**: Desactiva un cliente (soft delete).

---

## 4. Muebles (`/muebles`)

-   **`GET /muebles?page=1&limit=10`**: Lista los muebles de forma paginada.
-   **`GET /muebles/:id`**: Obtiene un mueble específico.
-   **`POST /muebles`**: Crea un nuevo mueble.
    -   **Body:** `{ "nombre": "...", "descripcion": "...", "precio": 100.0, "categoria": "...", "stock": 50 }`
-   **`PUT /muebles/:id`**: Actualiza un mueble.
    -   **Body:** `{ "nombre": "(opcional)", "precio": "(opcional)", ... }`
-   **`DELETE /muebles/:id`**: Desactiva un mueble (soft delete).
-   **`PATCH /muebles/:id/stock`**: Actualiza únicamente el stock de un mueble.
    -   **Body:** `{ "stock": 75 }`

---

## 5. Proveedores (`/proveedores`)

-   **`GET /proveedores`**: Lista todos los proveedores.
-   **`POST /proveedores`**: Crea un nuevo proveedor.
    -   **Body:** `{ "nombre": "...", "contacto": "...", "telefono": "...", "correo": "...", "direccion": "..." }`
-   **`PUT /proveedores/:id`**: Actualiza un proveedor.
-   **`DELETE /proveedores/:id`**: Desactiva un proveedor (soft delete).

---

## 6. Presupuestos (`/presupuestos`)

-   **`GET /presupuestos`**: Lista todos los presupuestos.
-   **`GET /presupuestos/:id`**: Obtiene un presupuesto específico con sus ítems.
-   **`POST /presupuestos`**: Crea un nuevo presupuesto.
    -   **Body:** `{ "cliente_id": "...", "fecha_entrega": "...", "items": [{ "mueble_id": "...", "cantidad": 1, "descripcion": "..." }] }`
-   **`PUT /presupuestos/:id`**: Actualiza un presupuesto (estado, ítems, etc.).
-   **`DELETE /presupuestos/:id`**: Desactiva un presupuesto (soft delete).
-   **`POST /presupuestos/:id/convertir`**: Convierte un presupuesto en un pedido. Devuelve el nuevo pedido creado.
-   **`GET /presupuestos/:id/pdf`**: Descarga el PDF de un presupuesto.

---

## 7. Pedidos (`/pedidos`)

-   **`GET /pedidos`**: Lista todos los pedidos.
-   **`GET /pedidos/:id`**: Obtiene un pedido específico.
-   **`POST /pedidos`**: Crea un nuevo pedido manualmente.
    -   **Body:** `{ "cliente_id": "...", "fecha_entrega": "...", "estado": "orden", "pago_estado": "pendiente", ... }`
-   **`PUT /pedidos/:id`**: Actualiza un pedido (ej: cambiar estado a "entregado").
-   **`DELETE /pedidos/:id`**: Desactiva un pedido (soft delete).
-   **`POST /pedidos/:id/pagar`**: Genera un link de pago de MercadoPago para un pedido.
-   **`GET /pedidos/:id/pdf`**: Descarga un resumen del pedido en PDF.

---

## 8. Remitos (`/remitos`)

-   **`GET /remitos`**: Lista todos los remitos.
-   **`GET /remitos/:id`**: Obtiene un remito específico.
-   **`POST /remitos`**: Crea un remito manualmente (normalmente es automático).
    -   **Body:** `{ "pedido_id": "..." }`
-   **`PUT /remitos/:id`**: Actualiza un remito.
-   **`DELETE /remitos/:id`**: Desactiva un remito (soft delete).
-   **`GET /remitos/:id/pdf`**: Descarga el PDF de un remito.

---

## 9. Alertas (`/alertas`)

-   **`GET /alertas`**: Lista todas las alertas activas.
-   **`POST /alertas/check`**: Fuerza la verificación de pedidos y la creación de nuevas alertas. Devuelve las alertas que se crearon.

---

## 10. Estadísticas (`/statistics`)

### Obtener Estadísticas del Dashboard

-   **Endpoint:** `GET /statistics/dashboard`
-   **Descripción:** Obtiene un resumen de estadísticas clave para el panel de administración.
-   **Autenticación:** Requerida (Admin Role).
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "totalIngresos": 15200.50,
        "pedidosEsteMes": 25,
        "clientesNuevosEsteMes": 12,
        "productosBajoStock": [
          {
            "nombre": "Mesa de Pino",
            "stock": 4
          },
          {
            "nombre": "Silla de Comedor",
            "stock": 8
          }
        ]
      }
    }
    ```