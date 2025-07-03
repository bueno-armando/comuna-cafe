const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const verifyToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Obtener todos los productos
router.get('/', productosController.getAll);

// Obtener todas las categorías
router.get('/categorias', productosController.getCategorias);

// Agregar nuevo producto
router.post('/', productosController.create);

// Actualizar producto existente
router.put('/:id', productosController.update);

// Eliminar producto
router.delete('/:id', productosController.delete);

// Agregar nueva categoría
router.post('/categorias', productosController.createCategoria);

// Actualizar categoría existente
router.put('/categorias/:id', productosController.updateCategoria);

// Eliminar categoría
router.delete('/categorias/:id', productosController.deleteCategoria);

module.exports = router; 