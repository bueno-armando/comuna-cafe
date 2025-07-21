const CajaModel = require('../models/cajaModel');

class CajaController {
  // Obtener todos los productos
  static async getProducts(req, res) {  
    try {
      const products = await CajaModel.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  }

  // Obtener todas las categorías
  static async getCategorias(req, res) {
    try {
      const categorias = await CajaModel.getCategorias();
      res.json(categorias);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ error: 'Error al obtener las categorías' });
    }
  }

  // Obtener productos más populares
  static async getPopularProducts(req, res) {
    try {
      const { days = 30 } = req.query; // Por defecto últimos 30 días
      const popularProducts = await CajaModel.getPopularProducts(parseInt(days));
      res.json(popularProducts);
    } catch (error) {
      console.error('Error al obtener productos populares:', error);
      res.status(500).json({ error: 'Error al obtener los productos populares' });
    }
  }

  // Procesar una nueva venta
  static async processSale(req, res) {
    try {
      const { ID_Usuario, Total, Metodo_Pago, detalles } = req.body;

      // Validar datos requeridos
      if (!ID_Usuario || !Total || !Metodo_Pago || !detalles || !detalles.length) {
        return res.status(400).json({ 
          error: 'Faltan datos requeridos para la venta' 
        });
      }

      // 1. Crear la venta
      const ventaId = await CajaModel.createSale({
        ID_Usuario,
        Total,
        Metodo_Pago
      });

      // 2. Crear detalles de la venta
      await CajaModel.createSaleDetails(ventaId, detalles);

      // 3. Procesar actualizaciones de inventario
      for (const detalle of detalles) {
        // Obtener ingredientes de la receta
        const ingredients = await CajaModel.getRecipeIngredients(detalle.ID_Producto);
        
        // Calcular y registrar movimientos de inventario
        for (const ingredient of ingredients) {
          const cantidadUsada = ingredient.Cantidad_Necesaria * detalle.Cantidad;
          await CajaModel.registerInventoryMovement({
            ID_Insumo: ingredient.ID_Insumo,
            Cantidad: cantidadUsada,
            ID_Usuario
          });
        }
      }

      res.json({ 
        success: true, 
        ventaId,
        message: 'Venta registrada correctamente' 
      });
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      res.status(500).json({ 
        error: 'Error al procesar la venta',
        details: error.message 
      });
    }
  }
}

module.exports = CajaController;