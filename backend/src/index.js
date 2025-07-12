const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const cajaRoutes = require('./routes/cajaRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const productosRoutes = require('./routes/productosRoutes');
const bitacoraRoutes = require('./routes/bitacoraRoutes');
const insumosRoutes = require('./routes/insumosRoutes');
const recetasRoutes = require('./routes/recetasRoutes');
const gastosRoutes = require('./routes/gastosRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Rutas de la API
app.use('/api', routes);
app.use('/api/caja', cajaRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/gastos', gastosRoutes);

// Ruta para el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  const now = new Date();
  console.log(`[${now.toLocaleString()}] Servidor corriendo en el puerto ${PORT}`);
}); 