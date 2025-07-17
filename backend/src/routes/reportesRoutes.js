const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.post('/', auth, reportesController.generarReporte);
router.get('/', auth, reportesController.listarReportes);
router.get('/:id', auth, reportesController.detalleReporte);
router.get('/:id/ventas', auth, reportesController.ventasReporte);
router.get('/:id/gastos', auth, reportesController.gastosReporte);
router.get('/:id/producto-mas-vendido', auth, reportesController.productoMasVendido);
router.get('/:id/dia-mas-ventas', auth, reportesController.diaMasVentas);

module.exports = router; 