const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta de registro
router.post('/register', authController.register);

// Ruta de login
router.post('/login', authController.login);

module.exports = router; 