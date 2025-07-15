# Resumen de Contexto - Comuna Café

## Estructura del Proyecto

- **backend/**: Node.js/Express, API REST, conexión a MySQL/MariaDB
  - `src/routes/insumosRoutes.js`: rutas de insumos (`/api/insumos`, `/api/insumos/proveedores`, etc.)
  - `src/controllers/insumos.controller.js`: lógica de insumos
  - `src/models/insumos.model.js`: consultas SQL para insumos y proveedores
  - `src/routes/recetasRoutes.js`: rutas de recetas (`/api/recetas`, `/api/recetas/productos/todos`, etc.)
  - `src/controllers/recetas.controller.js`: lógica de recetas
  - `src/routes/ventasRoutes.js`: rutas de ventas (`/api/ventas`, `/api/ventas/:id`, etc.)
  - `src/controllers/ventasController.js`: lógica de ventas
  - `src/routes/gastosRoutes.js`: rutas de gastos (`/api/gastos`, `/api/gastos/:id`, etc.)
  - `src/controllers/gastosController.js`: lógica de gastos
- **frontend/**: HTML + JS vanilla
  - `Insumos.html`: vista de gestión de insumos
  - `js/insumos.js`: lógica de frontend para insumos
  - `Recetas.html`: vista de gestión de recetas
  - `js/recetas.js`: lógica de frontend para recetas
  - `Ventas.html`: vista de gestión de ventas
  - `js/ventas.js`: lógica de frontend para ventas
  - `Gastos.html`: vista de gestión de gastos
  - `js/gastos.js`: lógica de frontend para gastos
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

### Tabla `ventas`
| Campo        | Tipo                | Notas                                    |
|--------------|---------------------|------------------------------------------|
| ID_Venta     | int(11), PK, auto_increment | ID único de la venta                |
| Fecha        | date, NOT NULL      | Fecha de la venta (sin hora)           |
| Total        | decimal(10,2)       | Total de la venta                      |
| Metodo_Pago  | varchar(50)         | Método de pago (Efectivo, Tarjeta, etc.) |
| ID_Usuario   | int(11), FK         | Usuario que realizó la venta           |

### Tabla `detalle_venta`
| Campo        | Tipo                | Notas                                    |
|--------------|---------------------|------------------------------------------|
| ID_Venta     | int(11), PK, FK     | Referencia a ventas                     |
| ID_Producto  | int(11), PK, FK     | Referencia a productos_venta            |
| Cantidad     | int(11)             | Cantidad vendida                        |
| Subtotal     | decimal(10,2)       | Subtotal del producto (cantidad × precio) |

### Tabla `gastos`
| Campo        | Tipo                | Notas                                    |
|--------------|---------------------|------------------------------------------|
| ID_Gasto     | int(11), PK, auto_increment | ID único del gasto                  |
| Fecha        | date, NOT NULL      | Fecha del gasto (sin hora)             |
| Descripcion  | varchar(255), NOT NULL | Descripción del gasto                |
| Monto        | decimal(10,2), NOT NULL | Monto del gasto                     |
| Categoria    | varchar(100)        | Categoría del gasto                    |
| ID_Usuario   | int(11), FK         | Usuario que registró el gasto          |

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

### Ventas
- `GET /api/ventas` — lista ventas con paginación (page, limit, fechaInicio, fechaFin)
- `GET /api/ventas/:id` — obtener detalles completos de una venta específica
- `GET /api/ventas/exportar/pdf` — exportar ventas a PDF (pendiente)
- `GET /api/ventas/exportar/excel` — exportar ventas a Excel (pendiente)

### Gastos
- `GET /api/gastos` — lista gastos con paginación y filtros (page, limit, fechaInicio, fechaFin, descripcion)
- `GET /api/gastos/:id` — obtener detalles de un gasto específico
- `POST /api/gastos` — crear nuevo gasto (Fecha, Descripcion, Monto, Categoria)
- `PUT /api/gastos/:id` — actualizar gasto
- `DELETE /api/gastos/:id` — eliminar gasto

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

### Ventas
- ✅ **Paginación completa**: 9 ventas por página con navegación intuitiva
- ✅ **Filtros por fecha**: Rango de fechas con campos "Desde" y "Hasta"
- ✅ **Modal de detalles**: Información completa de venta y productos vendidos
- ✅ **Formato de fechas**: Solo fecha sin hora (dd/mm/yyyy)
- ✅ **Precio unitario calculado**: Subtotal ÷ Cantidad para precisión histórica
- ✅ **UX consistente**: Iconos Bootstrap, colores unificados, diseño responsive
- ✅ **Exportación preparada**: Botones para PDF y Excel (pendientes de implementar)

### Gastos
- ✅ **Filtros avanzados**: Fecha inicio/fin (rangos abiertos), descripción (LIKE)
- ✅ **Filtros rápidos**: Hoy, Semana, Mes, Personalizado
- ✅ **Modal unificado**: Crear/editar gastos en un solo modal dinámico
- ✅ **Botones incremento/decremento**: Para montos con paso de 1.00
- ✅ **Formato decimal consistente**: Punto decimal, formateo automático
- ✅ **UX profesional**: Filtros flexibles, búsqueda por descripción
- ✅ **Validación robusta**: Backend maneja filtros individuales y combinados

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

### ✅ **Módulo de Ventas - COMPLETADO**
- **Paginación completa**: 9 ventas por página con navegación intuitiva
- **Filtros por fecha**: Rango de fechas con campos "Desde" y "Hasta"
- **Modal de detalles**: Información completa de venta y productos vendidos
- **Formato de fechas**: Solo fecha sin hora (dd/mm/yyyy)
- **Precio unitario calculado**: Subtotal ÷ Cantidad para precisión histórica
- **UX consistente**: Iconos Bootstrap, colores unificados, diseño responsive
- **Exportación preparada**: Botones para PDF y Excel (pendientes de implementar)

### ✅ **Módulo de Gastos - COMPLETADO**
- **CRUD completo de gastos**: Crear, leer, actualizar, eliminar
- **Filtros avanzados**: Fecha inicio/fin (rangos abiertos), descripción (LIKE)
- **Filtros rápidos**: Hoy, Semana, Mes, Personalizado
- **Modal unificado**: Crear/editar gastos en un solo modal dinámico
- **Botones incremento/decremento**: Para montos con paso de 1.00
- **Formato decimal consistente**: Punto decimal, formateo automático
- **UX profesional**: Filtros flexibles, búsqueda por descripción
- **Validación robusta**: Backend maneja filtros individuales y combinados

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

#### Ventas
- **Paginación inteligente**: Máximo 5 páginas visibles, botones anterior/siguiente
- **Filtros dinámicos**: Fecha inicio/fin con validación automática
- **Modal de detalles**: Carga asíncrona de venta y productos vendidos
- **Formato de fechas**: Solo fecha sin hora para consistencia con BD
- **Precio histórico**: Cálculo desde subtotal para precisión histórica
- **UX responsive**: Tabla responsive, modales adaptables

#### Gastos
- **Filtros flexibles**: Backend maneja filtros individuales (solo inicio o solo fin)
- **Búsqueda por descripción**: LIKE con otros filtros combinados
- **Modal dinámico**: Un solo modal para crear/editar con título dinámico
- **Formato decimal**: Punto decimal, paso de 1.00, botones +/- 1
- **Filtros rápidos**: Hoy, Semana, Mes, Personalizado con UX intuitiva
- **Validación robusta**: Backend valida y maneja todos los casos de filtrado

## Recomendaciones para paginación y filtros en todos los módulos

Para asegurar una experiencia de usuario consistente y profesional, todos los módulos que muestran listas de registros (como Gastos, Bitácora, Ventas, etc.) deben implementar paginación y filtros avanzados siguiendo este patrón:

### Backend (API)
- El endpoint principal debe aceptar los siguientes parámetros por query string:
  - `page`: número de página (default: 1)
  - `limit`: resultados por página (default: 11, o el valor que se defina para el módulo)
  - Filtros específicos del módulo (ej. usuario, operación, descripción, fechas, etc.)
- La consulta SQL debe armarse dinámicamente según los filtros recibidos, permitiendo combinaciones flexibles.
- Se debe devolver una respuesta con la siguiente estructura:

```json
{
  "registros": [ ... ],
  "totalRegistros": 42,
  "totalPages": 4,
  "currentPage": 2,
  "limit": 11
}
```

### Frontend (SPA)
- Los filtros deben ser reactivos y compactos, con filtros rápidos (Hoy, Semana, Mes, Personalizado) cuando aplique.
- El botón de aplicar filtros solo debe mostrarse para el filtro personalizado.
- Al aplicar filtros, siempre mostrar la primera página.
- La paginación debe ser dinámica y mantenerse al cambiar filtros.
- Mostrar notificación descriptiva de filtros aplicados, con opción clara para limpiar todos los filtros.
- Los campos de fecha deben ser flexibles (permitir solo inicio, solo fin, o ambos).
- El diseño debe ser compacto y consistente entre módulos.

> Este patrón fue implementado y validado en los módulos de Gastos y Bitácora. Se recomienda replicarlo en cualquier módulo futuro que requiera filtrado y paginación para mantener la coherencia y calidad UX en todo el sistema.

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

### Ventas
- ✅ Paginación completa con navegación intuitiva
- ✅ Filtros por rango de fechas funcionales
- ✅ Modal de detalles con información completa
- ✅ Formato de fechas consistente (sin hora)
- ✅ Cálculo preciso de precios unitarios históricos
- ✅ UX consistente con otros módulos
- Implementar exportación a PDF y Excel
- Agregar filtros adicionales (por usuario, método de pago)

### Gastos
- ✅ CRUD completo de gastos funcional
- ✅ Filtros avanzados con rangos abiertos
- ✅ Búsqueda por descripción combinada con otros filtros
- ✅ Modal unificado para crear/editar gastos
- ✅ Botones incremento/decremento para montos
- ✅ Formato decimal consistente con punto
- ✅ Filtros rápidos con UX intuitiva
- ✅ Validación robusta en backend

---

> **Módulos de Insumos, Recetas, Ventas y Gastos COMPLETADOS** - Todas las funcionalidades principales están implementadas y funcionando correctamente. Los módulos están listos para uso en producción.