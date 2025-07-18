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

### Gastos

| Método | Ruta                                    | Descripción                                    |
|--------|-----------------------------------------|------------------------------------------------|
| GET    | /api/gastos                              | Obtener gastos con paginación y filtros       |
| GET    | /api/gastos/:id                          | Obtener detalles de un gasto específico       |
| POST   | /api/gastos                              | Crear nuevo gasto                              |
| PUT    | /api/gastos/:id                          | Actualizar gasto                               |
| DELETE | /api/gastos/:id                          | Eliminar gasto                                 |

#### Parámetros para GET /api/gastos

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Gastos por página (default: 9)
- `fechaInicio` (opcional): Fecha de inicio para filtrar (YYYY-MM-DD)
- `fechaFin` (opcional): Fecha de fin para filtrar (YYYY-MM-DD)
- `descripcion` (opcional): Buscar por descripción (LIKE)

#### Ejemplo de respuesta para GET /api/gastos

```json
{
  "gastos": [
    {
      "ID_Gasto": 1,
      "Fecha": "2024-01-15",
      "Descripcion": "Compra de leche",
      "Monto": "150.00",
      "Categoria": "Insumos",
      "Nombre_Usuario": "admin"
    },
    {
      "ID_Gasto": 2,
      "Fecha": "2024-01-15",
      "Descripcion": "Mantenimiento cafetera",
      "Monto": "75.50",
      "Categoria": "Mantenimiento",
      "Nombre_Usuario": "vendedor1"
    }
  ],
  "totalGastos": 25,
  "totalPages": 3,
  "currentPage": 1,
  "limit": 9
}
```

#### Ejemplo de request para POST /api/gastos

```json
{
  "Fecha": "2024-01-15",
  "Descripcion": "Compra de insumos",
  "Monto": "150.00",
  "Categoria": "Insumos"
}
```

#### Ejemplo de response para POST /api/gastos

```json
{
  "message": "Gasto creado exitosamente",
  "id": 3
}
```

#### Ejemplo de request para PUT /api/gastos/1

```json
{
  "Fecha": "2024-01-15",
  "Descripcion": "Compra de leche actualizada",
  "Monto": "160.00",
  "Categoria": "Insumos"
}
```

#### Ejemplo de request para GET /api/gastos con filtros

```
GET /api/gastos?page=1&limit=9&fechaInicio=2024-01-01&fechaFin=2024-01-31&descripcion=leche
```

---

### Bitácora

| Método | Ruta                | Descripción                                 |
|--------|---------------------|---------------------------------------------|
| GET    | /api/bitacora       | Obtener registros con filtros y paginación  |

#### Parámetros para GET /api/bitacora

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 11)
- `usuario` (opcional): Nombre de usuario (LIKE) o ID exacto
- `operacion` (opcional): Tipo de operación (LIKE, ej. "INSERT", "UPDATE", "DELETE")
- `descripcion` (opcional): Buscar en la descripción (LIKE)
- `fechaInicio` (opcional): Fecha mínima (YYYY-MM-DD)
- `fechaFin` (opcional): Fecha máxima (YYYY-MM-DD)

#### Ejemplo de request para GET /api/bitacora

```
GET /api/bitacora?page=2&limit=11&usuario=admin&operacion=UPDATE&fechaInicio=2024-05-01&fechaFin=2024-05-31
```

#### Ejemplo de respuesta para GET /api/bitacora

```json
{
  "registros": [
    {
      "ID_Bitacora": 1,
      "Tabla_Modificada": "usuarios",
      "Operacion": "INSERT",
      "ID_Usuario": 2,
      "Usuario": "admin",
      "Fecha": "2024-05-15T10:23:00.000Z",
      "Descripcion": "Se agregó un nuevo usuario."
    },
    ...
  ],
  "totalRegistros": 42,
  "totalPages": 4,
  "currentPage": 2,
  "limit": 11
}
```

> El endpoint permite combinar cualquier filtro y siempre devuelve la paginación y el total de registros filtrados.

---

### Usuarios

| Método | Ruta                                    | Descripción                                    |
|--------|-----------------------------------------|------------------------------------------------|
| GET    | /api/usuarios                           | Obtener usuarios con filtros y paginación      |
| GET    | /api/usuarios/:id                       | Obtener detalles de un usuario específico      |
| POST   | /api/usuarios                           | Crear nuevo usuario                            |
| PUT    | /api/usuarios/:id                       | Actualizar usuario                             |
| DELETE | /api/usuarios/:id                       | Eliminar usuario                               |
| POST   | /api/usuarios/login                     | Iniciar sesión                                 |

#### Parámetros para GET /api/usuarios

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Usuarios por página (default: 9)
- `nombre` (opcional): Buscar por nombre (LIKE)
- `apellido` (opcional): Buscar por apellido (LIKE)
- `rol` (opcional): Filtrar por ID de rol (1=Administrador, 2=Cajero, 3=Mesero)
- `estado` (opcional): Filtrar por estado (Activo, Inactivo)

#### Ejemplo de respuesta para GET /api/usuarios

```json
{
  "usuarios": [
    {
      "ID_Usuario": 1,
      "Nombre": "Ana",
      "Apellido": "Rivas",
      "Usuario": "ARivas",
      "ID_Rol": 1,
      "Estado": "Activo",
      "Rol_Nombre": "Administrador"
    },
    {
      "ID_Usuario": 2,
      "Nombre": "Juan",
      "Apellido": "Pérez",
      "Usuario": "JPérez",
      "ID_Rol": 2,
      "Estado": "Activo",
      "Rol_Nombre": "Cajero"
    }
  ],
  "totalRegistros": 8,
  "totalPages": 1,
  "currentPage": 1,
  "limit": 9
}
```

#### Ejemplo de request para POST /api/usuarios

```json
{
  "Nombre": "Nuevo Usuario",
  "Apellido": "Apellido",
  "Contraseña": "password123",
  "ID_Rol": 2,
  "Estado": "Activo"
}
```

#### Ejemplo de response para POST /api/usuarios

```json
{
  "id": 19,
  "message": "Usuario creado exitosamente"
}
```

#### Ejemplo de request para PUT /api/usuarios/1

```json
{
  "Nombre": "Ana Actualizada",
  "Apellido": "Rivas",
  "ID_Rol": 1,
  "Estado": "Activo"
}
```

#### Ejemplo de request para POST /api/usuarios/login

```json
{
  "usuario": "ARivas",
  "contraseña": "password123"
}
```

#### Ejemplo de response para POST /api/usuarios/login

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "usuario": "ARivas",
    "nombre": "Ana",
    "apellido": "Rivas",
    "rol": "Administrador",
    "estado": "Activo"
  }
}
```

#### Ejemplo de request para GET /api/usuarios con filtros

```
GET /api/usuarios?page=1&limit=9&nombre=Ana&estado=Activo&rol=1
```

---

### Productos
(Completar con los endpoints de productos...)

### Inventario
(Completar con los endpoints de inventario...)

### Caja
(Completar con los endpoints de caja...)

### Bitácora
(Completar con los endpoints de bitácora...)

---

### Reportes

| Método | Ruta                                         | Descripción                                      |
|--------|----------------------------------------------|--------------------------------------------------|
| POST   | /api/reportes                               | Generar un nuevo reporte                         |
| GET    | /api/reportes                               | Listar reportes generados (paginación/filtros)   |
| GET    | /api/reportes/:id                           | Obtener encabezado/detalle de un reporte         |
| GET    | /api/reportes/:id/ventas                    | Ventas incluidas en el reporte                   |
| GET    | /api/reportes/:id/gastos                    | Gastos incluidos en el reporte                   |
| GET    | /api/reportes/:id/producto-mas-vendido      | Producto más vendido en el periodo del reporte   |
| GET    | /api/reportes/:id/dia-mas-ventas            | Día con más ventas en el periodo del reporte     |
| GET    | /api/reportes/:id/exportar/pdf              | Exportar reporte a PDF                           |
| GET    | /api/reportes/:id/exportar/excel            | Exportar reporte a Excel                         |

> Todos los endpoints requieren autenticación JWT.

#### Ejemplo de request para POST /api/reportes

```json
{
  "tipo": "Diario",
  "fecha_inicio": "2025-03-21",
  "fecha_fin": "2025-03-22"
}
```

#### Ejemplo de response para POST /api/reportes

```json
{
  "message": "Reporte generado exitosamente",
  "reporte": {
    "ID_Reporte": 1,
    "Tipo": "Diario",
    "Fecha_Inicio": "2025-03-21",
    "Fecha_Fin": "2025-03-22",
    "Total_Gastos": "500.00",
    "Total_Ventas": "2000.00",
    "Ganancia": "1500.00"
  }
}
```

#### Ejemplo de request para GET /api/reportes

```
GET /api/reportes?page=1&limit=10&tipo=Diario&fechaInicio=2025-03-01&fechaFin=2025-03-31
```

#### Ejemplo de response para GET /api/reportes

```json
{
  "reportes": [
    {
      "ID_Reporte": 1,
      "Tipo": "Diario",
      "Fecha_Inicio": "2025-03-21",
      "Fecha_Fin": "2025-03-22",
      "Total_Gastos": "500.00",
      "Total_Ventas": "2000.00",
      "Ganancia": "1500.00"
    }
  ],
  "totalRegistros": 1,
  "totalPages": 1,
  "currentPage": 1,
  "limit": 10
}
```

#### Ejemplo de response para GET /api/reportes/1

```json
{
  "reporte": {
    "ID_Reporte": 1,
    "Tipo": "Diario",
    "Fecha_Inicio": "2025-03-21",
    "Fecha_Fin": "2025-03-22",
    "Total_Gastos": "500.00",
    "Total_Ventas": "2000.00",
    "Ganancia": "1500.00"
  }
}
```

#### Ejemplo de response para GET /api/reportes/1/ventas

```json
{
  "ventas": [
    {
      "ID_Venta": 1,
      "Fecha": "2025-03-21",
      "Total": "1000.00",
      "Metodo_Pago": "Efectivo",
      "Usuario": "admin"
    }
  ]
}
```

#### Ejemplo de response para GET /api/reportes/1/gastos

```json
{
  "gastos": [
    {
      "ID_Gasto": 1,
      "Descripcion": "Renta",
      "Monto": "500.00",
      "Fecha": "2025-03-21",
      "Usuario": "admin"
    }
  ]
}
```

#### Ejemplo de response para GET /api/reportes/1/producto-mas-vendido

```json
{
  "producto": "Latte",
  "TotalVendido": 10
}
```

#### Ejemplo de response para GET /api/reportes/1/dia-mas-ventas

```json
{
  "fecha": "2025-03-21",
  "TotalDia": "2000.00"
}
```

#### Ejemplo de request para GET /api/reportes/1/exportar/pdf

```
GET /api/reportes/1/exportar/pdf
```

> **Response:** Archivo PDF descargable con formato profesional que incluye:
> - Logo del café en el encabezado
> - Información del reporte (tipo, fechas, totales)
> - Tabla de ventas con detalles completos
> - Tabla de gastos con detalles completos
> - Estadísticas (producto más vendido, día con más ventas)
> - Fecha de generación del reporte

#### Ejemplo de request para GET /api/reportes/1/exportar/excel

```
GET /api/reportes/1/exportar/excel
```

> **Response:** Archivo Excel (.xlsx) descargable con formato profesional que incluye:
> - Hoja "Resumen" con información general del reporte
> - Hoja "Ventas" con tabla detallada de ventas
> - Hoja "Gastos" con tabla detallada de gastos
> - Formato de moneda y fechas aplicado automáticamente
> - Estilos profesionales con colores temáticos

---

> **Nota:** Para detalles de parámetros y ejemplos de request/response, consulta el código fuente o amplía esta documentación según las necesidades del proyecto. 