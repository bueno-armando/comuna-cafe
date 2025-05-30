const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const verifyToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Obtener todas las ventas
router.get('/', ventasController.getVentas);

// Obtener ventas por rango de fechas
router.get('/filtro', ventasController.getVentasPorFecha);

// Obtener detalles de una venta específica
router.get('/:id', ventasController.getDetalleVenta);

// Exportar ventas a PDF
router.get('/exportar/pdf', ventasController.exportarVentasPDF);

// Exportar ventas a Excel
router.get('/exportar/excel', ventasController.exportarVentasExcel);

module.exports = router; 