/**
 * Utilidades para conversión de unidades
 */

// Factores de conversión
const CONVERSION_FACTORS = {
    // Peso
    'kg_to_g': 1000,
    'g_to_kg': 0.001,
    'oz_to_g': 28.35,
    'g_to_oz': 0.0353,
    
    // Volumen
    'L_to_ml': 1000,
    'ml_to_L': 0.001,
    'oz_to_ml': 29.57,
    'ml_to_oz': 0.0338,
    'tsp_to_ml': 4.93,
    'ml_to_tsp': 0.2029,
    'tbsp_to_ml': 14.79,
    'ml_to_tbsp': 0.0676,
    'tbsp_to_tsp': 3,
    'tsp_to_tbsp': 0.3333,
    
    // Volumen a Peso (aproximaciones para agua/leche)
    'ml_to_g_water': 1,
    'g_to_ml_water': 1,
    'L_to_kg_water': 1,
    'kg_to_L_water': 1
};

// Unidades compatibles por categoría
const COMPATIBLE_UNITS = {
    'weight': ['g', 'kg', 'oz'],
    'volume': ['ml', 'L', 'oz', 'tsp', 'tbsp', 'cc'],
    'pieces': ['Pza', 'pkg']
};

/**
 * Convierte una cantidad de una unidad a otra
 * @param {number} cantidad - Cantidad a convertir
 * @param {string} unidadOrigen - Unidad de origen
 * @param {string} unidadDestino - Unidad de destino
 * @returns {number} Cantidad convertida
 */
function convertirUnidad(cantidad, unidadOrigen, unidadDestino) {
    if (unidadOrigen === unidadDestino) {
        return cantidad;
    }
    
    const conversionKey = `${unidadOrigen}_to_${unidadDestino}`;
    const factor = CONVERSION_FACTORS[conversionKey];
    
    if (factor) {
        return cantidad * factor;
    }
    
    // Si no hay conversión directa, intentar conversión inversa
    const reverseKey = `${unidadDestino}_to_${unidadOrigen}`;
    const reverseFactor = CONVERSION_FACTORS[reverseKey];
    
    if (reverseFactor) {
        return cantidad / reverseFactor;
    }
    
    // Si no hay conversión disponible, devolver la cantidad original
    console.warn(`No se encontró conversión de ${unidadOrigen} a ${unidadDestino}`);
    return cantidad;
}

/**
 * Determina si dos unidades son compatibles para conversión
 * @param {string} unidad1 - Primera unidad
 * @param {string} unidad2 - Segunda unidad
 * @returns {boolean} True si son compatibles
 */
function unidadesCompatibles(unidad1, unidad2) {
    if (unidad1 === unidad2) return true;
    
    // Verificar si están en la misma categoría
    for (const categoria of Object.values(COMPATIBLE_UNITS)) {
        if (categoria.includes(unidad1) && categoria.includes(unidad2)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Obtiene las unidades compatibles para una unidad dada
 * @param {string} unidad - Unidad de referencia
 * @returns {string[]} Array de unidades compatibles
 */
function obtenerUnidadesCompatibles(unidad) {
    for (const [categoria, unidades] of Object.entries(COMPATIBLE_UNITS)) {
        if (unidades.includes(unidad)) {
            return unidades.filter(u => u !== unidad);
        }
    }
    return [];
}

/**
 * Normaliza una cantidad a la unidad estándar del insumo
 * @param {number} cantidad - Cantidad ingresada
 * @param {string} unidadIngresada - Unidad ingresada por el usuario
 * @param {string} unidadInsumo - Unidad del insumo en BD
 * @returns {number} Cantidad normalizada
 */
function normalizarCantidad(cantidad, unidadIngresada, unidadInsumo) {
    return convertirUnidad(cantidad, unidadIngresada, unidadInsumo);
}

module.exports = {
    convertirUnidad,
    unidadesCompatibles,
    obtenerUnidadesCompatibles,
    normalizarCantidad,
    CONVERSION_FACTORS,
    COMPATIBLE_UNITS
}; 