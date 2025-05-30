const express = require('express');
const router = express.Router();
const InsumosController = require('../controllers/insumos.controller');
const verifyToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Obtener todos los insumos
router.get('/', InsumosController.getAll);

// Obtener todos los proveedores
router.get('/proveedores', InsumosController.getProviders);

// Buscar insumos por nombre
router.get('/buscar', InsumosController.searchByName);

// Obtener insumos por proveedor
router.get('/proveedor/:providerId', InsumosController.getByProvider);

// Obtener un insumo por ID
router.get('/:id', InsumosController.getById);

// Crear un nuevo insumo
router.post('/', InsumosController.create);

// Actualizar un insumo
router.put('/:id', InsumosController.update);

// Eliminar un insumo
router.delete('/:id', InsumosController.delete);

module.exports = router; 