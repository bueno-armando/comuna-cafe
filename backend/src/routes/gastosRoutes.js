const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const verifyToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Obtener todos los gastos (con filtros opcionales)
router.get('/', gastosController.getAll);

// Obtener un gasto por ID
router.get('/:id', gastosController.getById);

// Crear un nuevo gasto
router.post('/', gastosController.create);

// Actualizar un gasto existente
router.put('/:id', gastosController.update);

// Eliminar un gasto
router.delete('/:id', gastosController.delete);

// Calcular total de gastos en un período
router.get('/total/periodo', gastosController.getTotalByPeriod);

// Obtener estadísticas de gastos
router.get('/stats/estadisticas', gastosController.getStats);

module.exports = router; 