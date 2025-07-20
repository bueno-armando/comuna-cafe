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
  - `src/routes/cajaRoutes.js`: rutas de caja (`/api/caja/productos`, `/api/caja/categorias`, `/api/caja/venta`)
  - `src/controllers/cajaController.js`: lógica de caja
  - `src/models/cajaModel.js`: consultas SQL para productos de caja y categorías
- **frontend/**: HTML + JS vanilla
  - `Insumos.html`: vista de gestión de insumos
  - `js/insumos.js`: lógica de frontend para insumos
  - `Recetas.html`: vista de gestión de recetas
  - `js/recetas.js`: lógica de frontend para recetas
  - `Ventas.html`: vista de gestión de ventas
  - `js/ventas.js`: lógica de frontend para ventas
  - `Gastos.html`: vista de gestión de gastos
  - `js/gastos.js`: lógica de frontend para gastos
  - `Caja.html`: vista de punto de venta
  - `js/caja.js`: lógica de frontend para caja
  - `js/productCard.js`: clase común para renderizar tarjetas de productos
  - `css/productCards.css`: estilos para tarjetas de productos con imágenes de fondo
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

### Caja
- `GET /api/caja/productos` — lista productos disponibles para la venta
- `GET /api/caja/categorias` — lista categorías de productos
- `POST /api/caja/venta` — procesar una venta (ID_Producto, Cantidad, Metodo_Pago)

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

### Caja
- ✅ **Filtro por categoría**: Seleccionar una categoría para filtrar productos
- ✅ **Búsqueda de productos**: Filtrado en tiempo real de productos disponibles
- ✅ **Carrito de compras**: Agregar, eliminar y modificar cantidades de productos
- ✅ **Cálculo automático**: Subtotal y total de la venta calculados dinámicamente
- ✅ **Métodos de pago**: Efectivo, Tarjeta, Transferencia con validación
- ✅ **Modal de confirmación**: Confirmación de pago con cálculo de cambio para efectivo
- ✅ **Notificaciones modales**: Sistema unificado de notificaciones con Bootstrap para éxito y errores
- ✅ **UX profesional**: Modales elegantes en lugar de alerts básicos
- ✅ **Integración completa**: Conectado al backend para procesar ventas reales
- ✅ **Validaciones robustas**: Verificación de método de pago y datos de venta

### ✅ **Sistema de Tarjetas de Productos - COMPLETADO**
- **Clase ProductCard común**: Reutilizable en todos los módulos que muestran productos
- **Configuración flexible**: Mostrar/ocultar precio, categoría, ingredientes, botones según el módulo
- **Imágenes de fondo**: Soporte para imágenes como fondo con transparencia
- **Estilos responsivos**: Adaptación automática a diferentes tamaños de pantalla
- **Efectos visuales**: Hover effects, sombras de texto, transiciones suaves
- **Compatibilidad**: Funciona con o sin imágenes, sin afectar funcionalidad existente
- **Optimización de espacio**: Imagen como fondo en lugar de elemento separado
- **Legibilidad garantizada**: Overlay semi-transparente y sombras de texto para contraste

### ✅ **Sistema de Imágenes de Productos - COMPLETADO**
- **Campo ruta_imagen**: Agregado a la tabla productos_venta para almacenar URLs de imágenes
- **Compatibilidad hacia atrás**: Sistema funciona con productos existentes sin imágenes
- **Modales actualizados**: Campo de URL de imagen en formularios de agregar/editar productos
- **Preview en tiempo real**: Visualización de imagen mientras se escribe la URL
- **Validación de URLs**: Manejo de errores de carga de imagen
- **Estilos CSS específicos**: Transparencia configurable, efectos hover, responsive design
- **Integración completa**: Imágenes se muestran en Caja, Recetas y cualquier módulo que use ProductCard

### ✅ **Sistema de Notificaciones Modales Unificado - COMPLETADO**
- **Clase NotificationModal**: Sistema centralizado para todas las notificaciones del sistema
- **Tipos de notificación**: Éxito, Error, Advertencia, Información con iconos y colores apropiados
- **Reemplazo de alerts**: Todos los alerts nativos reemplazados por modales profesionales
- **Consistencia visual**: Mismo diseño y comportamiento en todos los módulos
- **Configuración automática**: Iconos y colores se ajustan según el tipo de notificación
- **Fácil mantenimiento**: Un solo lugar para cambios en el diseño de notificaciones
- **UX mejorada**: Modales elegantes en lugar de alerts básicos del navegador
- **Integración completa**: Disponible globalmente en todo el sistema SPA
- **Migración completa**: Todos los módulos migrados al sistema unificado:
  - ✅ Ventas: 3 alerts reemplazados
  - ✅ Productos: 7 alerts reemplazados
  - ✅ Insumos: 12 alerts reemplazados
  - ✅ Inventario: 3 alerts reemplazados
  - ✅ Gastos: Función showAlert migrada
  - ✅ Bitácora: 1 alert reemplazado
  - ✅ Recetas: 15 alerts reemplazados (previamente)
  - ✅ Usuarios: Soporte agregado
  - ✅ Caja: Ya usaba notificationModal
  - ✅ Reportes: Ya usaba notificationModal

### ✅ **Estandarización de Modales - COMPLETADO**
- **Centrado vertical**: Todos los modales del sistema ahora aparecen centrados usando `modal-dialog-centered`
- **Módulos actualizados**: 8 módulos con 20+ modales estandarizados:
  - ✅ Usuarios: 6 modales centrados
  - ✅ Gastos: 2 modales centrados
  - ✅ Ventas: 1 modal centrado
  - ✅ Productos: 3 modales centrados
  - ✅ Inventario: 2 modales centrados
  - ✅ Insumos: 2 modales centrados
  - ✅ Recetas: 2 modales centrados
  - ✅ Caja, Reportes: Ya estaban centrados
- **Mejoras en UX**: Modales centrados siguen mejores prácticas de accesibilidad
- **Responsive**: Funciona mejor en dispositivos móviles
- **Consistencia visual**: Todos los modales siguen el mismo patrón de diseño

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
- **Filtros flexibles**: Backend maneja filtros individuales (solo categoría, solo búsqueda, o combinados)
- **Búsqueda en tiempo real**: Filtrado de productos con debounce y indicador visual
- **Combinación de filtros**: Categoría se combina con búsqueda por texto
- **Paginación completa**: Backend y frontend con tamaño de página dinámico
- **UI de filtros mejorada**: Controles alineados con texto de total de productos
- **Notificaciones modales**: Sistema unificado de notificaciones con Bootstrap

#### ProductCard
- **Clase reutilizable**: Una sola implementación para todos los módulos
- **Configuración por opciones**: showPrice, showCategory, showIngredients, showButton
- **Manejadores de eventos**: Sistema unificado para clicks en botones
- **Renderizado condicional**: Imagen de fondo solo cuando existe ruta_imagen
- **Estilos CSS modulares**: Archivo separado para facilitar mantenimiento
- **Responsive design**: Adaptación automática a diferentes dispositivos

#### Sistema de Imágenes
- **Campo ruta_imagen**: VARCHAR(255) con valor por defecto NULL
- **Compatibilidad total**: Productos existentes funcionan sin cambios
- **Preview en tiempo real**: Validación visual de URLs de imagen
- **Overlay configurable**: Transparencia ajustable en CSS
- **Efectos visuales**: Hover effects, sombras de texto, transiciones
- **Optimización de espacio**: Imagen como fondo en lugar de elemento separado

#### Sistema de Notificaciones
- **Clase NotificationModal**: Sistema centralizado con métodos showSuccess, showError, showWarning, showInfo
- **Modal HTML dinámico**: Se crea automáticamente si no existe en la página
- **Configuración automática**: Iconos y colores se ajustan según el tipo (success, error, warning, info)
- **Bootstrap Modal**: Utiliza la API de Bootstrap para funcionalidad completa
- **Integración global**: Disponible en todo el sistema SPA
- **Reemplazo completo**: Todos los alerts nativos reemplazados por modales profesionales
- **Consistencia visual**: Mismo diseño en todos los módulos (Caja, Recetas, etc.)

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