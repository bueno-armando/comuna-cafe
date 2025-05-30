const express = require('express');
const router = express.Router();
const RecetasController = require('../controllers/recetas.controller');
const verifyToken = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Obtener todos los productos que tienen recetas
router.get('/productos', RecetasController.getProductosConRecetas);

// Obtener la receta completa de un producto
router.get('/producto/:productId', RecetasController.getByProductId);

// Agregar un insumo a una receta
router.post('/', RecetasController.addInsumo);

// Actualizar un insumo en una receta
router.put('/:ID_Producto/:ID_Insumo', RecetasController.updateInsumo);

// Eliminar un insumo de una receta
router.delete('/:ID_Producto/:ID_Insumo', RecetasController.deleteInsumo);

module.exports = router; 