const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const verifyToken = require('../middleware/auth');

// Rutas públicas
router.post('/login', UsuarioController.login);

// Rutas protegidas
router.get('/', verifyToken, UsuarioController.getAll);
router.get('/:id', verifyToken, UsuarioController.getById);
router.post('/', verifyToken, UsuarioController.create);
router.put('/:id', verifyToken, UsuarioController.update);
router.delete('/:id', verifyToken, UsuarioController.delete);

module.exports = router;
