# Documentación de Endpoints para Frontend - Tienda Web

## 1. Información General

-   **URL Base:** La URL raíz de la API (ej: `https://api.tu-dominio.com`).
-   **Formato de Datos:** Todas las peticiones y respuestas usan `JSON`.
-   **Autenticación:** Los endpoints que requieren autenticación esperan un `Bearer Token` en la cabecera `Authorization`.
    ```
    Authorization: Bearer <TU_JWT_DE_SUPABASE>
    ```
-   **Formato de Respuesta Estándar:**
    ```json
    {
      "success": true, // o false si hay un error
      "data": { ... }, // Datos de la respuesta
      "error": "Mensaje de error" // Solo si success es false
    }
    ```

---

## 2. Autenticación (`/auth`)

### Iniciar Sesión

-   **Endpoint:** `POST /auth/login`
-   **Descripción:** Autentica a un usuario y devuelve un token de sesión.
-   **Autenticación:** Pública.
-   **Body (Request):**
    ```json
    {
      "email": "cliente@example.com",
      "password": "password123"
    }
    ```
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "...",
          "email": "cliente@example.com",
          "app_metadata": {
            "role": "cliente"
          }
        },
        "session": {
          "access_token": "ey...",
          "token_type": "bearer",
          "expires_in": 3600
        }
      }
    }
    ```

### Cerrar Sesión

-   **Endpoint:** `POST /auth/logout`
-   **Descripción:** Invalida el token de sesión del usuario.
-   **Autenticación:** Requerida (Bearer Token).
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
        "success": true,
        "data": {
            "message": "Logged out successfully"
        }
    }
    ```

### Obtener Perfil

-   **Endpoint:** `GET /auth/profile`
-   **Descripción:** Devuelve los datos del usuario autenticado.
-   **Autenticación:** Requerida (Bearer Token).
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
        "success": true,
        "data": {
            "id": "...",
            "email": "cliente@example.com",
            "app_metadata": {
                "role": "cliente"
            }
        }
    }
    ```

---

## 3. Clientes (`/clientes`)

### Registro de Nuevo Cliente

-   **Endpoint:** `POST /clientes`
-   **Descripción:** Crea un nuevo registro de cliente. Se debe usar después de que el usuario se haya registrado en Supabase Auth para almacenar sus datos adicionales.
-   **Autenticación:** Pública (o puede requerir token de registro si se implementa).
-   **Body (Request):**
    ```json
    {
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "telefono": "1122334455",
      "direccion": "Calle Falsa 123"
    }
    ```
-   **Respuesta Exitosa (201 Created):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid-del-nuevo-cliente",
          "nombre": "Juan Pérez",
          "email": "juan.perez@example.com",
          // ...otros campos
        }
      ]
    }
    ```

---

## 4. Muebles (Catálogo) (`/muebles`)

### Listar todos los Muebles

-   **Endpoint:** `GET /muebles?page=1&limit=10`
-   **Descripción:** Obtiene la lista de todos los muebles disponibles para la venta de forma paginada.
-   **Query Params (Opcionales):**
    -   `page`: Número de página a obtener (por defecto: 1).
    -   `limit`: Cantidad de resultados por página (por defecto: 10).
-   **Autenticación:** Pública.
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid-del-mueble",
          "nombre": "Silla de Roble",
          "descripcion": "Una silla robusta y elegante.",
          "precio": 150.00,
          "categoria": "Sillas",
          "stock": 25,
          "imagen_url": "https://storage.googleapis.com/..."
        }
      ]
    }
    ```

### Obtener un Mueble por ID

-   **Endpoint:** `GET /muebles/:id`
-   **Descripción:** Obtiene los detalles de un mueble específico.
-   **Autenticación:** Pública.
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid-del-mueble",
        "nombre": "Silla de Roble",
        // ...otros campos
      }
    }
    ```

---

## 5. Presupuestos (`/presupuestos`)

### Crear un Presupuesto

-   **Endpoint:** `POST /presupuestos`
-   **Descripción:** Crea un nuevo presupuesto para el cliente autenticado.
-   **Autenticación:** Requerida (Bearer Token).
-   **Body (Request):**
    ```json
    {
      "cliente_id": "uuid-del-cliente-logueado",
      "fecha_entrega": "2025-12-20T00:00:00.000Z",
      "items": [
        {
          "mueble_id": "uuid-del-mueble-1",
          "cantidad": 2,
          "descripcion": "Tapizado en color azul."
        },
        {
          "mueble_id": "uuid-del-mueble-2",
          "cantidad": 1
        }
      ]
    }
    ```
-   **Respuesta Exitosa (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid-del-nuevo-presupuesto",
        "cliente_id": "...",
        "total": 450.00,
        "items": [ ... ]
      }
    }
    ```

### Obtener un Presupuesto por ID

-   **Endpoint:** `GET /presupuestos/:id`
-   **Descripción:** Obtiene los detalles de un presupuesto. **Requiere lógica adicional para verificar que el usuario es el propietario.**
-   **Autenticación:** Requerida (Bearer Token).

### Descargar PDF del Presupuesto

-   **Endpoint:** `GET /presupuestos/:id/pdf`
-   **Descripción:** Descarga el presupuesto en formato PDF. **Requiere lógica adicional para verificar que el usuario es el propietario.**
-   **Autenticación:** Requerida (Bearer Token).

---

## 6. Pedidos (`/pedidos`)

### Listar mis Pedidos

-   **Endpoint:** `GET /pedidos/me`
-   **Descripción:** Obtiene una lista de todos los pedidos realizados por el usuario autenticado.
-   **Autenticación:** Requerida (Bearer Token).
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid-del-pedido-1",
          "cliente_id": "uuid-del-cliente-logueado",
          "estado": "orden",
          "pago_estado": "pendiente",
          "fecha_emision": "...",
          "fecha_entrega": "..."
        }
      ]
    }
    ```

### Obtener un Pedido por ID

-   **Endpoint:** `GET /pedidos/:id`
-   **Descripción:** Obtiene el estado y los detalles de un pedido. **Requiere lógica adicional para verificar que el usuario es el propietario.**
-   **Autenticación:** Requerida (Bearer Token).

### Pagar un Pedido

-   **Endpoint:** `POST /pedidos/:id/pagar`
-   **Descripción:** Inicia el proceso de pago para un pedido y devuelve la URL de checkout de MercadoPago.
-   **Autenticación:** Requerida (Bearer Token).
-   **Respuesta Exitosa (200 OK):**
    ```json
    {
        "success": true,
        "data": {
            "payment_url": "https://www.mercadopago.com.ar/checkout/..."
        }
    }
    ```

### Descargar PDF del Pedido

-   **Endpoint:** `GET /pedidos/:id/pdf`
-   **Descripción:** Descarga un resumen del pedido en formato PDF. **Requiere lógica adicional para verificar que el usuario es el propietario.**
-   **Autenticación:** Requerida (Bearer Token).