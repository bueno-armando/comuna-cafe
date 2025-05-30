SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bitacora
-- ----------------------------
DROP TABLE IF EXISTS `bitacora`;
CREATE TABLE `bitacora` (
  `ID_Bitacora` int NOT NULL AUTO_INCREMENT,
  `Tabla_Modificada` varchar(50) NOT NULL,
  `Operacion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `ID_Registro` int NOT NULL,
  `ID_Usuario` int NOT NULL,
  `Fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Datos_Anteriores` text,
  `Datos_Nuevos` text,
  PRIMARY KEY (`ID_Bitacora`),
  KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `bitacora_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for categorias
-- ----------------------------
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `ID_Categoria` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`ID_Categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for detalle_venta
-- ----------------------------
DROP TABLE IF EXISTS `detalle_venta`;
CREATE TABLE `detalle_venta` (
  `ID_Detalle` int NOT NULL AUTO_INCREMENT,
  `ID_Venta` int NOT NULL,
  `ID_Producto` int NOT NULL,
  `Cantidad` int NOT NULL,
  `Subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ID_Detalle`),
  KEY `ID_Venta` (`ID_Venta`),
  KEY `ID_Producto` (`ID_Producto`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`ID_Venta`) REFERENCES `ventas` (`ID_Venta`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`ID_Producto`) REFERENCES `productos_venta` (`ID_Producto`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for gastos
-- ----------------------------
DROP TABLE IF EXISTS `gastos`;
CREATE TABLE `gastos` (
  `ID_Gasto` int NOT NULL AUTO_INCREMENT,
  `Descripcion` varchar(100) NOT NULL,
  `Monto` decimal(10,2) NOT NULL,
  `Fecha` date NOT NULL,
  `ID_Usuario` int NOT NULL,
  PRIMARY KEY (`ID_Gasto`),
  KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for insumos
-- ----------------------------
DROP TABLE IF EXISTS `insumos`;
CREATE TABLE `insumos` (
  `ID_Insumo` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `ID_Proveedor` int NOT NULL,
  `Costo` decimal(10,2) NOT NULL,
  `Unidad` enum('ml','g','Pza','cc','oz','tsp','tbsp') NOT NULL,
  PRIMARY KEY (`ID_Insumo`),
  KEY `ID_Proveedor` (`ID_Proveedor`),
  CONSTRAINT `insumos_ibfk_1` FOREIGN KEY (`ID_Proveedor`) REFERENCES `proveedores` (`ID_Proveedor`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for inventario
-- ----------------------------
DROP TABLE IF EXISTS `inventario`;
CREATE TABLE `inventario` (
  `ID_Inventario` int NOT NULL AUTO_INCREMENT,
  `ID_Insumo` int NOT NULL,
  `Cantidad_Disponible` int NOT NULL,
  PRIMARY KEY (`ID_Inventario`),
  KEY `ID_Insumo` (`ID_Insumo`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumos` (`ID_Insumo`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for modulos
-- ----------------------------
DROP TABLE IF EXISTS `modulos`;
CREATE TABLE `modulos` (
  `id_modulo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_modulo`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for movimientos_inventario
-- ----------------------------
DROP TABLE IF EXISTS `movimientos_inventario`;
CREATE TABLE `movimientos_inventario` (
  `ID_Movimiento` int NOT NULL AUTO_INCREMENT,
  `ID_Insumo` int NOT NULL,
  `Tipo` enum('Entrada','Salida') NOT NULL,
  `Cantidad` int NOT NULL,
  `Fecha` date NOT NULL,
  `ID_Usuario` int NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID_Movimiento`),
  KEY `ID_Insumo` (`ID_Insumo`),
  KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumos` (`ID_Insumo`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for permisos_roles
-- ----------------------------
DROP TABLE IF EXISTS `permisos_roles`;
CREATE TABLE `permisos_roles` (
  `id_rol` int NOT NULL,
  `id_modulo` int NOT NULL,
  `puede_ver` tinyint(1) DEFAULT '0',
  `puede_agregar` tinyint(1) DEFAULT '0',
  `puede_editar` tinyint(1) DEFAULT '0',
  `puede_eliminar` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_rol`,`id_modulo`),
  KEY `id_modulo` (`id_modulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for productos_venta
-- ----------------------------
DROP TABLE IF EXISTS `productos_venta`;
CREATE TABLE `productos_venta` (
  `ID_Producto` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `ID_Categoria` int NOT NULL,
  `Precio_Venta` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ID_Producto`),
  KEY `ID_Categoria` (`ID_Categoria`),
  CONSTRAINT `productos_venta_ibfk_1` FOREIGN KEY (`ID_Categoria`) REFERENCES `categorias` (`ID_Categoria`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for proveedores
-- ----------------------------
DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores` (
  `ID_Proveedor` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Telefono` varchar(20) NOT NULL,
  `Direccion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`ID_Proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for recetas
-- ----------------------------
DROP TABLE IF EXISTS `recetas`;
CREATE TABLE `recetas` (
  `ID_Producto` int NOT NULL,
  `ID_Insumo` int NOT NULL,
  `Cantidad_Necesaria` decimal(10,2) NOT NULL,
  `Unidad` enum('ml','g','Pza','cc','oz','tsp','tbsp') NOT NULL,
  PRIMARY KEY (`ID_Producto`,`ID_Insumo`),
  KEY `ID_Insumo` (`ID_Insumo`),
  CONSTRAINT `recetas_ibfk_1` FOREIGN KEY (`ID_Producto`) REFERENCES `productos_venta` (`ID_Producto`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `recetas_ibfk_2` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumos` (`ID_Insumo`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for reportes
-- ----------------------------
DROP TABLE IF EXISTS `reportes`;
CREATE TABLE `reportes` (
  `ID_Reporte` int NOT NULL AUTO_INCREMENT,
  `Tipo` enum('Diario','Semanal','Mensual','Personalizado') NOT NULL,
  `Fecha_Inicio` date NOT NULL,
  `Fecha_Fin` date DEFAULT NULL,
  `Total_Gastos` decimal(10,2) DEFAULT NULL,
  `Total_Ventas` decimal(10,2) DEFAULT NULL,
  `Ganancia` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`ID_Reporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `ID_Rol` int NOT NULL AUTO_INCREMENT,
  `Nombre_Rol` varchar(50) NOT NULL,
  `Descripcion` varchar(255) NOT NULL,
  PRIMARY KEY (`ID_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `ID_Usuario` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Apellido` varchar(100) NOT NULL,
  `Usuario` varchar(50) NOT NULL,
  `Contraseña` varchar(255) NOT NULL,
  `ID_Rol` int NOT NULL,
  `Estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  PRIMARY KEY (`ID_Usuario`),
  UNIQUE KEY `Usuario` (`Usuario`),
  KEY `ID_Rol` (`ID_Rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ID_Rol`) REFERENCES `roles` (`ID_Rol`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for ventas
-- ----------------------------
DROP TABLE IF EXISTS `ventas`;
CREATE TABLE `ventas` (
  `ID_Venta` int NOT NULL AUTO_INCREMENT,
  `Fecha` date NOT NULL,
  `Total` decimal(10,2) NOT NULL,
  `Metodo_Pago` enum('Efectivo','Tarjeta','Transferencia') NOT NULL,
  `ID_Usuario` int NOT NULL,
  PRIMARY KEY (`ID_Venta`),
  KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of categorias
-- ----------------------------
INSERT INTO `categorias` VALUES (1, 'Caliente');
INSERT INTO `categorias` VALUES (2, 'Frappe');
INSERT INTO `categorias` VALUES (3, 'Comida');

-- ----------------------------
-- Records of modulos
-- ----------------------------
INSERT INTO `modulos` VALUES (10, 'Bitacora');
INSERT INTO `modulos` VALUES (2, 'Caja');
INSERT INTO `modulos` VALUES (8, 'Gastos');
INSERT INTO `modulos` VALUES (5, 'Insumos');
INSERT INTO `modulos` VALUES (3, 'Inventario');
INSERT INTO `modulos` VALUES (4, 'Productos');
INSERT INTO `modulos` VALUES (6, 'Recetas');
INSERT INTO `modulos` VALUES (9, 'Reportes');
INSERT INTO `modulos` VALUES (1, 'Usuarios');
INSERT INTO `modulos` VALUES (7, 'Ventas');

-- ----------------------------
-- Records of permisos_roles
-- ----------------------------
INSERT INTO `permisos_roles` VALUES (1, 1, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 2, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 3, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 4, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 5, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 6, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 7, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 8, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 9, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (1, 10, 1, 1, 1, 1);
INSERT INTO `permisos_roles` VALUES (2, 2, 1, 1, 0, 0);
INSERT INTO `permisos_roles` VALUES (2, 7, 1, 1, 0, 0);
INSERT INTO `permisos_roles` VALUES (3, 3, 1, 1, 1, 0);
INSERT INTO `permisos_roles` VALUES (3, 9, 1, 0, 0, 0);

-- ----------------------------
-- Records of productos_venta
-- ----------------------------
INSERT INTO `productos_venta` VALUES (1, 'Frappe de Oreo', 2, 55.00);

-- ----------------------------
-- Records of proveedores
-- ----------------------------
INSERT INTO `proveedores` VALUES (1, 'Bimbo', '6149871234', 'Calle Las Industrias 123');

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'Administrador', 'Acceso completo a todos los módulos');
INSERT INTO `roles` VALUES (2, 'Cajero', 'Acceso solo a Caja, Ventas y Reportes limitados');

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO `usuarios` VALUES (1, 'Ana', 'Rivas', 'ARivas', '1234Segura', 1, 'Activo');
INSERT INTO `usuarios` VALUES (2, 'Alan', 'Rivas', 'ARivas1', 'rivas123', 2, 'Inactivo');

-- ----------------------------
-- Records of ventas
-- ----------------------------
INSERT INTO `ventas` VALUES (1, '2025-04-14', 100.00, 'Efectivo', 2);

-- ----------------------------
-- Records of gastos
-- ----------------------------
INSERT INTO `gastos` VALUES (3, 'Agua', 500.00, '2025-04-14', 2);
INSERT INTO `gastos` VALUES (4, 'Reparacion piso', 1000.00, '2025-04-14', 1);

-- ----------------------------
-- Records of insumos
-- ----------------------------
INSERT INTO `insumos` VALUES (1, 'Leche', 1, 15.00, 'ml');
INSERT INTO `insumos` VALUES (2, 'Azúcar', 1, 12.00, 'g');
INSERT INTO `insumos` VALUES (3, 'Pan', 1, 2.50, 'Pza');
INSERT INTO `insumos` VALUES (4, 'Esencia de vainilla', 1, 0.80, 'tsp');

-- ----------------------------
-- Records of inventario
-- ----------------------------
INSERT INTO `inventario` VALUES (1, 3, 48);
INSERT INTO `inventario` VALUES (2, 1, 2000);

-- ----------------------------
-- Records of movimientos_inventario
-- ----------------------------
INSERT INTO `movimientos_inventario` VALUES (1, 3, 'Entrada', 50, '2025-04-14', 2, 'Compra de insumo');
INSERT INTO `movimientos_inventario` VALUES (2, 3, 'Salida', 2, '2025-04-14', 2, 'Venta');
INSERT INTO `movimientos_inventario` VALUES (3, 1, 'Entrada', 1000, '2025-04-14', 1, 'Compra');
INSERT INTO `movimientos_inventario` VALUES (4, 1, 'Entrada', 1000, '2025-04-14', 1, 'Compra');

-- ----------------------------
-- Records of recetas
-- ----------------------------
INSERT INTO `recetas` VALUES (1, 1, 200.00, 'ml');
INSERT INTO `recetas` VALUES (1, 2, 1.00, 'ml');

-- ----------------------------
-- Records of reportes
-- ----------------------------
INSERT INTO `reportes` VALUES (1, 'Semanal', '2025-03-21', '2025-03-27', 800.00, 0.00, -800.00);

-- ----------------------------
-- Records of bitacora
-- ----------------------------
INSERT INTO `bitacora` VALUES (1, 'Ventas', 'INSERT', 1, 2, '2025-04-14 21:03:01', 'Venta registrada', NULL, NULL);
INSERT INTO `bitacora` VALUES (2, 'Movimientos_Inventario', 'INSERT', 4, 1, '2025-04-14 21:04:01', 'Compra', NULL, NULL);
INSERT INTO `bitacora` VALUES (3, 'Gastos', 'INSERT', 2, 2, '2025-04-14 22:33:44', 'Gasto registrado', NULL, NULL);
INSERT INTO `bitacora` VALUES (4, 'Gastos', 'INSERT', 3, 2, '2025-04-14 22:35:46', 'Gasto registrado', NULL, NULL);
INSERT INTO `bitacora` VALUES (5, 'Gastos', 'UPDATE', 2, 2, '2025-04-14 22:38:34', 'Gasto modificado', NULL, NULL);
INSERT INTO `bitacora` VALUES (6, 'Gastos', 'DELETE', 2, 2, '2025-04-14 22:40:28', 'Gasto eliminado', NULL, NULL);
INSERT INTO `bitacora` VALUES (7, 'Gastos', 'INSERT', 4, 1, '2025-04-14 22:43:57', 'Gasto registrado', NULL, NULL);
INSERT INTO `bitacora` VALUES (8, 'Gastos', 'UPDATE', 4, 1, '2025-04-14 22:44:29', 'Gasto modificado', 'Descripcion: Reparacion piso, Monto: 1500.00', 'Descripcion: Reparacion piso, Monto: 1000.00');

SET FOREIGN_KEY_CHECKS = 1; 