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

### Productos
(Completar con los endpoints de productos...)

### Usuarios
(Completar con los endpoints de usuarios...)

### Ventas
(Completar con los endpoints de ventas...)

### Inventario
(Completar con los endpoints de inventario...)

### Recetas
(Completar con los endpoints de recetas...)

### Caja
(Completar con los endpoints de caja...)

### Bitácora
(Completar con los endpoints de bitácora...)

---

> **Nota:** Para detalles de parámetros y ejemplos de request/response, consulta el código fuente o amplía esta documentación según las necesidades del proyecto. 