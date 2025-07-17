// Controlador para el módulo de reportes

const pool = require('../config/database');

const generarReporte = async (req, res) => {
  try {
    const { tipo, fecha_inicio, fecha_fin } = req.body;
    if (!tipo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: 'Faltan datos requeridos: tipo, fecha_inicio, fecha_fin' });
    }
    // Llamar al procedimiento almacenado
    await pool.query('CALL generar_reporte(?, ?, ?)', [tipo, fecha_inicio, fecha_fin]);
    // Obtener el último reporte insertado (por fechas y tipo)
    const [rows] = await pool.query(
      'SELECT * FROM reportes WHERE Tipo = ? AND Fecha_Inicio = ? AND Fecha_Fin = ? ORDER BY ID_Reporte DESC LIMIT 1',
      [tipo, fecha_inicio, fecha_fin]
    );
    if (!rows.length) {
      return res.status(500).json({ message: 'No se pudo generar el reporte' });
    }
    res.status(201).json({
      message: 'Reporte generado exitosamente',
      reporte: rows[0]
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ message: 'Error al generar reporte', error: error.message });
  }
};

const listarReportes = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      tipo,
      fechaInicio,
      fechaFin
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM reportes';
    let countQuery = 'SELECT COUNT(*) as total FROM reportes';
    let whereConditions = [];
    let params = [];
    let countParams = [];

    if (tipo) {
      whereConditions.push('Tipo = ?');
      params.push(tipo);
      countParams.push(tipo);
    }
    if (fechaInicio && fechaFin) {
      whereConditions.push('Fecha_Inicio >= ? AND Fecha_Fin <= ?');
      params.push(fechaInicio, fechaFin);
      countParams.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      whereConditions.push('Fecha_Inicio >= ?');
      params.push(fechaInicio);
      countParams.push(fechaInicio);
    } else if (fechaFin) {
      whereConditions.push('Fecha_Fin <= ?');
      params.push(fechaFin);
      countParams.push(fechaFin);
    }

    if (whereConditions.length > 0) {
      const whereStr = ' WHERE ' + whereConditions.join(' AND ');
      query += whereStr;
      countQuery += whereStr;
    }

    query += ' ORDER BY Fecha_Inicio DESC, ID_Reporte DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Ejecutar consulta principal
    const [reportes] = await pool.query(query, params);
    // Ejecutar consulta de conteo
    const [countRows] = await pool.query(countQuery, countParams);
    const totalRegistros = countRows[0]?.total || 0;
    const totalPages = Math.ceil(totalRegistros / limit);

    res.json({
      reportes,
      totalRegistros,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error al listar reportes:', error);
    res.status(500).json({ message: 'Error al listar reportes', error: error.message });
  }
};

const detalleReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM reportes WHERE ID_Reporte = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.json({ reporte: rows[0] });
  } catch (error) {
    console.error('Error al obtener detalle de reporte:', error);
    res.status(500).json({ message: 'Error al obtener detalle de reporte', error: error.message });
  }
};

const ventasReporte = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener fechas del reporte
    const [reporteRows] = await pool.query('SELECT Fecha_Inicio, Fecha_Fin FROM reportes WHERE ID_Reporte = ?', [id]);
    if (!reporteRows.length) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    const { Fecha_Inicio, Fecha_Fin } = reporteRows[0];
    // Consultar ventas en el rango
    const [ventas] = await pool.query(
      `SELECT v.ID_Venta, v.Fecha, v.Total, v.Metodo_Pago, u.Usuario
       FROM ventas v
       JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
       WHERE v.Fecha BETWEEN ? AND ?
       ORDER BY v.Fecha DESC, v.ID_Venta DESC`,
      [Fecha_Inicio, Fecha_Fin]
    );
    res.json({ ventas });
  } catch (error) {
    console.error('Error al obtener ventas del reporte:', error);
    res.status(500).json({ message: 'Error al obtener ventas del reporte', error: error.message });
  }
};

const gastosReporte = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener fechas del reporte
    const [reporteRows] = await pool.query('SELECT Fecha_Inicio, Fecha_Fin FROM reportes WHERE ID_Reporte = ?', [id]);
    if (!reporteRows.length) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    const { Fecha_Inicio, Fecha_Fin } = reporteRows[0];
    // Consultar gastos en el rango
    const [gastos] = await pool.query(
      `SELECT g.ID_Gasto, g.Descripcion, g.Monto, g.Fecha, u.Usuario
       FROM gastos g
       JOIN usuarios u ON g.ID_Usuario = u.ID_Usuario
       WHERE g.Fecha BETWEEN ? AND ?
       ORDER BY g.Fecha DESC, g.ID_Gasto DESC`,
      [Fecha_Inicio, Fecha_Fin]
    );
    res.json({ gastos });
  } catch (error) {
    console.error('Error al obtener gastos del reporte:', error);
    res.status(500).json({ message: 'Error al obtener gastos del reporte', error: error.message });
  }
};

const productoMasVendido = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener fechas del reporte
    const [reporteRows] = await pool.query('SELECT Fecha_Inicio, Fecha_Fin FROM reportes WHERE ID_Reporte = ?', [id]);
    if (!reporteRows.length) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    const { Fecha_Inicio, Fecha_Fin } = reporteRows[0];
    // Consultar producto más vendido
    const [rows] = await pool.query(
      `SELECT p.Nombre, SUM(dv.Cantidad) AS TotalVendido
       FROM detalle_venta dv
       JOIN productos_venta p ON dv.ID_Producto = p.ID_Producto
       JOIN ventas v ON dv.ID_Venta = v.ID_Venta
       WHERE v.Fecha BETWEEN ? AND ?
       GROUP BY p.Nombre
       ORDER BY TotalVendido DESC
       LIMIT 1`,
      [Fecha_Inicio, Fecha_Fin]
    );
    if (!rows.length) {
      return res.json({ producto: null, TotalVendido: 0 });
    }
    res.json({ producto: rows[0].Nombre, TotalVendido: rows[0].TotalVendido });
  } catch (error) {
    console.error('Error al obtener producto más vendido:', error);
    res.status(500).json({ message: 'Error al obtener producto más vendido', error: error.message });
  }
};

const diaMasVentas = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener fechas del reporte
    const [reporteRows] = await pool.query('SELECT Fecha_Inicio, Fecha_Fin FROM reportes WHERE ID_Reporte = ?', [id]);
    if (!reporteRows.length) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    const { Fecha_Inicio, Fecha_Fin } = reporteRows[0];
    // Consultar día con más ventas
    const [rows] = await pool.query(
      `SELECT Fecha, SUM(Total) AS TotalDia
       FROM ventas
       WHERE Fecha BETWEEN ? AND ?
       GROUP BY Fecha
       ORDER BY TotalDia DESC
       LIMIT 1`,
      [Fecha_Inicio, Fecha_Fin]
    );
    if (!rows.length) {
      return res.json({ fecha: null, TotalDia: 0 });
    }
    res.json({ fecha: rows[0].Fecha, TotalDia: rows[0].TotalDia });
  } catch (error) {
    console.error('Error al obtener día con más ventas:', error);
    res.status(500).json({ message: 'Error al obtener día con más ventas', error: error.message });
  }
};

module.exports = {
  generarReporte,
  listarReportes,
  detalleReporte,
  ventasReporte,
  gastosReporte,
  productoMasVendido,
  diaMasVentas,
}; 