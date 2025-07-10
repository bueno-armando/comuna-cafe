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

// Obtener todos los proveedores con información completa
router.get('/proveedores/completos', InsumosController.getAllProviders);

// Obtener un proveedor por ID
router.get('/proveedores/:id', InsumosController.getProviderById);

// Crear un nuevo proveedor
router.post('/proveedores', InsumosController.createProvider);

// Actualizar un proveedor
router.put('/proveedores/:id', InsumosController.updateProvider);

// Eliminar un proveedor
router.delete('/proveedores/:id', InsumosController.deleteProvider);

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