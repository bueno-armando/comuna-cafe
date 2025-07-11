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

### Productos
(Completar con los endpoints de productos...)

### Usuarios
(Completar con los endpoints de usuarios...)

### Ventas
(Completar con los endpoints de ventas...)

### Inventario
(Completar con los endpoints de inventario...)

### Caja
(Completar con los endpoints de caja...)

### Bitácora
(Completar con los endpoints de bitácora...)

---

> **Nota:** Para detalles de parámetros y ejemplos de request/response, consulta el código fuente o amplía esta documentación según las necesidades del proyecto. 