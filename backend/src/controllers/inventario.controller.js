const pool = require('../config/database');

const inventarioController = {
    // Obtener todo el inventario con detalles de insumos
    async getAll(req, res) {
        try {
            const [inventario] = await pool.query(`
                SELECT 
                    COALESCE(i.ID_Inventario, 0) as ID_Inventario,
                    ins.ID_Insumo,
                    ins.Nombre,
                    ins.Unidad,
                    ins.Costo,
                    p.Nombre as Nombre_Proveedor,
                    COALESCE(i.Cantidad_Disponible, 0) as Cantidad_Disponible
                FROM insumos ins
                LEFT JOIN inventario i ON ins.ID_Insumo = i.ID_Insumo
                LEFT JOIN proveedores p ON ins.ID_Proveedor = p.ID_Proveedor
                ORDER BY i.ID_Inventario
            `);
            res.json(inventario);
        } catch (error) {
            console.error('Error al obtener inventario:', error);
            res.status(500).json({ message: 'Error al obtener inventario' });
        }
    },

    // Obtener movimientos de un insumo específico
    async getMovimientosByInsumo(req, res) {
        try {
            const { idInsumo } = req.params;
            const [movimientos] = await pool.query(`
                SELECT m.*, u.Nombre as Nombre_Usuario, u.Apellido as Apellido_Usuario
                FROM movimientos_inventario m
                JOIN usuarios u ON m.ID_Usuario = u.ID_Usuario
                WHERE m.ID_Insumo = ?
                ORDER BY m.Fecha DESC
            `, [idInsumo]);
            res.json(movimientos);
        } catch (error) {
            console.error('Error al obtener movimientos:', error);
            res.status(500).json({ message: 'Error al obtener movimientos' });
        }
    },

    // Registrar un nuevo movimiento
    async registrarMovimiento(req, res) {
        try {
            const { ID_Insumo, Tipo, Cantidad, Descripcion, ID_Usuario } = req.body;
            
            // Validar datos requeridos
            if (!ID_Insumo || !Tipo || !Cantidad || !ID_Usuario) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos',
                    details: { ID_Insumo, Tipo, Cantidad, ID_Usuario }
                });
            }

            // Validar tipo de movimiento
            if (!['Entrada', 'Salida'].includes(Tipo)) {
                return res.status(400).json({ message: 'Tipo de movimiento inválido' });
            }

            // Validar cantidad positiva
            if (Cantidad <= 0) {
                return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
            }

            // Si es una salida, verificar stock suficiente
            if (Tipo === 'Salida') {
                const [inventario] = await pool.query(
                    'SELECT Cantidad_Disponible FROM inventario WHERE ID_Insumo = ?',
                    [ID_Insumo]
                );

                if (!inventario.length || inventario[0].Cantidad_Disponible < Cantidad) {
                    return res.status(400).json({ message: 'Stock insuficiente' });
                }
            }

            console.log('Registrando movimiento:', {
                ID_Insumo,
                Tipo,
                Cantidad,
                ID_Usuario,
                Descripcion
            });

            // Insertar el movimiento
            const [result] = await pool.query(
                'INSERT INTO movimientos_inventario (ID_Insumo, Tipo, Cantidad, Fecha, ID_Usuario, Descripcion) VALUES (?, ?, ?, CURDATE(), ?, ?)',
                [ID_Insumo, Tipo, Cantidad, ID_Usuario, Descripcion]
            );

            res.status(201).json({
                message: 'Movimiento registrado exitosamente',
                id: result.insertId
            });
        } catch (error) {
            console.error('Error al registrar movimiento:', error);
            res.status(500).json({ 
                message: 'Error al registrar movimiento',
                details: error.message
            });
        }
    },

    // Obtener todos los insumos disponibles
    async getInsumos(req, res) {
        try {
            const [insumos] = await pool.query(`
                SELECT i.*, p.Nombre as Nombre_Proveedor
                FROM insumos i
                JOIN proveedores p ON i.ID_Proveedor = p.ID_Proveedor
                ORDER BY i.ID_Insumo
            `);
            res.json(insumos);
        } catch (error) {
            console.error('Error al obtener insumos:', error);
            res.status(500).json({ message: 'Error al obtener insumos' });
        }
    }
};

module.exports = inventarioController; 