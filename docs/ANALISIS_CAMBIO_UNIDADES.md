# Análisis: Cambio de Unidades en Insumos Existentes

## 🚨 **Problemas Identificados**

### **1. Inconsistencia en Recetas**
**Problema**: Si cambias la unidad de un insumo, las recetas existentes quedarán con unidades incompatibles.

**Ejemplo**:
```sql
-- Insumo actual
INSERT INTO insumos VALUES (2, 'Azúcar', 1, 12.00, 'g');

-- Recetas existentes
INSERT INTO recetas VALUES (1, 2, 15.00, 'g');  -- ✅ Compatible
INSERT INTO recetas VALUES (2, 2, 1.00, 'kg');  -- ✅ Compatible (se convierte)

-- Si cambias Azúcar a 'kg':
UPDATE insumos SET Unidad = 'kg' WHERE ID_Insumo = 2;

-- Las recetas quedan:
-- Receta 1: 15g de azúcar (insumo ahora en kg) ❌ INCOMPATIBLE
-- Receta 2: 1kg de azúcar (insumo ahora en kg) ✅ COMPATIBLE
```

### **2. Problemas en Inventario**
**Problema**: Los movimientos de inventario registran cantidades en la unidad original.

**Ejemplo**:
```sql
-- Movimientos existentes
INSERT INTO movimientos_inventario VALUES (1, 2, 'Entrada', 1000, '2025-04-14', 1, 'Compra');
-- Registra: 1000g de azúcar

-- Si cambias a kg:
UPDATE insumos SET Unidad = 'kg' WHERE ID_Insumo = 2;

-- El inventario queda inconsistente:
-- Movimiento: 1000g
-- Insumo: kg
-- ¿Cómo interpretar 1000g cuando el insumo está en kg?
```

### **3. Problemas en Reportes**
**Problema**: Los reportes de consumo pueden ser incorrectos.

**Ejemplo**:
```sql
-- Consumo calculado en reportes
-- Antes: 1000g de azúcar consumidos
-- Después: 1000g de azúcar (pero insumo en kg) = 1kg
-- El reporte mostrará cantidades inconsistentes
```

### **4. Problemas en Cálculos de Costos**
**Problema**: Los costos por unidad pueden cambiar drásticamente.

**Ejemplo**:
```sql
-- Costo actual: $12.00 por 1000g
-- Costo por gramo: $0.012/g

-- Si cambias a kg:
-- Costo por kg: $12.00/kg
-- Costo por gramo: $0.012/g (mismo valor, pero unidad base diferente)
```

## 🔧 **Soluciones Propuestas**

### **Solución 1: Conversión Automática de Recetas**
```sql
-- Al cambiar la unidad del insumo, convertir todas las recetas
UPDATE recetas 
SET Cantidad_Necesaria = CASE 
    WHEN Unidad = 'g' AND (SELECT Unidad FROM insumos WHERE ID_Insumo = recetas.ID_Insumo) = 'kg' 
    THEN Cantidad_Necesaria / 1000
    WHEN Unidad = 'kg' AND (SELECT Unidad FROM insumos WHERE ID_Insumo = recetas.ID_Insumo) = 'g' 
    THEN Cantidad_Necesaria * 1000
    -- ... más casos
    ELSE Cantidad_Necesaria
END,
Unidad = (SELECT Unidad FROM insumos WHERE ID_Insumo = recetas.ID_Insumo)
WHERE ID_Insumo = ?;
```

### **Solución 2: Conversión de Movimientos de Inventario**
```sql
-- Convertir movimientos existentes
UPDATE movimientos_inventario 
SET Cantidad = CASE 
    WHEN Cantidad > 0 THEN Cantidad / factor_conversion
    ELSE Cantidad
END
WHERE ID_Insumo = ?;
```

### **Solución 3: Validación Antes del Cambio**
```sql
-- Verificar si hay recetas incompatibles
SELECT COUNT(*) as recetas_incompatibles
FROM recetas r
JOIN insumos i ON r.ID_Insumo = i.ID_Insumo
WHERE i.ID_Insumo = ? 
AND NOT unidades_compatibles(r.Unidad, nueva_unidad);
```

## 🛡️ **Prevención de Errores**

### **1. Validación en Backend**
```javascript
// En el controlador de insumos
async function cambiarUnidadInsumo(insumoId, nuevaUnidad) {
    // 1. Verificar compatibilidad con recetas existentes
    const recetasIncompatibles = await verificarRecetasIncompatibles(insumoId, nuevaUnidad);
    if (recetasIncompatibles.length > 0) {
        throw new Error('Existen recetas con unidades incompatibles');
    }
    
    // 2. Convertir recetas existentes
    await convertirRecetas(insumoId, nuevaUnidad);
    
    // 3. Convertir movimientos de inventario
    await convertirMovimientos(insumoId, nuevaUnidad);
    
    // 4. Actualizar insumo
    await actualizarInsumo(insumoId, nuevaUnidad);
}
```

### **2. Interfaz de Usuario**
```javascript
// Mostrar advertencia antes del cambio
function mostrarAdvertenciaCambioUnidad(insumoId, nuevaUnidad) {
    const recetas = obtenerRecetasDelInsumo(insumoId);
    const movimientos = obtenerMovimientosDelInsumo(insumoId);
    
    return `
        ⚠️ ADVERTENCIA: Cambiar la unidad afectará:
        • ${recetas.length} recetas existentes
        • ${movimientos.length} movimientos de inventario
        • Reportes de consumo
        
        ¿Deseas continuar con la conversión automática?
    `;
}
```

## 📋 **Checklist Antes de Cambiar Unidad**

- [ ] Verificar recetas existentes
- [ ] Verificar movimientos de inventario
- [ ] Verificar reportes que usen este insumo
- [ ] Calcular factor de conversión
- [ ] Crear backup de datos
- [ ] Probar conversión en ambiente de desarrollo
- [ ] Notificar a usuarios sobre el cambio
- [ ] Actualizar documentación

## 🎯 **Recomendación**

**NO cambiar unidades de insumos existentes** a menos que sea absolutamente necesario. En su lugar:

1. **Crear nuevo insumo** con la unidad correcta
2. **Migrar gradualmente** las recetas al nuevo insumo
3. **Deprecar el insumo anterior** una vez migrado todo

**Ejemplo**:
```sql
-- En lugar de cambiar
UPDATE insumos SET Unidad = 'kg' WHERE Nombre = 'Azúcar';

-- Crear nuevo insumo
INSERT INTO insumos VALUES (5, 'Azúcar (kg)', 1, 12.00, 'kg');
-- Migrar recetas gradualmente
-- Eliminar insumo anterior cuando esté vacío
``` 