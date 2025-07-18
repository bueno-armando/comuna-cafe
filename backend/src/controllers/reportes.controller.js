// Controlador para el módulo de reportes

const pool = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

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

const exportarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener datos del reporte
    const [reporteRows] = await pool.query('SELECT * FROM reportes WHERE ID_Reporte = ?', [id]);
    if (!reporteRows.length) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    const reporte = reporteRows[0];
    // Obtener ventas del reporte
    const [ventas] = await pool.query(
      `SELECT v.ID_Venta, v.Fecha, v.Total, v.Metodo_Pago, u.Usuario
       FROM ventas v
       JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
       WHERE v.Fecha BETWEEN ? AND ?
       ORDER BY v.Fecha DESC, v.ID_Venta DESC`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    // Obtener gastos del reporte
    const [gastos] = await pool.query(
      `SELECT g.ID_Gasto, g.Descripcion, g.Monto, g.Fecha, u.Usuario
       FROM gastos g
       JOIN usuarios u ON g.ID_Usuario = u.ID_Usuario
       WHERE g.Fecha BETWEEN ? AND ?
       ORDER BY g.Fecha DESC, g.ID_Gasto DESC`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    // Obtener producto más vendido
    const [productoMasVendido] = await pool.query(
      `SELECT p.Nombre, SUM(dv.Cantidad) AS TotalVendido
       FROM detalle_venta dv
       JOIN productos_venta p ON dv.ID_Producto = p.ID_Producto
       JOIN ventas v ON dv.ID_Venta = v.ID_Venta
       WHERE v.Fecha BETWEEN ? AND ?
       GROUP BY p.Nombre
       ORDER BY TotalVendido DESC
       LIMIT 1`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    // Obtener día con más ventas
    const [diaMasVentas] = await pool.query(
      `SELECT Fecha, SUM(Total) AS TotalDia
       FROM ventas
       WHERE Fecha BETWEEN ? AND ?
       GROUP BY Fecha
       ORDER BY TotalDia DESC
       LIMIT 1`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    // Crear el documento PDF
    const doc = new PDFDocument();
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.Tipo}_${reporte.Fecha_Inicio}_${reporte.Fecha_Fin}.pdf"`);
    // Pipe el PDF a la respuesta
    doc.pipe(res);
    // Generar contenido del PDF
    generarContenidoPDF(doc, reporte, ventas, gastos, productoMasVendido[0], diaMasVentas[0]);
    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).json({ message: 'Error al exportar PDF', error: error.message });
  }
};

// Función auxiliar para generar el contenido del PDF
const generarContenidoPDF = (doc, reporte, ventas, gastos, productoMasVendido, diaMasVentas) => {
  const tituloFont = 18;
  const subtituloFont = 14;
  const textoFont = 12;
  const margen = 50;
  let y = margen;

  // Logo (busca primero en frontend, luego en backend)
  let logoPath = path.resolve(__dirname, '../../../frontend/cafe-logo-transparent.png');
  /*if (!fs.existsSync(logoPath)) {
    logoPath = path.resolve(__dirname, '../cafe-logo-transparent.png');
  }*/
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, doc.page.width / 2 - 50, y, { width: 100, align: 'center' });
    y += 120; // Más espacio después del logo
  }

  // Título principal
  doc.fontSize(tituloFont)
     .font('Helvetica-Bold')
     .text('LA COMUNA CAFÉ', margen, y, { align: 'center' });
  y += 30;
  // Subtítulo del reporte
  doc.fontSize(subtituloFont)
     .font('Helvetica-Bold')
     .text(`Reporte ${reporte.Tipo}`, margen, y, { align: 'center' });
  y += 25;
  // Información del periodo
  doc.fontSize(textoFont)
     .font('Helvetica')
     .text(`Periodo: ${new Date(reporte.Fecha_Inicio).toLocaleDateString('es-MX')} - ${new Date(reporte.Fecha_Fin).toLocaleDateString('es-MX')}`, margen, y);
  y += 20;
  // Fecha de generación del reporte
  const fechaGen = new Date();
  const fechaStr = fechaGen.toLocaleDateString('es-MX');
  const horaStr = fechaGen.toLocaleTimeString('es-MX');
  doc.fontSize(textoFont)
     .font('Helvetica')
     .fillColor('black')
     .text(`Generado el: ${fechaStr} a las ${horaStr}`, margen, y);
  y += 20;
  // Resumen financiero
  doc.fontSize(subtituloFont)
     .font('Helvetica-Bold')
     .fillColor('black')
     .text('Resumen Financiero', margen, y);
  y += 20;
  doc.fontSize(textoFont)
     .font('Helvetica')
     .text(`Total Ventas: $${parseFloat(reporte.Total_Ventas).toFixed(2)}`, margen, y);
  y += 15;
  doc.text(`Total Gastos: $${parseFloat(reporte.Total_Gastos).toFixed(2)}`, margen, y);
  y += 15;
  doc.font('Helvetica-Bold')
     .text(`Ganancia Neta: $${parseFloat(reporte.Ganancia).toFixed(2)}`, margen, y);
  y += 30;
  // Ventas
  if (ventas.length > 0) {
    doc.fontSize(subtituloFont)
       .font('Helvetica-Bold')
       .text('Ventas del Periodo', margen, y);
    y += 20;
    // Encabezados de tabla
    const colWidth = 100;
    const x1 = margen;
    const x2 = x1 + colWidth;
    const x3 = x2 + colWidth;
    const x4 = x3 + colWidth;
    doc.fontSize(textoFont)
       .font('Helvetica-Bold')
       .text('Fecha', x1, y)
       .text('Total', x2, y)
       .text('Método', x3, y)
       .text('Usuario', x4, y);
    y += 15;
    // Datos de ventas
    doc.font('Helvetica');
    ventas.forEach(venta => {
      if (y > 700) { // Volver al límite original
        doc.addPage();
        y = margen;
      }
      doc.text(new Date(venta.Fecha).toLocaleDateString('es-MX'), x1, y)
         .text(`$${parseFloat(venta.Total).toFixed(2)}`, x2, y)
         .text(venta.Metodo_Pago, x3, y)
         .text(venta.Usuario, x4, y);
      y += 15;
    });
    y += 20;
  }
  // Gastos
  if (gastos.length > 0) {
    doc.fontSize(subtituloFont)
       .font('Helvetica-Bold')
       .text('Gastos del Periodo', margen, y);
    y += 20;
    // Encabezados de tabla
    const colWidth = 120;
    const x1 = margen;
    const x2 = x1 + colWidth;
    const x3 = x2 + colWidth;
    const x4 = x3 + colWidth;
    doc.fontSize(textoFont)
       .font('Helvetica-Bold')
       .text('Fecha', x1, y)
       .text('Descripción', x2, y)
       .text('Monto', x3, y)
       .text('Usuario', x4, y);
    y += 15;
    // Datos de gastos
    doc.font('Helvetica');
    gastos.forEach(gasto => {
      if (y > 700) { // Volver al límite original
        doc.addPage();
        y = margen;
      }
      doc.text(new Date(gasto.Fecha).toLocaleDateString('es-MX'), x1, y)
         .text(gasto.Descripcion.substring(0, 30), x2, y) // Limitar descripción
         .text(`$${parseFloat(gasto.Monto).toFixed(2)}`, x3, y)
         .text(gasto.Usuario, x4, y);
      y += 15;
    });
    y += 20;
  }
  // Estadísticas adicionales
  doc.fontSize(subtituloFont)
     .font('Helvetica-Bold')
     .text('Estadísticas Adicionales', margen, y);
  y += 20;
  doc.fontSize(textoFont)
     .font('Helvetica');
  if (productoMasVendido) {
    doc.text(`Producto más vendido: ${productoMasVendido.Nombre} (${productoMasVendido.TotalVendido} unidades)`, margen, y);
    y += 15;
  }
  if (diaMasVentas) {
    doc.text(`Día con más ventas: ${new Date(diaMasVentas.Fecha).toLocaleDateString('es-MX')} ($${parseFloat(diaMasVentas.TotalDia).toFixed(2)})`, margen, y);
    y += 15;
  }
};

const exportarExcel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener datos del reporte
    const [reporteRows] = await pool.query('SELECT * FROM reportes WHERE ID_Reporte = ?', [id]);
    if (!reporteRows.length) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    const reporte = reporteRows[0];
    
    // Obtener ventas del reporte
    const [ventas] = await pool.query(
      `SELECT v.ID_Venta, v.Fecha, v.Total, v.Metodo_Pago, u.Usuario
       FROM ventas v
       JOIN usuarios u ON v.ID_Usuario = u.ID_Usuario
       WHERE v.Fecha BETWEEN ? AND ?
       ORDER BY v.Fecha DESC, v.ID_Venta DESC`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    
    // Obtener gastos del reporte
    const [gastos] = await pool.query(
      `SELECT g.ID_Gasto, g.Descripcion, g.Monto, g.Fecha, u.Usuario
       FROM gastos g
       JOIN usuarios u ON g.ID_Usuario = u.ID_Usuario
       WHERE g.Fecha BETWEEN ? AND ?
       ORDER BY g.Fecha DESC, g.ID_Gasto DESC`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    
    // Obtener producto más vendido
    const [productoMasVendido] = await pool.query(
      `SELECT p.Nombre, SUM(dv.Cantidad) AS TotalVendido
       FROM detalle_venta dv
       JOIN productos_venta p ON dv.ID_Producto = p.ID_Producto
       JOIN ventas v ON dv.ID_Venta = v.ID_Venta
       WHERE v.Fecha BETWEEN ? AND ?
       GROUP BY p.Nombre
       ORDER BY TotalVendido DESC
       LIMIT 1`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    
    // Obtener día con más ventas
    const [diaMasVentas] = await pool.query(
      `SELECT Fecha, SUM(Total) AS TotalDia
       FROM ventas
       WHERE Fecha BETWEEN ? AND ?
       GROUP BY Fecha
       ORDER BY TotalDia DESC
       LIMIT 1`,
      [reporte.Fecha_Inicio, reporte.Fecha_Fin]
    );
    
    // Crear el libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'La Comuna Café';
    workbook.lastModifiedBy = 'Sistema de Reportes';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.Tipo}_${reporte.Fecha_Inicio}_${reporte.Fecha_Fin}.xlsx"`);
    
    // Generar contenido del Excel
    generarContenidoExcel(workbook, reporte, ventas, gastos, productoMasVendido[0], diaMasVentas[0]);
    
    // Escribir el archivo a la respuesta
    await workbook.xlsx.write(res);
    
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({ message: 'Error al exportar Excel', error: error.message });
  }
};

// Función auxiliar para generar el contenido del Excel
const generarContenidoExcel = (workbook, reporte, ventas, gastos, productoMasVendido, diaMasVentas) => {
  // Hoja 1: Resumen
  const resumenSheet = workbook.addWorksheet('Resumen');
  
  // Estilos para encabezados
  const headerStyle = {
    font: { bold: true, size: 14, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  };
  
  const subHeaderStyle = {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } },
    alignment: { horizontal: 'left', vertical: 'middle' }
  };
  
  const dataStyle = {
    font: { size: 11 },
    alignment: { horizontal: 'left', vertical: 'middle' }
  };
  
  // Título principal
  resumenSheet.mergeCells('A1:D1');
  resumenSheet.getCell('A1').value = 'LA COMUNA CAFÉ';
  resumenSheet.getCell('A1').style = headerStyle;
  
  // Subtítulo
  resumenSheet.mergeCells('A2:D2');
  resumenSheet.getCell('A2').value = `Reporte ${reporte.Tipo}`;
  resumenSheet.getCell('A2').style = headerStyle;
  
  // Información del reporte
  resumenSheet.getCell('A4').value = 'Periodo:';
  resumenSheet.getCell('A4').style = subHeaderStyle;
  resumenSheet.getCell('B4').value = `${new Date(reporte.Fecha_Inicio).toLocaleDateString('es-MX')} - ${new Date(reporte.Fecha_Fin).toLocaleDateString('es-MX')}`;
  resumenSheet.getCell('B4').style = dataStyle;
  
  // Fecha de generación
  const fechaGen = new Date();
  const fechaStr = fechaGen.toLocaleDateString('es-MX');
  const horaStr = fechaGen.toLocaleTimeString('es-MX');
  resumenSheet.getCell('A5').value = 'Generado el:';
  resumenSheet.getCell('A5').style = subHeaderStyle;
  resumenSheet.getCell('B5').value = `${fechaStr} a las ${horaStr}`;
  resumenSheet.getCell('B5').style = dataStyle;
  
  // Resumen financiero
  resumenSheet.getCell('A7').value = 'RESUMEN FINANCIERO';
  resumenSheet.getCell('A7').style = headerStyle;
  resumenSheet.mergeCells('A7:D7');
  
  resumenSheet.getCell('A8').value = 'Total Ventas:';
  resumenSheet.getCell('A8').style = subHeaderStyle;
  resumenSheet.getCell('B8').value = parseFloat(reporte.Total_Ventas);
  resumenSheet.getCell('B8').style = dataStyle;
  resumenSheet.getCell('B8').numFmt = '"$"#,##0.00';
  
  resumenSheet.getCell('A9').value = 'Total Gastos:';
  resumenSheet.getCell('A9').style = subHeaderStyle;
  resumenSheet.getCell('B9').value = parseFloat(reporte.Total_Gastos);
  resumenSheet.getCell('B9').style = dataStyle;
  resumenSheet.getCell('B9').numFmt = '"$"#,##0.00';
  
  resumenSheet.getCell('A10').value = 'Ganancia Neta:';
  resumenSheet.getCell('A10').style = subHeaderStyle;
  resumenSheet.getCell('B10').value = parseFloat(reporte.Ganancia);
  resumenSheet.getCell('B10').style = dataStyle;
  resumenSheet.getCell('B10').numFmt = '"$"#,##0.00';
  
  // Estadísticas adicionales
  resumenSheet.getCell('A12').value = 'ESTADÍSTICAS ADICIONALES';
  resumenSheet.getCell('A12').style = headerStyle;
  resumenSheet.mergeCells('A12:D12');
  
  let row = 13;
  if (productoMasVendido) {
    resumenSheet.getCell(`A${row}`).value = 'Producto más vendido:';
    resumenSheet.getCell(`A${row}`).style = subHeaderStyle;
    resumenSheet.getCell(`B${row}`).value = `${productoMasVendido.Nombre} (${productoMasVendido.TotalVendido} unidades)`;
    resumenSheet.getCell(`B${row}`).style = dataStyle;
    row++;
  }
  
  if (diaMasVentas) {
    resumenSheet.getCell(`A${row}`).value = 'Día con más ventas:';
    resumenSheet.getCell(`A${row}`).style = subHeaderStyle;
    resumenSheet.getCell(`B${row}`).value = `${new Date(diaMasVentas.Fecha).toLocaleDateString('es-MX')} ($${parseFloat(diaMasVentas.TotalDia).toFixed(2)})`;
    resumenSheet.getCell(`B${row}`).style = dataStyle;
  }
  
  // Ajustar ancho de columnas
  resumenSheet.getColumn('A').width = 20;
  resumenSheet.getColumn('B').width = 30;
  resumenSheet.getColumn('C').width = 15;
  resumenSheet.getColumn('D').width = 15;
  
  // Hoja 2: Ventas
  if (ventas.length > 0) {
    const ventasSheet = workbook.addWorksheet('Ventas');
    
    // Encabezados
    ventasSheet.getCell('A1').value = 'ID Venta';
    ventasSheet.getCell('A1').style = headerStyle;
    ventasSheet.getCell('B1').value = 'Fecha';
    ventasSheet.getCell('B1').style = headerStyle;
    ventasSheet.getCell('C1').value = 'Total';
    ventasSheet.getCell('C1').style = headerStyle;
    ventasSheet.getCell('D1').value = 'Método de Pago';
    ventasSheet.getCell('D1').style = headerStyle;
    ventasSheet.getCell('E1').value = 'Usuario';
    ventasSheet.getCell('E1').style = headerStyle;
    
    // Datos
    ventas.forEach((venta, index) => {
      const row = index + 2;
      ventasSheet.getCell(`A${row}`).value = venta.ID_Venta;
      ventasSheet.getCell(`A${row}`).style = dataStyle;
      
      ventasSheet.getCell(`B${row}`).value = new Date(venta.Fecha);
      ventasSheet.getCell(`B${row}`).style = dataStyle;
      ventasSheet.getCell(`B${row}`).numFmt = 'dd/mm/yyyy';
      
      ventasSheet.getCell(`C${row}`).value = parseFloat(venta.Total);
      ventasSheet.getCell(`C${row}`).style = dataStyle;
      ventasSheet.getCell(`C${row}`).numFmt = '"$"#,##0.00';
      
      ventasSheet.getCell(`D${row}`).value = venta.Metodo_Pago;
      ventasSheet.getCell(`D${row}`).style = dataStyle;
      
      ventasSheet.getCell(`E${row}`).value = venta.Usuario;
      ventasSheet.getCell(`E${row}`).style = dataStyle;
    });
    
    // Ajustar ancho de columnas
    ventasSheet.getColumn('A').width = 12;
    ventasSheet.getColumn('B').width = 15;
    ventasSheet.getColumn('C').width = 15;
    ventasSheet.getColumn('D').width = 20;
    ventasSheet.getColumn('E').width = 20;
  }
  
  // Hoja 3: Gastos
  if (gastos.length > 0) {
    const gastosSheet = workbook.addWorksheet('Gastos');
    
    // Encabezados
    gastosSheet.getCell('A1').value = 'ID Gasto';
    gastosSheet.getCell('A1').style = headerStyle;
    gastosSheet.getCell('B1').value = 'Fecha';
    gastosSheet.getCell('B1').style = headerStyle;
    gastosSheet.getCell('C1').value = 'Descripción';
    gastosSheet.getCell('C1').style = headerStyle;
    gastosSheet.getCell('D1').value = 'Monto';
    gastosSheet.getCell('D1').style = headerStyle;
    gastosSheet.getCell('E1').value = 'Usuario';
    gastosSheet.getCell('E1').style = headerStyle;
    
    // Datos
    gastos.forEach((gasto, index) => {
      const row = index + 2;
      gastosSheet.getCell(`A${row}`).value = gasto.ID_Gasto;
      gastosSheet.getCell(`A${row}`).style = dataStyle;
      
      gastosSheet.getCell(`B${row}`).value = new Date(gasto.Fecha);
      gastosSheet.getCell(`B${row}`).style = dataStyle;
      gastosSheet.getCell(`B${row}`).numFmt = 'dd/mm/yyyy';
      
      gastosSheet.getCell(`C${row}`).value = gasto.Descripcion;
      gastosSheet.getCell(`C${row}`).style = dataStyle;
      
      gastosSheet.getCell(`D${row}`).value = parseFloat(gasto.Monto);
      gastosSheet.getCell(`D${row}`).style = dataStyle;
      gastosSheet.getCell(`D${row}`).numFmt = '"$"#,##0.00';
      
      gastosSheet.getCell(`E${row}`).value = gasto.Usuario;
      gastosSheet.getCell(`E${row}`).style = dataStyle;
    });
    
    // Ajustar ancho de columnas
    gastosSheet.getColumn('A').width = 12;
    gastosSheet.getColumn('B').width = 15;
    gastosSheet.getColumn('C').width = 40;
    gastosSheet.getColumn('D').width = 15;
    gastosSheet.getColumn('E').width = 20;
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
  exportarPDF,
  exportarExcel,
}; 