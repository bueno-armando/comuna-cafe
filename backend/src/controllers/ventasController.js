const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener todas las ventas
const getVentas = async (req, res) => {
    try {
        const [ventas] = await pool.query(`
            SELECT 
                v.ID_Venta,
                v.Fecha,
                v.Total,
                v.Metodo_Pago,
                u.Usuario AS Nombre_Usuario
            FROM ventas v
            JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
            ORDER BY v.Fecha DESC
        `);
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};

// Obtener ventas por rango de fechas
const getVentasPorFecha = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        const [ventas] = await pool.query(`
            SELECT 
                v.ID_Venta,
                v.Fecha,
                v.Total,
                v.Metodo_Pago,
                u.Usuario AS Nombre_Usuario
            FROM ventas v
            JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
            WHERE v.Fecha BETWEEN ? AND ?
            ORDER BY v.Fecha DESC
        `, [fechaInicio, fechaFin]);
        
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas por fecha:', error);
        res.status(500).json({ message: 'Error al obtener ventas por fecha' });
    }
};

// Obtener detalles de una venta específica
const getDetalleVenta = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener información general de la venta
        const [venta] = await pool.query(`
            SELECT 
                v.ID_Venta,
                v.Fecha,
                v.Total,
                v.Metodo_Pago,
                u.Usuario AS Nombre_Usuario
            FROM ventas v
            JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
            WHERE v.ID_Venta = ?
        `, [id]);

        if (venta.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // Obtener detalles de los productos vendidos
        const [detalles] = await pool.query(`
            SELECT 
                p.Nombre AS Producto,
                dv.Cantidad,
                dv.Subtotal,
                (dv.Subtotal / dv.Cantidad) AS Precio_Unitario
            FROM detalle_venta dv
            JOIN productos_venta p ON dv.ID_Producto = p.ID_Producto
            WHERE dv.ID_Venta = ?
        `, [id]);

        res.json({
            venta: venta[0],
            detalles: detalles
        });
    } catch (error) {
        console.error('Error al obtener detalle de venta:', error);
        res.status(500).json({ message: 'Error al obtener detalle de venta' });
    }
};

// Exportar ventas a PDF (placeholder - implementar según necesidad)
const exportarVentasPDF = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        // Obtener datos para el PDF
        const [ventas] = await pool.query(`
            SELECT 
                v.ID_Venta,
                v.Fecha,
                v.Total,
                v.Metodo_Pago,
                u.Usuario AS Nombre_Usuario
            FROM ventas v
            JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
            WHERE v.Fecha BETWEEN ? AND ?
            ORDER BY v.Fecha DESC
        `, [fechaInicio, fechaFin]);

        // TODO: Implementar generación de PDF
        res.json({ message: 'Función de exportación a PDF pendiente de implementar' });
    } catch (error) {
        console.error('Error al exportar ventas a PDF:', error);
        res.status(500).json({ message: 'Error al exportar ventas a PDF' });
    }
};

// Exportar ventas a Excel (placeholder - implementar según necesidad)
const exportarVentasExcel = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        // Obtener datos para el Excel
        const [ventas] = await pool.query(`
            SELECT 
                v.ID_Venta,
                v.Fecha,
                v.Total,
                v.Metodo_Pago,
                u.Usuario AS Nombre_Usuario
            FROM ventas v
            JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
            WHERE v.Fecha BETWEEN ? AND ?
            ORDER BY v.Fecha DESC
        `, [fechaInicio, fechaFin]);

        // TODO: Implementar generación de Excel
        res.json({ message: 'Función de exportación a Excel pendiente de implementar' });
    } catch (error) {
        console.error('Error al exportar ventas a Excel:', error);
        res.status(500).json({ message: 'Error al exportar ventas a Excel' });
    }
};

module.exports = {
    getVentas,
    getVentasPorFecha,
    getDetalleVenta,
    exportarVentasPDF,
    exportarVentasExcel
}; 