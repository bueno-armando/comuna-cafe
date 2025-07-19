const pool = require('../config/database');

const gastosController = {
    // Obtener todos los gastos con información del usuario y paginación
    async getAll(req, res) {
        try {
            const { 
                fechaInicio, 
                fechaFin, 
                descripcion, 
                page = 1, 
                limit = 8 
            } = req.query;
            
            // Validar parámetros de paginación
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            if (pageNum < 1 || limitNum < 1) {
                return res.status(400).json({ 
                    message: 'Los parámetros page y limit deben ser números positivos' 
                });
            }
            
            // Calcular offset
            const offset = (pageNum - 1) * limitNum;
            
            let baseQuery = `
                FROM gastos g
                JOIN usuarios u ON g.ID_Usuario = u.ID_Usuario
            `;
            let params = [];
            let whereConditions = [];
            
            // Aplicar filtros de fecha
            if (fechaInicio && fechaFin) {
                // Ambas fechas: rango completo
                whereConditions.push(`g.Fecha BETWEEN ? AND ?`);
                params.push(fechaInicio, fechaFin);
            } else if (fechaInicio) {
                // Solo fecha inicio: desde X hasta cualquier fecha
                whereConditions.push(`g.Fecha >= ?`);
                params.push(fechaInicio);
            } else if (fechaFin) {
                // Solo fecha fin: desde cualquier fecha hasta Y
                whereConditions.push(`g.Fecha <= ?`);
                params.push(fechaFin);
            }
            
            // Aplicar filtro de descripción
            if (descripcion) {
                whereConditions.push(`g.Descripcion LIKE ?`);
                params.push(`%${descripcion}%`);
            }
            
            // Construir WHERE si hay condiciones
            if (whereConditions.length > 0) {
                baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            }
            
            // Query para contar total de registros
            const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
            const [countResult] = await pool.query(countQuery, params);
            const totalRegistros = countResult[0].total;
            
            // Query para obtener registros paginados
            const dataQuery = `
                SELECT g.*, u.Usuario as Nombre_Usuario 
                ${baseQuery}
                ORDER BY g.Fecha DESC
                LIMIT ? OFFSET ?
            `;
            
            // Agregar parámetros de paginación
            const queryParams = [...params, limitNum, offset];
            
            console.log('Query SQL (datos):', dataQuery);
            console.log('Parámetros (datos):', queryParams);
            
            const [gastos] = await pool.query(dataQuery, queryParams);
            
            // Calcular información de paginación
            const totalPages = Math.ceil(totalRegistros / limitNum);
            
            res.json({
                gastos,
                totalRegistros,
                totalPages,
                currentPage: pageNum,
                limit: limitNum
            });
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            res.status(500).json({ message: 'Error al obtener gastos' });
        }
    },

    // Obtener un gasto por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            
            const [gastos] = await pool.query(`
                SELECT g.*, u.Usuario as Nombre_Usuario
                FROM gastos g
                JOIN usuarios u ON g.ID_Usuario = u.ID_Usuario
                WHERE g.ID_Gasto = ?
            `, [id]);
            
            if (gastos.length === 0) {
                return res.status(404).json({ message: 'Gasto no encontrado' });
            }
            
            res.json(gastos[0]);
        } catch (error) {
            console.error('Error al obtener gasto:', error);
            res.status(500).json({ message: 'Error al obtener gasto' });
        }
    },

    // Crear un nuevo gasto
    async create(req, res) {
        try {
            const { Descripcion, Monto, Fecha, ID_Usuario } = req.body;
            
            // Validar datos requeridos
            if (!Descripcion || !Monto || !Fecha || !ID_Usuario) {
                return res.status(400).json({ 
                    message: 'Todos los campos son requeridos: Descripcion, Monto, Fecha, ID_Usuario' 
                });
            }
            
            // Validar monto positivo
            if (Monto <= 0) {
                return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
            }
            
            // Validar fecha (no permitir fechas futuras)
            const fechaGasto = new Date(Fecha);
            const fechaActual = new Date();
            if (fechaGasto > fechaActual) {
                return res.status(400).json({ message: 'No se pueden registrar gastos con fecha futura' });
            }
            
            // Insertar el gasto
            const [result] = await pool.query(
                'INSERT INTO gastos (Descripcion, Monto, Fecha, ID_Usuario) VALUES (?, ?, ?, ?)',
                [Descripcion, Monto, Fecha, ID_Usuario]
            );
            
            res.status(201).json({
                message: 'Gasto registrado exitosamente',
                id: result.insertId
            });
        } catch (error) {
            console.error('Error al crear gasto:', error);
            res.status(500).json({ 
                message: 'Error al crear gasto',
                details: error.message
            });
        }
    },

    // Actualizar un gasto existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const { Descripcion, Monto, Fecha } = req.body;
            
            // Validar datos requeridos
            if (!Descripcion || !Monto || !Fecha) {
                return res.status(400).json({ 
                    message: 'Todos los campos son requeridos: Descripcion, Monto, Fecha' 
                });
            }
            
            // Validar monto positivo
            if (Monto <= 0) {
                return res.status(400).json({ message: 'El monto debe ser mayor a 0' });
            }
            
            // Validar fecha (no permitir fechas futuras)
            const fechaGasto = new Date(Fecha);
            const fechaActual = new Date();
            if (fechaGasto > fechaActual) {
                return res.status(400).json({ message: 'No se pueden registrar gastos con fecha futura' });
            }
            
            // Verificar que el gasto existe
            const [existingGasto] = await pool.query(
                'SELECT ID_Gasto FROM gastos WHERE ID_Gasto = ?',
                [id]
            );
            
            if (existingGasto.length === 0) {
                return res.status(404).json({ message: 'Gasto no encontrado' });
            }
            
            // Actualizar el gasto
            const [result] = await pool.query(
                'UPDATE gastos SET Descripcion = ?, Monto = ?, Fecha = ? WHERE ID_Gasto = ?',
                [Descripcion, Monto, Fecha, id]
            );
            
            res.json({
                message: 'Gasto actualizado exitosamente',
                id: id
            });
        } catch (error) {
            console.error('Error al actualizar gasto:', error);
            res.status(500).json({ 
                message: 'Error al actualizar gasto',
                details: error.message
            });
        }
    },

    // Eliminar un gasto
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que el gasto existe
            const [existingGasto] = await pool.query(
                'SELECT ID_Gasto, Fecha FROM gastos WHERE ID_Gasto = ?',
                [id]
            );
            
            if (existingGasto.length === 0) {
                return res.status(404).json({ message: 'Gasto no encontrado' });
            }
            
            // Validación adicional: no permitir eliminar gastos muy antiguos (ej. más de 30 días)
            const fechaGasto = new Date(existingGasto[0].Fecha);
            const fechaActual = new Date();
            const diasDiferencia = (fechaActual - fechaGasto) / (1000 * 60 * 60 * 24);
            
            if (diasDiferencia > 30) {
                return res.status(400).json({ 
                    message: 'No se puede eliminar gastos con más de 30 días de antigüedad' 
                });
            }
            
            // Eliminar el gasto
            const [result] = await pool.query(
                'DELETE FROM gastos WHERE ID_Gasto = ?',
                [id]
            );
            
            res.json({
                message: 'Gasto eliminado exitosamente',
                id: id
            });
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            res.status(500).json({ 
                message: 'Error al eliminar gasto',
                details: error.message
            });
        }
    },

    // Calcular total de gastos en un período
    async getTotalByPeriod(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ 
                    message: 'Se requieren fechaInicio y fechaFin' 
                });
            }
            
            const [result] = await pool.query(`
                SELECT SUM(Monto) as TotalGastos, COUNT(*) as CantidadGastos
                FROM gastos
                WHERE Fecha BETWEEN ? AND ?
            `, [fechaInicio, fechaFin]);
            
            const total = result[0].TotalGastos || 0;
            const cantidad = result[0].CantidadGastos || 0;
            
            res.json({
                totalGastos: total,
                cantidadGastos: cantidad,
                fechaInicio,
                fechaFin
            });
        } catch (error) {
            console.error('Error al calcular total de gastos:', error);
            res.status(500).json({ message: 'Error al calcular total de gastos' });
        }
    },

    // Obtener estadísticas de gastos
    async getStats(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            
            let whereClause = '';
            let params = [];
            
            if (fechaInicio && fechaFin) {
                whereClause = 'WHERE Fecha BETWEEN ? AND ?';
                params = [fechaInicio, fechaFin];
            }
            
            const [stats] = await pool.query(`
                SELECT 
                    SUM(Monto) as TotalGastos,
                    COUNT(*) as CantidadGastos,
                    AVG(Monto) as PromedioGastos,
                    MIN(Monto) as GastoMinimo,
                    MAX(Monto) as GastoMaximo
                FROM gastos
                ${whereClause}
            `, params);
            
            res.json(stats[0]);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ message: 'Error al obtener estadísticas' });
        }
    }
};

module.exports = gastosController; 