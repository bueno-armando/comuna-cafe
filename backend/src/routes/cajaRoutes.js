const express = require('express');
const router = express.Router();
const CajaController = require('../controllers/cajaController');

router.get('/productos', CajaController.getProducts);
router.get('/productos/populares', CajaController.getPopularProducts);
router.get('/categorias', CajaController.getCategorias);
router.post('/venta', CajaController.processSale);

module.exports = router;