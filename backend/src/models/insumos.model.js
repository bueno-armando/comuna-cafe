const db = require('../config/database');

class Insumo {
    // Obtener todos los insumos con información del proveedor
    static async getAll(nombre = null) {
        try {
            console.log('Intentando obtener todos los insumos...');
            let query = `
                SELECT i.*, p.Nombre as Proveedor_Nombre 
                FROM insumos i 
                LEFT JOIN proveedores p ON i.ID_Proveedor = p.ID_Proveedor
            `;
            let params = [];
            if (nombre) {
                query += ' WHERE i.Nombre LIKE ?';
                params.push(`%${nombre}%`);
            }
            query += '\nORDER BY i.ID_Insumo';
            console.log('Query a ejecutar:', query, params);
            const [rows] = await db.query(query, params);
            console.log('Insumos obtenidos:', rows);
            return rows;
        } catch (error) {
            console.error('Error detallado en getAll:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw error;
        }
    }

    // Obtener un insumo por ID con información del proveedor
    static async getById(id) {
        try {
            const query = `
                SELECT i.*, p.Nombre as Proveedor_Nombre 
                FROM insumos i 
                LEFT JOIN proveedores p ON i.ID_Proveedor = p.ID_Proveedor
                WHERE i.ID_Insumo = ?
            `;
            const [rows] = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    }

    // Crear un nuevo insumo
    static async create(insumoData) {
        try {
            const { Nombre, ID_Proveedor, Costo, Unidad } = insumoData;
            const query = `
                INSERT INTO insumos (Nombre, ID_Proveedor, Costo, Unidad)
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await db.query(query, [Nombre, ID_Proveedor, Costo, Unidad]);
            return result.insertId;
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    // Actualizar un insumo
    static async update(id, insumoData) {
        try {
            const { Nombre, ID_Proveedor, Costo, Unidad } = insumoData;
            const query = `
                UPDATE insumos 
                SET Nombre = ?, ID_Proveedor = ?, Costo = ?, Unidad = ?
                WHERE ID_Insumo = ?
            `;
            const [result] = await db.query(query, [Nombre, ID_Proveedor, Costo, Unidad, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en update:', error);
            throw error;
        }
    }

    // Eliminar un insumo
    static async delete(id) {
        try {
            const query = 'DELETE FROM insumos WHERE ID_Insumo = ?';
            const [result] = await db.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    }

    // Obtener insumos por proveedor
    static async getByProvider(providerId) {
        try {
            const query = `
                SELECT i.*, p.Nombre as Proveedor_Nombre 
                FROM insumos i 
                LEFT JOIN proveedores p ON i.ID_Proveedor = p.ID_Proveedor
                WHERE i.ID_Proveedor = ?
                ORDER BY i.Nombre
            `;
            const [rows] = await db.query(query, [providerId]);
            return rows;
        } catch (error) {
            console.error('Error en getByProvider:', error);
            throw error;
        }
    }

    // Buscar insumos por nombre
    static async searchByName(query) {
        try {
            const searchQuery = `
                SELECT i.*, p.Nombre as Proveedor_Nombre 
                FROM insumos i 
                LEFT JOIN proveedores p ON i.ID_Proveedor = p.ID_Proveedor
                WHERE i.Nombre LIKE ?
                ORDER BY i.Nombre
            `;
            const [rows] = await db.query(searchQuery, [`%${query}%`]);
            return rows;
        } catch (error) {
            console.error('Error en searchByName:', error);
            throw error;
        }
    }

    // Obtener todos los proveedores
    static async getProviders() {
        try {
            const query = 'SELECT ID_Proveedor, Nombre FROM proveedores ORDER BY Nombre';
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Error en getProviders:', error);
            throw error;
        }
    }

    // Obtener todos los proveedores con información completa
    static async getAllProviders() {
        try {
            const query = 'SELECT ID_Proveedor, Nombre, Telefono, Direccion FROM proveedores ORDER BY Nombre';
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Error en getAllProviders:', error);
            throw error;
        }
    }

    // Obtener un proveedor por ID
    static async getProviderById(id) {
        try {
            const query = 'SELECT ID_Proveedor, Nombre, Telefono, Direccion FROM proveedores WHERE ID_Proveedor = ?';
            const [rows] = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error en getProviderById:', error);
            throw error;
        }
    }

    // Crear un nuevo proveedor
    static async createProvider(providerData) {
        try {
            const { Nombre, Telefono, Direccion } = providerData;
            const query = `
                INSERT INTO proveedores (Nombre, Telefono, Direccion)
                VALUES (?, ?, ?)
            `;
            const [result] = await db.query(query, [Nombre, Telefono, Direccion]);
            return result.insertId;
        } catch (error) {
            console.error('Error en createProvider:', error);
            throw error;
        }
    }

    // Actualizar un proveedor
    static async updateProvider(id, providerData) {
        try {
            const { Nombre, Telefono, Direccion } = providerData;
            const query = `
                UPDATE proveedores 
                SET Nombre = ?, Telefono = ?, Direccion = ?
                WHERE ID_Proveedor = ?
            `;
            const [result] = await db.query(query, [Nombre, Telefono, Direccion, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en updateProvider:', error);
            throw error;
        }
    }

    // Eliminar un proveedor (solo si no tiene insumos asociados)
    static async deleteProvider(id) {
        try {
            // Verificar si el proveedor tiene insumos asociados
            const checkQuery = 'SELECT COUNT(*) as count FROM insumos WHERE ID_Proveedor = ?';
            const [checkResult] = await db.query(checkQuery, [id]);
            
            if (checkResult[0].count > 0) {
                throw new Error('No se puede eliminar el proveedor porque tiene insumos asociados');
            }

            const query = 'DELETE FROM proveedores WHERE ID_Proveedor = ?';
            const [result] = await db.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en deleteProvider:', error);
            throw error;
        }
    }

    // Verificar si un proveedor tiene insumos asociados
    static async hasInsumos(providerId) {
        try {
            const query = 'SELECT COUNT(*) as count FROM insumos WHERE ID_Proveedor = ?';
            const [result] = await db.query(query, [providerId]);
            return result[0].count > 0;
        } catch (error) {
            console.error('Error en hasInsumos:', error);
            throw error;
        }
    }
}

module.exports = Insumo; 