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

    // Obtener todos los proveedores con información completa
    static async getAllProviders(req, res) {
        try {
            console.log('Controlador: Iniciando obtención de proveedores completos');
            const proveedores = await Insumo.getAllProviders();
            console.log('Controlador: Proveedores completos obtenidos exitosamente');
            res.json(proveedores);
        } catch (error) {
            console.error('Error al obtener proveedores completos:', error);
            res.status(500).json({ 
                message: 'Error al obtener los proveedores',
                error: error.message 
            });
        }
    }

    // Obtener un proveedor por ID
    static async getProviderById(req, res) {
        try {
            const proveedor = await Insumo.getProviderById(req.params.id);
            if (!proveedor) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }
            res.json(proveedor);
        } catch (error) {
            console.error('Error al obtener proveedor:', error);
            res.status(500).json({ message: 'Error al obtener el proveedor' });
        }
    }

    // Crear un nuevo proveedor
    static async createProvider(req, res) {
        try {
            const { Nombre, Telefono, Direccion } = req.body;

            // Validaciones básicas
            if (!Nombre || !Telefono) {
                return res.status(400).json({ 
                    message: 'Nombre y teléfono son campos requeridos' 
                });
            }

            const proveedorId = await Insumo.createProvider({
                Nombre,
                Telefono,
                Direccion: Direccion || null
            });

            res.status(201).json({ 
                message: 'Proveedor creado exitosamente',
                id: proveedorId
            });
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            res.status(500).json({ message: 'Error al crear el proveedor' });
        }
    }

    // Actualizar un proveedor
    static async updateProvider(req, res) {
        try {
            const { Nombre, Telefono, Direccion } = req.body;

            // Validaciones básicas
            if (!Nombre || !Telefono) {
                return res.status(400).json({ 
                    message: 'Nombre y teléfono son campos requeridos' 
                });
            }

            const success = await Insumo.updateProvider(req.params.id, {
                Nombre,
                Telefono,
                Direccion: Direccion || null
            });

            if (!success) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }

            res.json({ message: 'Proveedor actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            res.status(500).json({ message: 'Error al actualizar el proveedor' });
        }
    }

    // Eliminar un proveedor
    static async deleteProvider(req, res) {
        try {
            const success = await Insumo.deleteProvider(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }
            res.json({ message: 'Proveedor eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            if (error.message.includes('insumos asociados')) {
                return res.status(400).json({ 
                    message: 'No se puede eliminar el proveedor porque tiene insumos asociados' 
                });
            }
            res.status(500).json({ message: 'Error al eliminar el proveedor' });
        }
    }
}

module.exports = InsumosController; 