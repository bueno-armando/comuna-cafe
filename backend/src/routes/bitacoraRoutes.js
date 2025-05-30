const express = require('express');
const router = express.Router();
const BitacoraController = require('../controllers/bitacora.controller');
const verifyToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Obtener todos los registros de bitácora
router.get('/', BitacoraController.getAll);

// Obtener registros de bitácora por tabla
router.get('/tabla/:tabla', BitacoraController.getByTable);

// Obtener registros de bitácora por usuario
router.get('/usuario/:userId', BitacoraController.getByUser);

// Obtener registros de bitácora por rango de fechas
router.get('/fechas', BitacoraController.getByDateRange);

module.exports = router; 