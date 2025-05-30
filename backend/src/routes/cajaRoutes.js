const express = require('express');
const router = express.Router();
const CajaController = require('../controllers/cajaController');

router.get('/productos', CajaController.getProducts);
router.post('/venta', CajaController.processSale);

module.exports = router;