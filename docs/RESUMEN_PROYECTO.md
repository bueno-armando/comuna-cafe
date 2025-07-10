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

## Decisiones de UX y validación

- El campo **Costo** en formularios:
  - Solo acepta números y punto decimal
  - step="1.00", min="0", requerido
  - Muestra símbolo `$` y `MXN` en el input
  - Si está vacío y se incrementa, inicia en 1.00 (comportamiento estándar)
- El select de proveedor se llena dinámicamente desde la API
- La búsqueda de insumos es por nombre y usa el endpoint principal con query param

## Puntos pendientes o a revisar

- Validación visual/feedback si el campo costo queda vacío
- Sincronizar lógica de edición de insumo (proveedor, costo, etc.)
- Mejorar experiencia de usuario en formularios si se requiere

---

> Este resumen es suficiente para retomar el desarrollo del módulo de insumos y entender la estructura general del proyecto. Actualizar según se agreguen nuevas funcionalidades o módulos. 