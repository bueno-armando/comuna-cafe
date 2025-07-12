# Documentación de la API - Comuna Café

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. Incluye el header:

```
Authorization: Bearer <token>
```

---

## Endpoints principales

### Insumos

| Método | Ruta                        | Descripción                        |
|--------|-----------------------------|------------------------------------|
| GET    | /api/insumos                | Obtener todos los insumos          |
| GET    | /api/insumos/:id            | Obtener insumo por ID              |
| GET    | /api/insumos/buscar?nombre= | Buscar insumos por nombre          |
| GET    | /api/insumos/proveedores    | Listar proveedores                 |
| GET    | /api/insumos/proveedores/completos | Listar proveedores con información completa |
| GET    | /api/insumos/proveedores/:id | Obtener proveedor por ID           |
| GET    | /api/insumos/proveedor/:id  | Insumos de un proveedor            |
| POST   | /api/insumos                | Crear nuevo insumo                 |
| POST   | /api/insumos/proveedores    | Crear nuevo proveedor              |
| PUT    | /api/insumos/:id            | Actualizar insumo                  |
| PUT    | /api/insumos/proveedores/:id | Actualizar proveedor               |
| DELETE | /api/insumos/:id            | Eliminar insumo                    |
| DELETE | /api/insumos/proveedores/:id | Eliminar proveedor                 |

#### Ejemplo de respuesta para GET /api/insumos

```json
[
  {
    "ID_Insumo": 1,
    "Nombre": "Leche",
    "ID_Proveedor": 2,
    "Costo": "14.00",
    "Unidad": "ml",
    "Proveedor_Nombre": "Lala"
  },
  {
    "ID_Insumo": 2,
    "Nombre": "Azúcar",
    "ID_Proveedor": 1,
    "Costo": "12.00",
    "Unidad": "g",
    "Proveedor_Nombre": "Bimbo"
  }
]
```

#### Ejemplo de respuesta para GET /api/insumos/proveedores/completos

```json
[
  {
    "ID_Proveedor": 1,
    "Nombre": "Bimbo",
    "Telefono": "6149871234",
    "Direccion": "Calle Las Industrias 123"
  },
  {
    "ID_Proveedor": 2,
    "Nombre": "Lala",
    "Telefono": "6145551234",
    "Direccion": "Av. Principal 456"
  }
]
```

#### Ejemplo de request para POST /api/insumos/proveedores

```json
{
  "Nombre": "Nuevo Proveedor",
  "Telefono": "6141234567",
  "Direccion": "Calle Nueva 789"
}
```

#### Ejemplo de response para POST /api/insumos/proveedores

```json
{
  "message": "Proveedor creado exitosamente",
  "id": 3
}
```

---

### Recetas

| Método | Ruta                                    | Descripción                                    |
|--------|-----------------------------------------|------------------------------------------------|
| GET    | /api/recetas/productos/todos            | Obtener todos los productos para búsqueda      |
| GET    | /api/recetas/producto/:id               | Obtener recetas de un producto específico      |
| POST   | /api/recetas                            | Crear nueva receta                             |
| PUT    | /api/recetas/:productoId/:insumoId     | Actualizar cantidad de ingrediente             |
| DELETE | /api/recetas/:productoId/:insumoId     | Eliminar ingrediente de receta                 |

#### Ejemplo de respuesta para GET /api/recetas/productos/todos

```json
[
  {
    "ID_Producto": 1,
    "Nombre": "Latte",
    "Categoria": "Bebidas"
  },
  {
    "ID_Producto": 2,
    "Nombre": "Cappuccino",
    "Categoria": "Bebidas"
  }
]
```

#### Ejemplo de respuesta para GET /api/recetas/producto/1

```json
[
  {
    "ID_Producto": 1,
    "ID_Insumo": 1,
    "Insumo": "Leche",
    "Cantidad_Necesaria": "200.00",
    "Unidad": "ml"
  },
  {
    "ID_Producto": 1,
    "ID_Insumo": 2,
    "Insumo": "Café",
    "Cantidad_Necesaria": "30.00",
    "Unidad": "ml"
  }
]
```

#### Ejemplo de request para POST /api/recetas

```json
{
  "ID_Producto": 1,
  "ID_Insumo": 1,
  "Cantidad_Necesaria": "200.00",
  "Unidad": "ml"
}
```

#### Ejemplo de request para PUT /api/recetas/1/1

```json
{
  "Cantidad_Necesaria": "250.00",
  "Unidad": "ml"
}
```

---

### Ventas

| Método | Ruta                                    | Descripción                                    |
|--------|-----------------------------------------|------------------------------------------------|
| GET    | /api/ventas                             | Obtener ventas con paginación y filtros       |
| GET    | /api/ventas/:id                         | Obtener detalles de una venta específica      |
| GET    | /api/ventas/exportar/pdf                | Exportar ventas a PDF (pendiente)             |
| GET    | /api/ventas/exportar/excel              | Exportar ventas a Excel (pendiente)           |

#### Parámetros para GET /api/ventas

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Ventas por página (default: 9)
- `fechaInicio` (opcional): Fecha de inicio para filtrar (YYYY-MM-DD)
- `fechaFin` (opcional): Fecha de fin para filtrar (YYYY-MM-DD)

#### Ejemplo de respuesta para GET /api/ventas

```json
{
  "ventas": [
    {
      "ID_Venta": 1,
      "Fecha": "2024-01-15",
      "Total": "150.00",
      "Metodo_Pago": "Efectivo",
      "Nombre_Usuario": "admin"
    },
    {
      "ID_Venta": 2,
      "Fecha": "2024-01-15",
      "Total": "75.50",
      "Metodo_Pago": "Tarjeta",
      "Nombre_Usuario": "vendedor1"
    }
  ],
  "totalVentas": 25,
  "totalPages": 3,
  "currentPage": 1,
  "limit": 9
}
```

#### Ejemplo de respuesta para GET /api/ventas/1

```json
{
  "venta": {
    "ID_Venta": 1,
    "Fecha": "2024-01-15",
    "Total": "150.00",
    "Metodo_Pago": "Efectivo",
    "Nombre_Usuario": "admin"
  },
  "detalles": [
    {
      "Producto": "Latte",
      "Cantidad": 2,
      "Subtotal": "90.00",
      "Precio_Unitario": "45.00"
    },
    {
      "Producto": "Cappuccino",
      "Cantidad": 1,
      "Subtotal": "60.00",
      "Precio_Unitario": "60.00"
    }
  ]
}
```

#### Ejemplo de request para GET /api/ventas con filtros

```
GET /api/ventas?page=1&limit=9&fechaInicio=2024-01-01&fechaFin=2024-01-31
```

---

### Productos
(Completar con los endpoints de productos...)

### Usuarios
(Completar con los endpoints de usuarios...)

### Inventario
(Completar con los endpoints de inventario...)

### Caja
(Completar con los endpoints de caja...)

### Bitácora
(Completar con los endpoints de bitácora...)

---

> **Nota:** Para detalles de parámetros y ejemplos de request/response, consulta el código fuente o amplía esta documentación según las necesidades del proyecto. 