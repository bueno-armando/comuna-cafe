const pool = require('../config/database');

const productosController = {
    // Obtener todos los productos activos con sus categorías
    async getAll(req, res) {
        try {
            const [productos] = await pool.query(`
                SELECT 
                    p.ID_Producto,
                    p.Nombre AS Producto,
                    p.ID_Categoria,
                    c.Nombre AS Categoria,
                    p.Precio_Venta,
                    p.Estado,
                    p.ruta_imagen
                FROM productos_venta p
                JOIN categorias c ON p.ID_Categoria = c.ID_Categoria
                WHERE p.Estado = 1
                ORDER BY p.ID_Producto
            `);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ message: 'Error al obtener productos' });
        }
    },

    // Obtener todos los productos inactivos
    async getInactivos(req, res) {
        try {
            const [productos] = await pool.query(`
                SELECT 
                    p.ID_Producto,
                    p.Nombre AS Producto,
                    p.ID_Categoria,
                    c.Nombre AS Categoria,
                    p.Precio_Venta,
                    p.Estado,
                    p.ruta_imagen
                FROM productos_venta p
                JOIN categorias c ON p.ID_Categoria = c.ID_Categoria
                WHERE p.Estado = 0
                ORDER BY p.ID_Producto
            `);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos inactivos:', error);
            res.status(500).json({ message: 'Error al obtener productos inactivos' });
        }
    },

    // Desactivar producto (soft delete)
    async desactivar(req, res) {
        try {
            const { id } = req.params;
            const [result] = await pool.query(
                'UPDATE productos_venta SET Estado = 0 WHERE ID_Producto = ?',
                [id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.json({ message: 'Producto desactivado exitosamente', id });
        } catch (error) {
            console.error('Error al desactivar producto:', error);
            res.status(500).json({ message: 'Error al desactivar producto', details: error.message });
        }
    },

    // Activar producto
    async activar(req, res) {
        try {
            const { id } = req.params;
            const [result] = await pool.query(
                'UPDATE productos_venta SET Estado = 1 WHERE ID_Producto = ?',
                [id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.json({ message: 'Producto activado exitosamente', id });
        } catch (error) {
            console.error('Error al activar producto:', error);
            res.status(500).json({ message: 'Error al activar producto', details: error.message });
        }
    },

    // Obtener todas las categorías
    async getCategorias(req, res) {
        try {
            const [categorias] = await pool.query('SELECT ID_Categoria, Nombre FROM categorias');
            res.json(categorias);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({ message: 'Error al obtener categorías' });
        }
    },

    // Agregar nuevo producto
    async create(req, res) {
        try {
            const { Nombre, ID_Categoria, Precio_Venta, ruta_imagen } = req.body;

            // Validar datos requeridos
            if (!Nombre || !ID_Categoria || !Precio_Venta) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos',
                    details: { Nombre, ID_Categoria, Precio_Venta }
                });
            }

            // Validar precio positivo
            if (Precio_Venta <= 0) {
                return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
            }

            // Insertar el producto
            const [result] = await pool.query(
                'INSERT INTO productos_venta (Nombre, ID_Categoria, Precio_Venta, ruta_imagen) VALUES (?, ?, ?, ?)',
                [Nombre, ID_Categoria, Precio_Venta, ruta_imagen || null]
            );

            res.status(201).json({
                message: 'Producto registrado exitosamente',
                id: result.insertId
            });
        } catch (error) {
            console.error('Error al registrar producto:', error);
            res.status(500).json({ 
                message: 'Error al registrar producto',
                details: error.message
            });
        }
    },

    // Actualizar producto existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const { Nombre, ID_Categoria, Precio_Venta, ruta_imagen } = req.body;

            // Validar datos requeridos
            if (!Nombre || !ID_Categoria || !Precio_Venta) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos',
                    details: { Nombre, ID_Categoria, Precio_Venta }
                });
            }

            // Validar precio positivo
            if (Precio_Venta <= 0) {
                return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
            }

            // Actualizar el producto
            const [result] = await pool.query(
                'UPDATE productos_venta SET Nombre = ?, ID_Categoria = ?, Precio_Venta = ?, ruta_imagen = ? WHERE ID_Producto = ?',
                [Nombre, ID_Categoria, Precio_Venta, ruta_imagen || null, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            res.json({
                message: 'Producto actualizado exitosamente',
                id: id
            });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ 
                message: 'Error al actualizar producto',
                details: error.message
            });
        }
    },

    // Eliminar producto
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el producto tiene registros en ventas o recetas
            const [ventas] = await pool.query(
                'SELECT 1 FROM detalle_venta WHERE ID_Producto = ? LIMIT 1',
                [id]
            );

            const [recetas] = await pool.query(
                'SELECT 1 FROM recetas WHERE ID_Producto = ? LIMIT 1',
                [id]
            );

            if (ventas.length > 0 || recetas.length > 0) {
                return res.status(400).json({ 
                    message: 'No se puede eliminar el producto porque tiene registros asociados en ventas o recetas'
                });
            }

            // Eliminar el producto
            const [result] = await pool.query(
                'DELETE FROM productos_venta WHERE ID_Producto = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            res.json({
                message: 'Producto eliminado exitosamente',
                id: id
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ 
                message: 'Error al eliminar producto',
                details: error.message
            });
        }
    },

    // Agregar nueva categoría
    async createCategoria(req, res) {
        try {
            const { Nombre } = req.body;

            if (!Nombre) {
                return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
            }

            const [result] = await pool.query(
                'INSERT INTO categorias (Nombre) VALUES (?)',
                [Nombre]
            );

            res.status(201).json({
                message: 'Categoría registrada exitosamente',
                id: result.insertId
            });
        } catch (error) {
            console.error('Error al registrar categoría:', error);
            res.status(500).json({ 
                message: 'Error al registrar categoría',
                details: error.message
            });
        }
    },

    // Actualizar categoría existente
    async updateCategoria(req, res) {
        try {
            const { id } = req.params;
            const { Nombre } = req.body;

            if (!Nombre) {
                return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
            }

            // Actualizar la categoría
            const [result] = await pool.query(
                'UPDATE categorias SET Nombre = ? WHERE ID_Categoria = ?',
                [Nombre, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }

            res.json({
                message: 'Categoría actualizada exitosamente',
                id: id
            });
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            res.status(500).json({ 
                message: 'Error al actualizar categoría',
                details: error.message
            });
        }
    },

    // Eliminar categoría
    async deleteCategoria(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la categoría tiene productos asociados
            const [productos] = await pool.query(
                'SELECT 1 FROM productos_venta WHERE ID_Categoria = ? LIMIT 1',
                [id]
            );

            if (productos.length > 0) {
                return res.status(400).json({ 
                    message: 'No se puede eliminar la categoría porque tiene productos asociados'
                });
            }

            // Eliminar la categoría
            const [result] = await pool.query(
                'DELETE FROM categorias WHERE ID_Categoria = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }

            res.json({
                message: 'Categoría eliminada exitosamente',
                id: id
            });
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            res.status(500).json({ 
                message: 'Error al eliminar categoría',
                details: error.message
            });
        }
    }
};

module.exports = productosController; 