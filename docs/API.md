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
| GET    | /api/insumos/proveedor/:id  | Insumos de un proveedor            |
| POST   | /api/insumos                | Crear nuevo insumo                 |
| PUT    | /api/insumos/:id            | Actualizar insumo                  |
| DELETE | /api/insumos/:id            | Eliminar insumo                    |

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