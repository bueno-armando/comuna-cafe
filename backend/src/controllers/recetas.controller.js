const db = require('../config/database');
const { normalizarCantidad, unidadesCompatibles, obtenerUnidadesCompatibles } = require('../utils/unitConverter');

class RecetasController {
    // Obtener la receta completa de un producto
    static async getByProductId(req, res) {
        try {
            const { productId } = req.params;
            
            // Validar que el productId sea un número válido
            if (!productId || isNaN(productId)) {
                return res.status(400).json({ message: 'ID de producto inválido' });
            }

            const query = `
                SELECT 
                    r.ID_Producto,
                    r.ID_Insumo,
                    i.Nombre AS Insumo,
                    r.Cantidad_Necesaria,
                    r.Unidad
                FROM recetas r
                JOIN insumos i ON r.ID_Insumo = i.ID_Insumo
                WHERE r.ID_Producto = ?
                ORDER BY i.Nombre`;
            
            const [recetas] = await db.query(query, [productId]);
            
            // Siempre devolver un array, incluso si está vacío
            res.json(recetas);
        } catch (error) {
            console.error('Error al obtener receta:', error);
            res.status(500).json({ message: 'Error al obtener la receta' });
        }
    }

    // Agregar un insumo a la receta
    static async addInsumo(req, res) {
        try {
            const { ID_Producto, ID_Insumo, Cantidad_Necesaria, Unidad } = req.body;

            // Validaciones
            if (!ID_Producto || !ID_Insumo || !Cantidad_Necesaria || !Unidad) {
                return res.status(400).json({ 
                    message: 'Todos los campos son requeridos: ID_Producto, ID_Insumo, Cantidad_Necesaria, Unidad' 
                });
            }

            if (Cantidad_Necesaria <= 0) {
                return res.status(400).json({ 
                    message: 'La cantidad debe ser mayor a 0' 
                });
            }

            // Verificar que el producto existe
            const [producto] = await db.query(
                'SELECT ID_Producto FROM productos_venta WHERE ID_Producto = ?',
                [ID_Producto]
            );

            if (producto.length === 0) {
                return res.status(404).json({ 
                    message: 'El producto especificado no existe' 
                });
            }

            // Verificar que el insumo existe y obtener su unidad
            const [insumo] = await db.query(
                'SELECT ID_Insumo, Unidad FROM insumos WHERE ID_Insumo = ?',
                [ID_Insumo]
            );

            if (insumo.length === 0) {
                return res.status(404).json({ 
                    message: 'El insumo especificado no existe' 
                });
            }

            const unidadInsumo = insumo[0].Unidad;
            
            // Verificar compatibilidad de unidades
            if (!unidadesCompatibles(Unidad, unidadInsumo)) {
                return res.status(400).json({ 
                    message: `Las unidades ${Unidad} y ${unidadInsumo} no son compatibles para conversión` 
                });
            }

            // Verificar si ya existe este insumo en la receta
            const [existente] = await db.query(
                'SELECT * FROM recetas WHERE ID_Producto = ? AND ID_Insumo = ?',
                [ID_Producto, ID_Insumo]
            );

            if (existente.length > 0) {
                return res.status(400).json({ 
                    message: 'Este insumo ya existe en la receta' 
                });
            }

            // Convertir la cantidad a la unidad del insumo si es necesario
            let cantidadFinal = Cantidad_Necesaria;
            let unidadFinal = Unidad;
            
            if (Unidad !== unidadInsumo) {
                cantidadFinal = normalizarCantidad(Cantidad_Necesaria, Unidad, unidadInsumo);
                unidadFinal = unidadInsumo;
                console.log(`Conversión: ${Cantidad_Necesaria} ${Unidad} = ${cantidadFinal} ${unidadFinal}`);
            }
            
            // Insertar la receta usando la estructura real de la tabla
            const query = `
                INSERT INTO recetas (ID_Producto, ID_Insumo, Cantidad_Necesaria, Unidad)
                VALUES (?, ?, ?, ?)`;
            
            await db.query(query, [ID_Producto, ID_Insumo, cantidadFinal, unidadFinal]);
            
            res.status(201).json({ 
                message: 'Insumo agregado a la receta exitosamente' 
            });
        } catch (error) {
            console.error('Error al agregar insumo a receta:', error);
            res.status(500).json({ 
                message: 'Error al agregar el insumo a la receta' 
            });
        }
    }

    // Actualizar la cantidad de un insumo en la receta
    static async updateInsumo(req, res) {
        try {
            const { ID_Producto, ID_Insumo } = req.params;
            const { Cantidad_Necesaria, Unidad } = req.body;

            // Validaciones
            if (!Cantidad_Necesaria || Cantidad_Necesaria <= 0) {
                return res.status(400).json({ 
                    message: 'La cantidad debe ser mayor a 0' 
                });
            }

            if (!Unidad) {
                return res.status(400).json({ 
                    message: 'La unidad es requerida' 
                });
            }

            // Obtener la unidad del insumo para conversión
            const [insumo] = await db.query(
                'SELECT Unidad FROM insumos WHERE ID_Insumo = ?',
                [ID_Insumo]
            );

            if (insumo.length === 0) {
                return res.status(404).json({ 
                    message: 'El insumo especificado no existe' 
                });
            }

            const unidadInsumo = insumo[0].Unidad;
            
            // Verificar compatibilidad de unidades
            if (!unidadesCompatibles(Unidad, unidadInsumo)) {
                return res.status(400).json({ 
                    message: `Las unidades ${Unidad} y ${unidadInsumo} no son compatibles para conversión` 
                });
            }

            // Convertir la cantidad a la unidad del insumo si es necesario
            let cantidadFinal = Cantidad_Necesaria;
            let unidadFinal = Unidad;
            
            if (Unidad !== unidadInsumo) {
                cantidadFinal = normalizarCantidad(Cantidad_Necesaria, Unidad, unidadInsumo);
                unidadFinal = unidadInsumo;
                console.log(`Conversión: ${Cantidad_Necesaria} ${Unidad} = ${cantidadFinal} ${unidadFinal}`);
            }

            const query = `
                UPDATE recetas 
                SET Cantidad_Necesaria = ?, Unidad = ?
                WHERE ID_Producto = ? AND ID_Insumo = ?`;
            
            const [result] = await db.query(query, [
                cantidadFinal, 
                unidadFinal, 
                ID_Producto, 
                ID_Insumo
            ]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'No se encontró el insumo en la receta' 
                });
            }

            res.json({ message: 'Receta actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar receta:', error);
            res.status(500).json({ message: 'Error al actualizar la receta' });
        }
    }

    // Eliminar un insumo de la receta
    static async deleteInsumo(req, res) {
        try {
            const { ID_Producto, ID_Insumo } = req.params;

            // Validar que los parámetros sean números
            if (!ID_Producto || !ID_Insumo || isNaN(ID_Producto) || isNaN(ID_Insumo)) {
                return res.status(400).json({ 
                    message: 'IDs de producto e insumo inválidos' 
                });
            }

            const query = `
                DELETE FROM recetas 
                WHERE ID_Producto = ? AND ID_Insumo = ?`;
            
            const [result] = await db.query(query, [ID_Producto, ID_Insumo]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'No se encontró el insumo en la receta' 
                });
            }

            res.json({ message: 'Insumo eliminado de la receta exitosamente' });
        } catch (error) {
            console.error('Error al eliminar insumo de receta:', error);
            res.status(500).json({ 
                message: 'Error al eliminar el insumo de la receta' 
            });
        }
    }

    // Obtener todos los productos que tienen recetas
    static async getProductosConRecetas(req, res) {
        try {
            const query = `
                SELECT DISTINCT 
                    p.ID_Producto,
                    p.Nombre,
                    p.Precio_Venta,
                    c.Nombre as Categoria,
                    p.ruta_imagen
                FROM productos_venta p
                LEFT JOIN recetas r ON p.ID_Producto = r.ID_Producto
                LEFT JOIN categorias c ON p.ID_Categoria = c.ID_Categoria
                WHERE r.ID_Producto IS NOT NULL
                ORDER BY p.Nombre`;
            
            const [productos] = await db.query(query);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos con recetas:', error);
            res.status(500).json({ 
                message: 'Error al obtener los productos con recetas' 
            });
        }
    }

    // Obtener todos los productos (para búsqueda)
    static async getAllProductos(req, res) {
        try {
            const query = `
                SELECT 
                    p.ID_Producto,
                    p.Nombre,
                    p.Precio_Venta,
                    c.Nombre as Categoria,
                    p.ruta_imagen
                FROM productos_venta p
                LEFT JOIN categorias c ON p.ID_Categoria = c.ID_Categoria
                WHERE p.Estado = 1
                ORDER BY p.Nombre`;
            
            const [productos] = await db.query(query);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ 
                message: 'Error al obtener los productos' 
            });
        }
    }

    // Obtener unidades compatibles para un insumo
    static async getUnidadesCompatibles(req, res) {
        try {
            const { insumoId } = req.params;
            
            // Obtener la unidad del insumo
            const [insumo] = await db.query(
                'SELECT Unidad FROM insumos WHERE ID_Insumo = ?',
                [insumoId]
            );

            if (insumo.length === 0) {
                return res.status(404).json({ 
                    message: 'El insumo especificado no existe' 
                });
            }

            const unidadInsumo = insumo[0].Unidad;
            const unidadesCompatibles = obtenerUnidadesCompatibles(unidadInsumo);
            
            res.json({
                unidadInsumo,
                unidadesCompatibles
            });
        } catch (error) {
            console.error('Error al obtener unidades compatibles:', error);
            res.status(500).json({ message: 'Error al obtener las unidades compatibles' });
        }
    }
}

module.exports = RecetasController; 