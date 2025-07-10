const Insumo = require('../models/insumos.model');

class InsumosController {
    // Obtener todos los insumos
    static async getAll(req, res) {
        try {
            console.log('Controlador: Iniciando obtención de insumos');
            const nombre = req.query.nombre || null;
            const insumos = await Insumo.getAll(nombre);
            console.log('Controlador: Insumos obtenidos exitosamente');
            res.json(insumos);
        } catch (error) {
            console.error('Error detallado en controlador getAll:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                stack: error.stack
            });
            res.status(500).json({ 
                message: 'Error al obtener los insumos',
                error: error.message 
            });
        }
    }

    // Obtener un insumo por ID
    static async getById(req, res) {
        try {
            const insumo = await Insumo.getById(req.params.id);
            if (!insumo) {
                return res.status(404).json({ message: 'Insumo no encontrado' });
            }
            res.json(insumo);
        } catch (error) {
            console.error('Error al obtener insumo:', error);
            res.status(500).json({ message: 'Error al obtener el insumo' });
        }
    }

    // Crear un nuevo insumo
    static async create(req, res) {
        try {
            const { Nombre, ID_Proveedor, Costo, Unidad } = req.body;

            // Validaciones básicas
            if (!Nombre || !ID_Proveedor || !Costo || !Unidad) {
                return res.status(400).json({ 
                    message: 'Todos los campos son requeridos' 
                });
            }

            const insumoId = await Insumo.create({
                Nombre,
                ID_Proveedor,
                Costo,
                Unidad
            });

            res.status(201).json({ 
                message: 'Insumo creado exitosamente',
                id: insumoId
            });
        } catch (error) {
            console.error('Error al crear insumo:', error);
            res.status(500).json({ message: 'Error al crear el insumo' });
        }
    }

    // Actualizar un insumo
    static async update(req, res) {
        try {
            const { Nombre, ID_Proveedor, Costo, Unidad } = req.body;

            // Validaciones básicas
            if (!Nombre || !ID_Proveedor || !Costo || !Unidad) {
                return res.status(400).json({ 
                    message: 'Todos los campos son requeridos' 
                });
            }

            const success = await Insumo.update(req.params.id, {
                Nombre,
                ID_Proveedor,
                Costo,
                Unidad
            });

            if (!success) {
                return res.status(404).json({ message: 'Insumo no encontrado' });
            }

            res.json({ message: 'Insumo actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar insumo:', error);
            res.status(500).json({ message: 'Error al actualizar el insumo' });
        }
    }

    // Eliminar un insumo
    static async delete(req, res) {
        try {
            const success = await Insumo.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'Insumo no encontrado' });
            }
            res.json({ message: 'Insumo eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar insumo:', error);
            res.status(500).json({ message: 'Error al eliminar el insumo' });
        }
    }

    // Obtener insumos por proveedor
    static async getByProvider(req, res) {
        try {
            const insumos = await Insumo.getByProvider(req.params.providerId);
            res.json(insumos);
        } catch (error) {
            console.error('Error al obtener insumos por proveedor:', error);
            res.status(500).json({ message: 'Error al obtener los insumos por proveedor' });
        }
    }

    // Buscar insumos por nombre
    static async searchByName(req, res) {
        try {
            const insumos = await Insumo.searchByName(req.query.q);
            res.json(insumos);
        } catch (error) {
            console.error('Error al buscar insumos:', error);
            res.status(500).json({ message: 'Error al buscar los insumos' });
        }
    }

    // Obtener todos los proveedores
    static async getProviders(req, res) {
        try {
            console.log('Controlador: Iniciando obtención de proveedores');
            const proveedores = await Insumo.getProviders();
            console.log('Controlador: Proveedores obtenidos exitosamente');
            res.json(proveedores);
        } catch (error) {
            console.error('Error detallado en controlador getProviders:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                stack: error.stack
            });
            res.status(500).json({ 
                message: 'Error al obtener los proveedores',
                error: error.message 
            });
        }
    }
}

module.exports = InsumosController; 