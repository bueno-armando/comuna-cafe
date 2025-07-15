const pool = require('../config/database');

const BitacoraController = {
    // Obtener todos los registros de bitácora con filtros y paginación
    getAll: async (req, res) => {
        try {
            let {
                page = 1,
                limit = 11,
                usuario,
                operacion,
                descripcion,
                fechaInicio,
                fechaFin
            } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);
            const offset = (page - 1) * limit;

            let query = `
                SELECT b.*, u.Usuario 
                FROM bitacora b
                JOIN usuarios u ON b.ID_Usuario = u.ID_Usuario
            `;
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM bitacora b
                JOIN usuarios u ON b.ID_Usuario = u.ID_Usuario
            `;
            let whereConditions = [];
            let params = [];
            let countParams = [];

            // Filtro por usuario (nombre LIKE o ID exacto)
            if (usuario) {
                if (!isNaN(usuario)) {
                    whereConditions.push('b.ID_Usuario = ?');
                    params.push(usuario);
                    countParams.push(usuario);
                } else {
                    whereConditions.push('u.Usuario LIKE ?');
                    params.push(`%${usuario}%`);
                    countParams.push(`%${usuario}%`);
                }
            }

            // Filtro por operación
            if (operacion) {
                whereConditions.push('b.Operacion LIKE ?');
                params.push(`%${operacion}%`);
                countParams.push(`%${operacion}%`);
            }

            // Filtro por descripción
            if (descripcion) {
                whereConditions.push('b.Descripcion LIKE ?');
                params.push(`%${descripcion}%`);
                countParams.push(`%${descripcion}%`);
            }

            // Filtros de fecha
            if (fechaInicio && fechaFin) {
                whereConditions.push('b.Fecha BETWEEN ? AND ?');
                params.push(fechaInicio, fechaFin);
                countParams.push(fechaInicio, fechaFin);
            } else if (fechaInicio) {
                whereConditions.push('b.Fecha >= ?');
                params.push(fechaInicio);
                countParams.push(fechaInicio);
            } else if (fechaFin) {
                whereConditions.push('b.Fecha <= ?');
                params.push(fechaFin);
                countParams.push(fechaFin);
            }

            if (whereConditions.length > 0) {
                const whereStr = ' WHERE ' + whereConditions.join(' AND ');
                query += whereStr;
                countQuery += whereStr;
            }

            query += ' ORDER BY b.Fecha DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Ejecutar consulta principal
            const [registros] = await pool.query(query, params);
            // Ejecutar consulta de conteo
            const [countRows] = await pool.query(countQuery, countParams);
            const totalRegistros = countRows[0]?.total || 0;
            const totalPages = Math.ceil(totalRegistros / limit);

            res.json({
                registros,
                totalRegistros,
                totalPages,
                currentPage: page,
                limit
            });
        } catch (error) {
            console.error('Error al obtener registros de bitácora:', error);
            res.status(500).json({ message: 'Error al obtener registros de bitácora' });
        }
    },

    // Obtener registros de bitácora por tabla
    getByTable: async (req, res) => {
        try {
            const { tabla } = req.params;
            const [rows] = await pool.query(`
                SELECT b.*, u.Usuario 
                FROM bitacora b
                JOIN usuarios u ON b.ID_Usuario = u.ID_Usuario
                WHERE b.Tabla_Modificada = ?
                ORDER BY b.Fecha DESC
            `, [tabla]);
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener registros de bitácora por tabla:', error);
            res.status(500).json({ message: 'Error al obtener registros de bitácora por tabla' });
        }
    },

    // Obtener registros de bitácora por usuario
    getByUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const [rows] = await pool.query(`
                SELECT b.*, u.Usuario 
                FROM bitacora b
                JOIN usuarios u ON b.ID_Usuario = u.ID_Usuario
                WHERE b.ID_Usuario = ?
                ORDER BY b.Fecha DESC
            `, [userId]);
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener registros de bitácora por usuario:', error);
            res.status(500).json({ message: 'Error al obtener registros de bitácora por usuario' });
        }
    },

    // Obtener registros de bitácora por rango de fechas
    getByDateRange: async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const [rows] = await pool.query(`
                SELECT b.*, u.Usuario 
                FROM bitacora b
                JOIN usuarios u ON b.ID_Usuario = u.ID_Usuario
                WHERE b.Fecha BETWEEN ? AND ?
                ORDER BY b.Fecha DESC
            `, [fechaInicio, fechaFin]);
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener registros de bitácora por rango de fechas:', error);
            res.status(500).json({ message: 'Error al obtener registros de bitácora por rango de fechas' });
        }
    }
};

module.exports = BitacoraController; 