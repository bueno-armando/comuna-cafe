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

### ✅ **Módulo de Usuarios - COMPLETADO**
- **CRUD completo de usuarios**: Crear, leer, actualizar, eliminar
- **Autenticación y login**: Sistema de login con JWT y verificación de credenciales
- **Gestión de roles**: Administrador, Cajero, Mesero con permisos diferenciados
- **Filtros avanzados**: Por nombre, apellido, rol, estado con filtros rápidos
- **Paginación dinámica**: 9 usuarios por página con navegación intuitiva
- **Modales profesionales**: Confirmaciones de creación, edición, eliminación y errores
- **UX consistente**: Diseño compacto, badges de estado, iconos Bootstrap
- **Validaciones robustas**: Backend maneja filtros individuales y combinados
- **Generación automática de usuarios**: Procedimiento almacenado para nombres únicos
- **Encriptación de contraseñas**: bcrypt para seguridad
- **Columna de ID**: Información técnica para administradores de sistemas

### ✅ **Módulo de Reportes - COMPLETADO**
- **Generación de reportes**: Permite crear reportes consolidados de ventas y gastos por periodo (diario, semanal, mensual, etc.)
- **Consulta y desglose**: Listado de reportes con filtros y paginación, consulta de detalles, ventas y gastos incluidos, producto más vendido y día con más ventas
- **Exportación a PDF**: Genera archivos PDF profesionales con logo, encabezado, tablas de ventas y gastos, estadísticas y fecha de generación
- **Exportación a Excel**: Genera archivos Excel (.xlsx) con hojas separadas para resumen, ventas y gastos, con formatos de moneda y fecha
- **Filtros profesionales**: Filtros rápidos (Hoy, Semana, Mes, Personalizado) siguiendo el patrón de Gastos y Bitácora
- **Notificaciones modales**: Sistema de notificaciones con modales Bootstrap para éxito y errores
- **Integración SPA completa**: Frontend conectado al backend, tabla dinámica, modal de detalles, y UX consistente
- **API robusta**: Todos los endpoints REST implementados, incluyendo exportación a PDF y Excel
- **Listo para producción**: Lógica robusta, validaciones, y funcionalidad completa de exportación
- **UX mejorada**: Botón de generar con estilo consistente (btn-success), efectos de carga, y feedback visual profesional
- **Modal de detalles mejorado**: Información estática en cards y badges en lugar de inputs readonly
- **Lógica de ganancias corregida**: "Ventas Totales" muestra ventas brutas, "Balance Neto" muestra ganancia neta
- **Manejo de casos especiales**: "Sin ganancias" cuando no hay ventas, colores apropiados para balance negativo
- **Corrección de errores**: Modal de detalles funciona correctamente sin errores de DOM
- **Limpieza de modal**: Contenido se limpia al cerrar para evitar datos obsoletos

### ✅ **Módulo de Productos - COMPLETADO**
- **CRUD completo de productos**: Crear, leer, actualizar, eliminar
- **Gestión de categorías**: Crear, editar, eliminar categorías de productos
- **Filtros avanzados**: Por nombre, categoría, estado con filtros rápidos
- **Paginación dinámica**: 9 productos por página con navegación intuitiva
- **Modales profesionales**: Confirmaciones de creación, edición, eliminación y errores
- **UX consistente**: Diseño compacto, badges de estado, iconos Bootstrap
- **Validaciones robustas**: Backend maneja filtros individuales y combinados
- **Productos inactivos**: Vista separada para productos desactivados con opción de reactivación
- **Campos de precio mejorados**: Símbolo de moneda ($) en inputs de precio con input groups
- **Notificaciones modales**: Sistema unificado de notificaciones con Bootstrap para éxito y errores
- **UX mejorada**: Modales profesionales en lugar de alerts básicos para mejor experiencia de usuario

### ✅ **Módulo de Caja - COMPLETADO**
- **Interfaz de punto de venta**: Vista intuitiva para procesar ventas rápidas
- **Búsqueda de productos**: Filtrado en tiempo real de productos disponibles
- **Carrito de compras**: Agregar, eliminar y modificar cantidades de productos
- **Cálculo automático**: Subtotal y total de la venta calculados dinámicamente
- **Métodos de pago**: Efectivo, Tarjeta, Transferencia con validación
- **Modal de confirmación**: Confirmación de pago con cálculo de cambio para efectivo
- **Notificaciones modales**: Sistema unificado de notificaciones con Bootstrap para éxito y errores
- **UX profesional**: Modales elegantes en lugar de alerts básicos
- **Integración completa**: Conectado al backend para procesar ventas reales
- **Validaciones robustas**: Verificación de método de pago y datos de venta

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

#### Usuarios
- **Filtros flexibles**: Backend maneja filtros individuales (solo nombre, solo rol, etc.)
- **Búsqueda por texto**: LIKE para nombres y apellidos
- **Paginación inteligente**: Máximo 5 páginas visibles, botones anterior/siguiente
- **Modal de confirmación**: Eliminación con confirmación de seguridad
- **Formato de datos**: Mapeo correcto entre frontend y backend
- **Contraseña opcional**: Al editar, solo se actualiza si se proporciona nueva
- **Roles y permisos**: Validación de permisos para crear usuarios (solo administradores)
- **UX profesional**: Filtros reactivos, búsqueda por múltiples criterios
- **Información técnica**: IDs visibles para administradores de sistemas

#### Reportes
- **Exportación profesional**: PDF con logo, encabezado, tablas y estadísticas
- **Exportación Excel**: Múltiples hojas con formatos de moneda y fecha
- **Filtros consistentes**: Mismo patrón que Gastos y Bitácora (Hoy, Semana, Mes, Personalizado)
- **Notificaciones modales**: Sistema unificado de notificaciones con Bootstrap
- **Carga dinámica**: Tabla de reportes sin contenido estático
- **Modal de detalles**: Información completa con ventas, gastos y estadísticas
- **UX pulida**: Filtros sin interferencias, botones de exportación integrados
- **API completa**: Endpoints para exportación a PDF y Excel implementados
- **Botón de generar mejorado**: Estilo consistente (btn-success), efectos de carga con animación de pulso, y feedback visual profesional
- **Lógica de ganancias corregida**: Backend calcula ganancia como ventas - gastos, frontend muestra correctamente
- **Modal de detalles mejorado**: Cards y badges para información estática, sin inputs readonly
- **Manejo de errores**: Try-catch en modal show event, limpieza de contenido al cerrar

#### Productos
- **Input groups para precios**: Símbolo de moneda ($) integrado en campos de precio
- **Notificaciones modales**: Sistema unificado con iconos y colores según tipo de mensaje
- **Gestión de categorías**: Modal integrado para CRUD de categorías
- **Productos inactivos**: Vista separada con opción de reactivación
- **Validaciones robustas**: Backend maneja filtros individuales y combinados
- **UX profesional**: Modales elegantes en lugar de alerts básicos

#### Caja
- **Interfaz de punto de venta**: Vista intuitiva para procesar ventas rápidas
- **Búsqueda en tiempo real**: Filtrado de productos con debounce
- **Carrito dinámico**: Agregar, eliminar y modificar cantidades
- **Cálculo automático**: Subtotal y total calculados dinámicamente
- **Modal de confirmación**: Confirmación de pago con cálculo de cambio
- **Notificaciones modales**: Sistema unificado con Bootstrap para éxito y errores
- **Validaciones**: Verificación de método de pago y datos de venta
- **Integración completa**: Conectado al backend para procesar ventas reales

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

### Sistema de Autenticación
- ✅ Botón mostrar/ocultar contraseña en login con íconos dinámicos
- ✅ Posicionamiento y tamaño optimizados del botón de contraseña
- ✅ Sistema de recuperación de contraseña de administrador implementado
- ✅ Script de emergencia (`reset-admin.js`) para resetear contraseñas
- ✅ Documentación completa de recuperación (`RECOVERY.md`)
- ✅ Múltiples métodos de recuperación (script automático, reset manual en BD)
- ✅ Política de creación de usuarios: Solo administradores pueden crear nuevos usuarios
- ✅ Sistema de recuperación de contraseña con múltiples métodos de emergencia

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
- ✅ Filtrado en tiempo real: Búsqueda por descripción con debounce y indicador visual
- ✅ Combinación de filtros: Descripción se combina con filtros rápidos de fecha
- ✅ Paginación completa: Backend y frontend con tamaño de página dinámico
- ✅ UI de paginación mejorada: Controles alineados con texto de total de gastos
- ✅ Notificaciones modales: Sistema unificado de notificaciones con Bootstrap

### Reportes
- ✅ Botón de generar reporte con estilo consistente (btn-success)
- ✅ Efectos de carga con animación de pulso durante generación
- ✅ Feedback visual profesional con estados de carga
- ✅ UX mejorada con transiciones suaves y efectos hover
- ✅ Modal de detalles mejorado: Información estática en cards y badges en lugar de inputs readonly
- ✅ Lógica de ganancias corregida: "Ventas Totales" muestra ventas brutas, "Balance Neto" muestra ganancia neta
- ✅ Manejo de casos especiales: "Sin ganancias" cuando no hay ventas, colores apropiados para balance negativo
- ✅ Notificaciones modales: Sistema unificado de notificaciones con Bootstrap para éxito y errores
- ✅ Corrección de errores: Modal de detalles funciona correctamente sin errores de DOM
- ✅ Limpieza de modal: Contenido se limpia al cerrar para evitar datos obsoletos

---

> **Módulos de Insumos, Recetas, Ventas, Gastos, Usuarios, Reportes, Productos y Caja COMPLETADOS** - Todas las funcionalidades principales están implementadas y funcionando correctamente. Los módulos están listos para uso en producción.

> **Sistema de Autenticación y Recuperación COMPLETADO** - Login con botón mostrar/ocultar contraseña, sistema de recuperación de emergencia, y documentación completa implementados.

> **Sistema de Notificaciones Unificado COMPLETADO** - Todos los módulos utilizan modales Bootstrap profesionales en lugar de alerts básicos, proporcionando una experiencia de usuario consistente y elegante.