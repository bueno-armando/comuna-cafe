const UsuarioModel = require('../models/usuarioModel');
const jwt = require('jsonwebtoken');

// En producción, esto debería venir de variables de entorno
const JWT_SECRET = 'tu_clave_secreta_super_segura';
const JWT_EXPIRES_IN = '24h';

class UsuarioController {
    // Obtener todos los usuarios
    static async getAll(req, res) {
        try {
            // Obtener parámetros de filtro y paginación
            const {
                page = 1,
                limit = 9,
                nombre,
                apellido,
                rol,
                estado
            } = req.query;

            const usuarios = await UsuarioModel.getAll({
                page: parseInt(page),
                limit: parseInt(limit),
                nombre,
                apellido,
                rol,
                estado
            });
            
            res.json(usuarios);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: 'Error al obtener usuarios' });
        }
    }

    // Obtener un usuario por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuarioModel.getById(id);
            
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json(usuario);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ error: 'Error al obtener usuario' });
        }
    }

    // Crear un nuevo usuario
    static async create(req, res) {
        try {
            // Verificar que el usuario tenga el rol de administrador
            if (req.user.rol !== 'Administrador') {
                return res.status(403).json({ error: 'Solo los administradores pueden crear usuarios' });
            }

            const { Nombre, Apellido, Contraseña, ID_Rol } = req.body;

            // Validaciones básicas
            if (!Nombre || !Apellido || !Contraseña || !ID_Rol) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            const userId = await UsuarioModel.create({ Nombre, Apellido, Contraseña, ID_Rol });
            res.status(201).json({ id: userId, message: 'Usuario creado exitosamente' });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ error: 'Error al crear usuario' });
        }
    }

    // Actualizar un usuario
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { Nombre, Apellido, Contraseña, ID_Rol, Estado } = req.body;

            // Validaciones básicas
            if (!Nombre || !Apellido || !ID_Rol) {
                return res.status(400).json({ error: 'Nombre, Apellido e ID_Rol son requeridos' });
            }

            // Verificar si el usuario existe
            const existingUser = await UsuarioModel.getById(id);
            if (!existingUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const success = await UsuarioModel.update(id, { Nombre, Apellido, Contraseña, ID_Rol, Estado });
            if (success) {
                res.json({ message: 'Usuario actualizado exitosamente' });
            } else {
                res.status(500).json({ error: 'Error al actualizar usuario' });
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    }

    // Eliminar un usuario
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el usuario existe
            const existingUser = await UsuarioModel.getById(id);
            if (!existingUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const success = await UsuarioModel.delete(id);
            if (success) {
                res.json({ message: 'Usuario eliminado exitosamente' });
            } else {
                res.status(500).json({ error: 'Error al eliminar usuario' });
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }

    // Iniciar sesión
    static async login(req, res) {
        try {
            const { usuario, contraseña } = req.body;
            
            if (!usuario || !contraseña) {
                return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
            }

            const user = await UsuarioModel.verifyCredentials(usuario, contraseña);
            
            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            if (user.Estado !== 'Activo') {
                return res.status(401).json({ error: 'Usuario inactivo' });
            }

            // Mapear el ID del rol a su nombre
            const rolNombre = {
                1: 'Administrador',
                2: 'Cajero',
                3: 'Mesero'
            }[user.rol] || 'Cajero';

            const token = jwt.sign(
                { 
                    id: user.id, 
                    usuario: user.usuario,
                    rol: rolNombre 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                token,
                usuario: {
                    id: user.id,
                    usuario: user.usuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    rol: rolNombre,
                    estado: user.Estado
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
}

module.exports = UsuarioController; 