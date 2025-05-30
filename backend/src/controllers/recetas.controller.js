const db = require('../config/database');

class RecetasController {
    // Obtener la receta completa de un producto
    static async getByProductId(req, res) {
        try {
            const query = `
                SELECT 
                    r.ID_Producto,
                    r.ID_Insumo,
                    i.Nombre AS Insumo,
                    r.Cantidad_Necesaria,
                    r.Unidad
                FROM recetas r
                JOIN insumos i ON r.ID_Insumo = i.ID_Insumo
                WHERE r.ID_Producto = ?`;
            
            const [receta] = await db.query(query, [req.params.productId]);
            
            if (receta.length === 0) {
                return res.status(404).json({ message: 'No se encontró la receta para este producto' });
            }
            
            res.json(receta);
        } catch (error) {
            console.error('Error al obtener receta:', error);
            res.status(500).json({ message: 'Error al obtener la receta' });
        }
    }

    // Agregar un insumo a la receta
    static async addInsumo(req, res) {
        try {
            const { ID_Producto, ID_Insumo, Cantidad_Necesaria, Unidad } = req.body;

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

            const query = `
                INSERT INTO recetas (ID_Producto, ID_Insumo, Cantidad_Necesaria, Unidad)
                VALUES (?, ?, ?, ?)`;
            
            await db.query(query, [ID_Producto, ID_Insumo, Cantidad_Necesaria, Unidad]);
            
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

            const query = `
                UPDATE recetas 
                SET Cantidad_Necesaria = ?, Unidad = ?
                WHERE ID_Producto = ? AND ID_Insumo = ?`;
            
            const [result] = await db.query(query, [
                Cantidad_Necesaria, 
                Unidad, 
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
                    c.Nombre as Categoria
                FROM productos_venta p
                LEFT JOIN recetas r ON p.ID_Producto = r.ID_Producto
                LEFT JOIN categorias c ON p.ID_Categoria = c.ID_Categoria
                WHERE r.ID_Producto IS NOT NULL`;
            
            const [productos] = await db.query(query);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos con recetas:', error);
            res.status(500).json({ 
                message: 'Error al obtener los productos con recetas' 
            });
        }
    }
}

module.exports = RecetasController; 