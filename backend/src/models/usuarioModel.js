const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioModel {
    // Obtener todos los usuarios
    static async getAll() {
        try {
            const [rows] = await pool.query(`
                SELECT u.*, r.Nombre_Rol as Rol_Nombre 
                FROM usuarios u 
                JOIN roles r ON u.ID_Rol = r.ID_Rol
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un usuario por ID
    static async getById(id) {
        try {
            const [rows] = await pool.query(`
                SELECT u.*, r.Nombre_Rol as Rol_Nombre 
                FROM usuarios u 
                JOIN roles r ON u.ID_Rol = r.ID_Rol 
                WHERE u.ID_Usuario = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Obtener un usuario por nombre de usuario
    static async getByUsername(username) {
        try {
            const [rows] = await pool.query(`
                SELECT u.*, r.Nombre_Rol as Rol_Nombre 
                FROM usuarios u 
                JOIN roles r ON u.ID_Rol = r.ID_Rol 
                WHERE u.Usuario = ?
            `, [username]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Crear un nuevo usuario usando el procedimiento almacenado
    static async create(usuario) {
        try {
            const { Nombre, Apellido, Contraseña, ID_Rol } = usuario;
            
            // Encriptar la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Contraseña, salt);
            
            await pool.query(
                'CALL CrearUsuario(?, ?, ?, ?)',
                [Nombre, Apellido, hashedPassword, ID_Rol]
            );
            
            // Obtener el ID del usuario recién creado
            const [rows] = await pool.query(
                'SELECT ID_Usuario FROM usuarios WHERE Nombre = ? AND Apellido = ? ORDER BY ID_Usuario DESC LIMIT 1',
                [Nombre, Apellido]
            );
            
            return rows[0].ID_Usuario;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar un usuario
    static async update(id, usuario) {
        try {
            const { Nombre, Apellido, Contraseña, ID_Rol, Estado } = usuario;
            
            // Si se proporciona una nueva contraseña, encriptarla
            let hashedPassword = Contraseña;
            if (Contraseña) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(Contraseña, salt);
            }
            
            const [result] = await pool.query(
                'UPDATE usuarios SET Nombre = ?, Apellido = ?, Contraseña = ?, ID_Rol = ?, Estado = ? WHERE ID_Usuario = ?',
                [Nombre, Apellido, hashedPassword, ID_Rol, Estado, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un usuario
    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM usuarios WHERE ID_Usuario = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Verificar credenciales
    static async verifyCredentials(usuario, contraseña) {
        try {
            const [rows] = await pool.query(
                'SELECT ID_Usuario as id, Usuario as usuario, Contraseña, Nombre as nombre, Apellido as apellido, ID_Rol as rol, Estado FROM usuarios WHERE Usuario = ?',
                [usuario]
            );

            if (rows.length === 0) {
                return null;
            }

            const user = rows[0];

            if (user.Estado !== 'Activo') {
                throw new Error('Usuario inactivo');
            }

            const validPassword = await bcrypt.compare(contraseña, user.Contraseña);
            if (!validPassword) {
                return null;
            }

            return user;
        } catch (error) {
            console.error('Error en verifyCredentials:', error);
            throw error;
        }
    }
}

module.exports = UsuarioModel; 