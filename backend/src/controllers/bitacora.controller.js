const pool = require('../config/database');

const BitacoraController = {
    // Obtener todos los registros de bitácora
    getAll: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT b.*, u.Usuario 
                FROM bitacora b
                JOIN usuarios u ON b.ID_Usuario = u.ID_Usuario
                ORDER BY b.Fecha DESC
            `);
            res.json(rows);
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