const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const verifyToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para el inventario
router.get('/', inventarioController.getAll);
router.get('/insumos', inventarioController.getInsumos);
router.get('/movimientos/:idInsumo', inventarioController.getMovimientosByInsumo);
router.post('/movimientos', inventarioController.registrarMovimiento);

module.exports = router; 