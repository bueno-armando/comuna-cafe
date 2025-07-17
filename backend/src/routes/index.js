const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
// const insumosRoutes = require('./insumos.routes');
// const inventarioRoutes = require('./inventario.routes');
// const productosRoutes = require('./productos.routes');
// const recetasRoutes = require('./recetas.routes');
const ventasRoutes = require('./ventasRoutes');
// const cajaRoutes = require('./caja.routes');
// const gastosRoutes = require('./gastos.routes');
const reportesRoutes = require('./reportesRoutes');
// const usuariosRoutes = require('./usuarios.routes');
// const bitacoraRoutes = require('./bitacora.routes');

// Definir rutas base
router.use('/auth', authRoutes);
// router.use('/insumos', insumosRoutes);
// router.use('/inventario', inventarioRoutes);
// router.use('/productos', productosRoutes);
// router.use('/recetas', recetasRoutes);
router.use('/ventas', ventasRoutes);
// router.use('/caja', cajaRoutes);
// router.use('/gastos', gastosRoutes);
router.use('/reportes', reportesRoutes);
// router.use('/usuarios', usuariosRoutes);
// router.use('/bitacora', bitacoraRoutes);

module.exports = router; 