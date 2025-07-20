const db = require('../config/database');

class CajaModel {
  // Obtener todos los productos
  static async getProducts() {
    const [rows] = await db.query(`
      SELECT pv.*, c.Nombre as categoria_nombre, pv.ruta_imagen
      FROM productos_venta pv 
      JOIN categorias c ON pv.ID_Categoria = c.ID_Categoria
      WHERE pv.Estado = 1
    `);
    return rows;
  }

  // Obtener todas las categorías
  static async getCategorias() {
    const [rows] = await db.query(`
      SELECT ID_Categoria, Nombre 
      FROM categorias 
      ORDER BY Nombre
    `);
    return rows;
  }

  // Crear una nueva venta
  static async createSale(saleData) {
    const { ID_Usuario, Total, Metodo_Pago } = saleData;
    const [result] = await db.query(
      'INSERT INTO ventas (Fecha, Total, Metodo_Pago, ID_Usuario) VALUES (CURDATE(), ?, ?, ?)',
      [Total, Metodo_Pago, ID_Usuario]
    );
    return result.insertId;
  }

  // Crear detalles de la venta
  static async createSaleDetails(ventaId, detalles) {
    for (const detalle of detalles) {
      await db.query(
        'INSERT INTO detalle_venta (ID_Venta, ID_Producto, Cantidad, Subtotal) VALUES (?, ?, ?, ?)',
        [ventaId, detalle.ID_Producto, detalle.Cantidad, detalle.Subtotal]
      );
    }
  }

  // Obtener ingredientes de la receta
  static async getRecipeIngredients(productoId) {
    const [rows] = await db.query(
      `SELECT r.*, i.Nombre as insumo_nombre 
       FROM recetas r 
       JOIN insumos i ON r.ID_Insumo = i.ID_Insumo 
       WHERE r.ID_Producto = ?`,
      [productoId]
    );
    return rows;
  }

  // Registrar movimiento de inventario
  static async registerInventoryMovement(movement) {
    const { ID_Insumo, Cantidad, ID_Usuario } = movement;
    await db.query(
      'INSERT INTO movimientos_inventario (ID_Insumo, Tipo, Cantidad, Fecha, ID_Usuario, Descripcion) VALUES (?, "Salida", ?, CURDATE(), ?, "Venta")',
      [ID_Insumo, Cantidad, ID_Usuario]
    );
  }
}

module.exports = CajaModel;
