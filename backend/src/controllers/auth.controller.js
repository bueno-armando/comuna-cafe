const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Usar la variable de entorno o un valor por defecto
const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  // Registro de usuario
  async register(req, res) {
    try {
      const { nombre, apellido, contraseña, id_rol } = req.body;

      // Validar datos requeridos
      if (!nombre || !apellido || !contraseña || !id_rol) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contraseña, 10);

      // Usar el procedimiento almacenado CrearUsuario
      const [result] = await pool.query(
        'CALL CrearUsuario(?, ?, ?, ?)',
        [nombre, apellido, hashedPassword, id_rol]
      );

      // Obtener el usuario recién creado para devolver su nombre de usuario
      const [newUser] = await pool.query(
        'SELECT Usuario FROM usuarios WHERE Nombre = ? AND Apellido = ? ORDER BY ID_Usuario DESC LIMIT 1',
        [nombre, apellido]
      );

      if (!newUser || newUser.length === 0) {
        throw new Error('Error al crear el usuario');
      }

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        usuario: newUser[0].Usuario
      });
    } catch (error) {
      console.error('Error en registro:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }
      res.status(500).json({ 
        message: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Login de usuario
  async login(req, res) {
    try {
      const { usuario, contraseña } = req.body;

      // Buscar usuario
      const [users] = await pool.query(
        'SELECT u.*, r.Nombre_Rol as rol FROM usuarios u JOIN roles r ON u.ID_Rol = r.ID_Rol WHERE u.Usuario = ? AND u.Estado = "Activo"',
        [usuario]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const user = users[0];

      // Verificar contraseña
      const validPassword = await bcrypt.compare(contraseña, user.Contraseña);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar token
      const token = jwt.sign(
        { 
          userId: user.ID_Usuario,
          username: user.Usuario,
          rol: user.rol
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.ID_Usuario,
          username: user.Usuario,
          nombre: user.Nombre,
          apellido: user.Apellido,
          rol: user.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = authController; 