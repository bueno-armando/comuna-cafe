# Resumen de Contexto - Comuna Café

## Estructura del Proyecto

- **backend/**: Node.js/Express, API REST, conexión a MySQL/MariaDB
  - `src/routes/insumosRoutes.js`: rutas de insumos (`/api/insumos`, `/api/insumos/proveedores`, etc.)
  - `src/controllers/insumos.controller.js`: lógica de insumos
  - `src/models/insumos.model.js`: consultas SQL para insumos y proveedores
  - `src/routes/recetasRoutes.js`: rutas de recetas (`/api/recetas`, `/api/recetas/productos/todos`, etc.)
  - `src/controllers/recetas.controller.js`: lógica de recetas
- **frontend/**: HTML + JS vanilla
  - `Insumos.html`: vista de gestión de insumos
  - `js/insumos.js`: lógica de frontend para insumos
  - `Recetas.html`: vista de gestión de recetas
  - `js/recetas.js`: lógica de frontend para recetas
- **docs/**: documentación y especificaciones

## Tablas principales (DB)

### Tabla `insumos`
| Campo        | Tipo                                      | Notas                |
|--------------|-------------------------------------------|----------------------|
| ID_Insumo    | int(11), PK, auto_increment               |                      |
| Nombre       | varchar(100), NOT NULL                    |                      |
| ID_Proveedor | int(11), FK a proveedores, NOT NULL       |                      |
| Costo        | decimal(10,2), NOT NULL                   | Usar punto decimal   |
| Unidad       | enum('ml','g','Pza','cc','oz','tsp','tbsp') | NOT NULL           |

### Tabla `recetas`
| Campo              | Tipo                | Notas                                    |
|--------------------|---------------------|------------------------------------------|
| ID_Producto        | int(11), PK, FK     | Referencia a productos                   |
| ID_Insumo          | int(11), PK, FK     | Referencia a insumos                     |
| Cantidad_Necesaria | decimal(10,2)       | Cantidad requerida del insumo            |
| Unidad             | varchar(10)         | Unidad de medida (ml, g, Pza, etc.)     |

## Endpoints clave (API)

### Insumos
- `GET /api/insumos` — lista insumos, acepta filtro `?nombre=`
- `POST /api/insumos` — crear insumo (campos: Nombre, Unidad, Costo, ID_Proveedor)
- `GET /api/insumos/proveedores` — lista proveedores (ID_Proveedor, Nombre)
- `GET /api/insumos/proveedores/completos` — lista proveedores con información completa
- `POST /api/insumos/proveedores` — crear proveedor (campos: Nombre, Telefono, Direccion)
- `PUT /api/insumos/proveedores/:id` — actualizar proveedor
- `DELETE /api/insumos/proveedores/:id` — eliminar proveedor (bloquea si tiene insumos)

### Recetas
- `GET /api/recetas/productos/todos` — lista todos los productos para búsqueda
- `GET /api/recetas/producto/:id` — obtener recetas de un producto específico
- `POST /api/recetas` — crear nueva receta (ID_Producto, ID_Insumo, Cantidad_Necesaria, Unidad)
- `PUT /api/recetas/:productoId/:insumoId` — actualizar cantidad de ingrediente
- `DELETE /api/recetas/:productoId/:insumoId` — eliminar ingrediente de receta

## Decisiones de UX y validación

### Insumos
- El campo **Costo** en formularios:
  - ✅ Usa `type="text"` para evitar formateo regional del navegador
  - ✅ Solo acepta números y punto decimal
  - ✅ step="0.01", min="0", requerido
  - ✅ Muestra símbolo `$` y `MXN` en el input
  - ✅ Formateo automático a 2 decimales al salir del campo
- ✅ El select de proveedor se llena dinámicamente desde la API
- ✅ La búsqueda de insumos es por nombre y usa el endpoint principal con query param
- ✅ Modales con diseño Bootstrap consistente (cards, iconos, colores)
- ✅ Validación de eliminación de proveedores con insumos asociados
- ✅ Sincronización automática entre proveedores e insumos

### Recetas
- ✅ **Vista inicial informativa**: Grid de productos con conteo de ingredientes
- ✅ **Navegación intuitiva**: Breadcrumb + botón "Volver a Productos"
- ✅ **Botones de incremento/decremento**: Para cantidades con formato decimal
- ✅ **Formato decimal consistente**: Punto decimal, paso de 1.00
- ✅ **UX profesional**: Nunca muestra página vacía, siempre hay contenido útil
- ✅ **Jerarquía visual**: Nombres de productos prominentes, botones secundarios
- ✅ **Búsqueda de productos**: Con resultados en dropdown
- ✅ **Modales consistentes**: Con íconos Bootstrap y colores unificados

## Estado actual de los módulos

### ✅ **Módulo de Insumos - COMPLETADO**
- **CRUD completo de insumos**: Crear, leer, actualizar, eliminar
- **CRUD completo de proveedores**: Crear, leer, actualizar, eliminar
- **Panel de proveedores**: Modal con formulario y tabla
- **Búsqueda de insumos**: Por nombre en tiempo real
- **Validaciones**: Campos requeridos, formato de costo, bloqueo de eliminación
- **UX mejorada**: Modales con diseño consistente, iconos, feedback visual
- **Formateo de decimales**: Punto decimal forzado, sin conflictos de locale

### ✅ **Módulo de Recetas - COMPLETADO**
- **Vista inicial informativa**: Grid de productos con conteo de ingredientes
- **CRUD completo de recetas**: Crear, leer, actualizar, eliminar ingredientes
- **Navegación intuitiva**: Breadcrumb + botón "Volver a Productos"
- **Botones de incremento/decremento**: Para cantidades con formato decimal
- **Búsqueda de productos**: Con resultados en dropdown
- **Modales consistentes**: Con íconos Bootstrap y colores unificados
- **UX profesional**: Nunca muestra página vacía, siempre hay contenido útil

### 🔧 **Detalles técnicos importantes:**

#### Insumos
- **Campo costo**: `type="text"` para evitar formateo regional
- **Eventos JS**: Solo `blur` para formateo, sin interferencias
- **Proveedores**: Carga en ambos modales (agregar/editar)
- **Modal de editar**: Selección automática del proveedor actual
- **Eliminación**: Cierre automático del modal después de eliminar

#### Recetas
- **Vista dual**: Grid de productos + vista específica de receta
- **Conteo dinámico**: Ingredientes por producto cargado desde API
- **Formato decimal**: Punto decimal, paso de 1.00, botones +/- 1
- **Navegación**: Breadcrumb y botón volver para contexto
- **Jerarquía visual**: Nombres prominentes, botones secundarios

## Puntos pendientes o a revisar

### Insumos
- ✅ Panel de proveedores funcional (CRUD completo)
- ✅ Validación de eliminación de proveedores con insumos asociados
- ✅ Sincronización automática entre proveedores e insumos
- ✅ Modal de editar insumos funcional
- ✅ Formateo de decimales con punto (sin conflictos de locale)
- ✅ Carga automática de proveedores en modales
- Validación visual/feedback si el campo costo queda vacío
- Mejorar experiencia de usuario en formularios si se requiere

### Recetas
- ✅ Vista inicial informativa con grid de productos
- ✅ Navegación intuitiva con breadcrumb y botón volver
- ✅ Botones de incremento/decremento para cantidades
- ✅ Formato decimal consistente con punto
- ✅ Conteo dinámico de ingredientes por producto
- ✅ Modales con diseño Bootstrap consistente
- ✅ UX profesional sin páginas vacías

---

> **Módulos de Insumos y Recetas COMPLETADOS** - Todas las funcionalidades principales están implementadas y funcionando correctamente. Los módulos están listos para uso en producción. 