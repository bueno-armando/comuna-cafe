# Resumen de Contexto - Comuna Café

## Estructura del Proyecto

- **backend/**: Node.js/Express, API REST, conexión a MySQL/MariaDB
  - `src/routes/insumosRoutes.js`: rutas de insumos (`/api/insumos`, `/api/insumos/proveedores`, etc.)
  - `src/controllers/insumos.controller.js`: lógica de insumos
  - `src/models/insumos.model.js`: consultas SQL para insumos y proveedores
- **frontend/**: HTML + JS vanilla
  - `Insumos.html`: vista de gestión de insumos
  - `js/insumos.js`: lógica de frontend para insumos
- **docs/**: documentación y especificaciones

## Tabla `insumos` (DB)

| Campo        | Tipo                                      | Notas                |
|--------------|-------------------------------------------|----------------------|
| ID_Insumo    | int(11), PK, auto_increment               |                      |
| Nombre       | varchar(100), NOT NULL                    |                      |
| ID_Proveedor | int(11), FK a proveedores, NOT NULL       |                      |
| Costo        | decimal(10,2), NOT NULL                   | Usar punto decimal   |
| Unidad       | enum('ml','g','Pza','cc','oz','tsp','tbsp') | NOT NULL           |

## Endpoints clave (API)

- `GET /api/insumos` — lista insumos, acepta filtro `?nombre=`
- `POST /api/insumos` — crear insumo (campos: Nombre, Unidad, Costo, ID_Proveedor)
- `GET /api/insumos/proveedores` — lista proveedores (ID_Proveedor, Nombre)
- `GET /api/insumos/proveedores/completos` — lista proveedores con información completa
- `POST /api/insumos/proveedores` — crear proveedor (campos: Nombre, Telefono, Direccion)
- `PUT /api/insumos/proveedores/:id` — actualizar proveedor
- `DELETE /api/insumos/proveedores/:id` — eliminar proveedor (bloquea si tiene insumos)

## Decisiones de UX y validación

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

## Estado actual del módulo Insumos

### ✅ **Funcionalidades completadas:**
- **CRUD completo de insumos**: Crear, leer, actualizar, eliminar
- **CRUD completo de proveedores**: Crear, leer, actualizar, eliminar
- **Panel de proveedores**: Modal con formulario y tabla
- **Búsqueda de insumos**: Por nombre en tiempo real
- **Validaciones**: Campos requeridos, formato de costo, bloqueo de eliminación
- **UX mejorada**: Modales con diseño consistente, iconos, feedback visual
- **Formateo de decimales**: Punto decimal forzado, sin conflictos de locale

### 🔧 **Detalles técnicos importantes:**
- **Campo costo**: `type="text"` para evitar formateo regional
- **Eventos JS**: Solo `blur` para formateo, sin interferencias
- **Proveedores**: Carga en ambos modales (agregar/editar)
- **Modal de editar**: Selección automática del proveedor actual
- **Eliminación**: Cierre automático del modal después de eliminar

## Puntos pendientes o a revisar

- ✅ Panel de proveedores funcional (CRUD completo)
- ✅ Validación de eliminación de proveedores con insumos asociados
- ✅ Sincronización automática entre proveedores e insumos
- ✅ Modal de editar insumos funcional
- ✅ Formateo de decimales con punto (sin conflictos de locale)
- ✅ Carga automática de proveedores en modales
- Validación visual/feedback si el campo costo queda vacío
- Mejorar experiencia de usuario en formularios si se requiere

---

> **Módulo de Insumos COMPLETADO** - Todas las funcionalidades principales están implementadas y funcionando correctamente. El módulo está listo para uso en producción. 