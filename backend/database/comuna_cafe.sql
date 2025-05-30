/*
 Navicat Premium Dump SQL

 Source Server         : CAFE
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : comuna_cafe

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 14/04/2025 22:50:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bitacora
-- ----------------------------
DROP TABLE IF EXISTS `bitacora`;
CREATE TABLE `bitacora`  (
  `ID_Bitacora` int NOT NULL AUTO_INCREMENT,
  `Tabla_Modificada` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Operacion` enum('INSERT','UPDATE','DELETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ID_Registro` int NOT NULL,
  `ID_Usuario` int NOT NULL,
  `Fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Datos_Anteriores` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `Datos_Nuevos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`ID_Bitacora`) USING BTREE,
  INDEX `ID_Usuario`(`ID_Usuario` ASC) USING BTREE,
  CONSTRAINT `bitacora_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

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

-- ----------------------------
-- Table structure for categorias
-- ----------------------------
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias`  (
  `ID_Categoria` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`ID_Categoria`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categorias
-- ----------------------------
INSERT INTO `categorias` VALUES (1, 'Caliente');
INSERT INTO `categorias` VALUES (2, 'Frappe');
INSERT INTO `categorias` VALUES (3, 'Comida');

-- ----------------------------
-- Table structure for detalle_venta
-- ----------------------------
DROP TABLE IF EXISTS `detalle_venta`;
CREATE TABLE `detalle_venta`  (
  `ID_Detalle` int NOT NULL AUTO_INCREMENT,
  `ID_Venta` int NOT NULL,
  `ID_Producto` int NOT NULL,
  `Cantidad` int NOT NULL,
  `Subtotal` decimal(10, 2) NOT NULL,
  PRIMARY KEY (`ID_Detalle`) USING BTREE,
  INDEX `ID_Venta`(`ID_Venta` ASC) USING BTREE,
  INDEX `ID_Producto`(`ID_Producto` ASC) USING BTREE,
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`ID_Venta`) REFERENCES `ventas` (`ID_Venta`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`ID_Producto`) REFERENCES `productos_venta` (`ID_Producto`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of detalle_venta
-- ----------------------------

-- ----------------------------
-- Table structure for gastos
-- ----------------------------
DROP TABLE IF EXISTS `gastos`;
CREATE TABLE `gastos`  (
  `ID_Gasto` int NOT NULL AUTO_INCREMENT,
  `Descripcion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Monto` decimal(10, 2) NOT NULL,
  `Fecha` date NOT NULL,
  `ID_Usuario` int NOT NULL,
  PRIMARY KEY (`ID_Gasto`) USING BTREE,
  INDEX `ID_Usuario`(`ID_Usuario` ASC) USING BTREE,
  CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of gastos
-- ----------------------------
INSERT INTO `gastos` VALUES (3, 'Agua', 500.00, '2025-04-14', 2);
INSERT INTO `gastos` VALUES (4, 'Reparacion piso', 1000.00, '2025-04-14', 1);

-- ----------------------------
-- Table structure for insumos
-- ----------------------------
DROP TABLE IF EXISTS `insumos`;
CREATE TABLE `insumos`  (
  `ID_Insumo` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ID_Proveedor` int NOT NULL,
  `Costo` decimal(10, 2) NOT NULL,
  `Unidad` enum('ml','g','Pza','cc','oz','tsp','tbsp') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`ID_Insumo`) USING BTREE,
  INDEX `ID_Proveedor`(`ID_Proveedor` ASC) USING BTREE,
  CONSTRAINT `insumos_ibfk_1` FOREIGN KEY (`ID_Proveedor`) REFERENCES `proveedores` (`ID_Proveedor`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of insumos
-- ----------------------------
INSERT INTO `insumos` VALUES (1, 'Leche', 1, 15.00, 'ml');
INSERT INTO `insumos` VALUES (2, 'Azúcar', 1, 12.00, 'g');
INSERT INTO `insumos` VALUES (3, 'Pan', 1, 2.50, 'Pza');
INSERT INTO `insumos` VALUES (4, 'Esencia de vainilla', 1, 0.80, 'tsp');

-- ----------------------------
-- Table structure for inventario
-- ----------------------------
DROP TABLE IF EXISTS `inventario`;
CREATE TABLE `inventario`  (
  `ID_Inventario` int NOT NULL AUTO_INCREMENT,
  `ID_Insumo` int NOT NULL,
  `Cantidad_Disponible` int NOT NULL,
  PRIMARY KEY (`ID_Inventario`) USING BTREE,
  INDEX `ID_Insumo`(`ID_Insumo` ASC) USING BTREE,
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumos` (`ID_Insumo`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventario
-- ----------------------------
INSERT INTO `inventario` VALUES (1, 3, 48);
INSERT INTO `inventario` VALUES (2, 1, 2000);

-- ----------------------------
-- Table structure for modulos
-- ----------------------------
DROP TABLE IF EXISTS `modulos`;
CREATE TABLE `modulos`  (
  `id_modulo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id_modulo`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

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
-- Table structure for movimientos_inventario
-- ----------------------------
DROP TABLE IF EXISTS `movimientos_inventario`;
CREATE TABLE `movimientos_inventario`  (
  `ID_Movimiento` int NOT NULL AUTO_INCREMENT,
  `ID_Insumo` int NOT NULL,
  `Tipo` enum('Entrada','Salida') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Cantidad` int NOT NULL,
  `Fecha` date NOT NULL,
  `ID_Usuario` int NOT NULL,
  `Descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`ID_Movimiento`) USING BTREE,
  INDEX `ID_Insumo`(`ID_Insumo` ASC) USING BTREE,
  INDEX `ID_Usuario`(`ID_Usuario` ASC) USING BTREE,
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumos` (`ID_Insumo`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of movimientos_inventario
-- ----------------------------
INSERT INTO `movimientos_inventario` VALUES (1, 3, 'Entrada', 50, '2025-04-14', 2, 'Compra de insumo');
INSERT INTO `movimientos_inventario` VALUES (2, 3, 'Salida', 2, '2025-04-14', 2, 'Venta');
INSERT INTO `movimientos_inventario` VALUES (3, 1, 'Entrada', 1000, '2025-04-14', 1, 'Compra');
INSERT INTO `movimientos_inventario` VALUES (4, 1, 'Entrada', 1000, '2025-04-14', 1, 'Compra');

-- ----------------------------
-- Table structure for permisos_roles
-- ----------------------------
DROP TABLE IF EXISTS `permisos_roles`;
CREATE TABLE `permisos_roles`  (
  `id_rol` int NOT NULL,
  `id_modulo` int NOT NULL,
  `puede_ver` tinyint(1) NULL DEFAULT 0,
  `puede_agregar` tinyint(1) NULL DEFAULT 0,
  `puede_editar` tinyint(1) NULL DEFAULT 0,
  `puede_eliminar` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id_rol`, `id_modulo`) USING BTREE,
  INDEX `id_modulo`(`id_modulo` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

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
-- Table structure for productos_venta
-- ----------------------------
DROP TABLE IF EXISTS `productos_venta`;
CREATE TABLE `productos_venta`  (
  `ID_Producto` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ID_Categoria` int NOT NULL,
  `Precio_Venta` decimal(10, 2) NOT NULL,
  PRIMARY KEY (`ID_Producto`) USING BTREE,
  INDEX `ID_Categoria`(`ID_Categoria` ASC) USING BTREE,
  CONSTRAINT `productos_venta_ibfk_1` FOREIGN KEY (`ID_Categoria`) REFERENCES `categorias` (`ID_Categoria`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of productos_venta
-- ----------------------------
INSERT INTO `productos_venta` VALUES (1, 'Frappe de Oreo', 2, 55.00);

-- ----------------------------
-- Table structure for proveedores
-- ----------------------------
DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores`  (
  `ID_Proveedor` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Direccion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`ID_Proveedor`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of proveedores
-- ----------------------------
INSERT INTO `proveedores` VALUES (1, 'Bimbo', '6149871234', 'Calle Las Industrias 123');

-- ----------------------------
-- Table structure for recetas
-- ----------------------------
DROP TABLE IF EXISTS `recetas`;
CREATE TABLE `recetas`  (
  `ID_Producto` int NOT NULL,
  `ID_Insumo` int NOT NULL,
  `Cantidad_Necesaria` decimal(10, 2) NOT NULL,
  `Unidad` enum('ml','g','Pza','cc','oz','tsp','tbsp') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`ID_Producto`, `ID_Insumo`) USING BTREE,
  INDEX `ID_Insumo`(`ID_Insumo` ASC) USING BTREE,
  CONSTRAINT `recetas_ibfk_1` FOREIGN KEY (`ID_Producto`) REFERENCES `productos_venta` (`ID_Producto`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `recetas_ibfk_2` FOREIGN KEY (`ID_Insumo`) REFERENCES `insumos` (`ID_Insumo`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recetas
-- ----------------------------
INSERT INTO `recetas` VALUES (1, 1, 200.00, 'ml');
INSERT INTO `recetas` VALUES (1, 2, 1.00, 'ml');

-- ----------------------------
-- Table structure for reportes
-- ----------------------------
DROP TABLE IF EXISTS `reportes`;
CREATE TABLE `reportes`  (
  `ID_Reporte` int NOT NULL AUTO_INCREMENT,
  `Tipo` enum('Diario','Semanal','Mensual','Personalizado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Fecha_Inicio` date NOT NULL,
  `Fecha_Fin` date NULL DEFAULT NULL,
  `Total_Gastos` decimal(10, 2) NULL DEFAULT NULL,
  `Total_Ventas` decimal(10, 2) NULL DEFAULT NULL,
  `Ganancia` decimal(10, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`ID_Reporte`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reportes
-- ----------------------------
INSERT INTO `reportes` VALUES (1, 'Semanal', '2025-03-21', '2025-03-27', 800.00, 0.00, -800.00);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `ID_Rol` int NOT NULL AUTO_INCREMENT,
  `Nombre_Rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`ID_Rol`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'Administrador', 'Acceso completo a todos los módulos');
INSERT INTO `roles` VALUES (2, 'Cajero', 'Acceso solo a Caja, Ventas y Reportes limitados');

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios`  (
  `ID_Usuario` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Usuario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Contraseña` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ID_Rol` int NOT NULL,
  `Estado` enum('Activo','Inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Activo',
  PRIMARY KEY (`ID_Usuario`) USING BTREE,
  UNIQUE INDEX `Usuario`(`Usuario` ASC) USING BTREE,
  INDEX `ID_Rol`(`ID_Rol` ASC) USING BTREE,
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ID_Rol`) REFERENCES `roles` (`ID_Rol`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO `usuarios` VALUES (1, 'Ana', 'Rivas', 'ARivas', '1234Segura', 1, 'Activo');
INSERT INTO `usuarios` VALUES (2, 'Alan', 'Rivas', 'ARivas1', 'rivas123', 2, 'Inactivo');

-- ----------------------------
-- Table structure for ventas
-- ----------------------------
DROP TABLE IF EXISTS `ventas`;
CREATE TABLE `ventas`  (
  `ID_Venta` int NOT NULL AUTO_INCREMENT,
  `Fecha` date NOT NULL,
  `Total` decimal(10, 2) NOT NULL,
  `Metodo_Pago` enum('Efectivo','Tarjeta','Transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ID_Usuario` int NOT NULL,
  PRIMARY KEY (`ID_Venta`) USING BTREE,
  INDEX `ID_Usuario`(`ID_Usuario` ASC) USING BTREE,
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ventas
-- ----------------------------
INSERT INTO `ventas` VALUES (1, '2025-04-14', 100.00, 'Efectivo', 2);

-- ----------------------------
-- Procedure structure for CrearUsuario
-- ----------------------------
DROP PROCEDURE IF EXISTS `CrearUsuario`;
delimiter ;;
CREATE PROCEDURE `CrearUsuario`(IN p_nombre VARCHAR(100),         -- Nombre del nuevo usuario
    IN p_apellido VARCHAR(100),       -- Apellido del nuevo usuario
    IN p_contrasena VARCHAR(255),     -- Contraseña (ya encriptada o no, ?)
    IN p_rol_id INT)
BEGIN
    -- Declaración de variables internas
    DECLARE base_usuario VARCHAR(100);     -- Parte base del nombre de usuario (Ej. ARivas)
    DECLARE nuevo_usuario VARCHAR(100);    -- Nombre final que se insertará (puede llevar número)
    DECLARE contador INT DEFAULT 0;        -- Sufijo numérico si ya existe un usuario con ese nombre

    -- Se construye el nombre de usuario base usando la primera letra del nombre y el apellido completo
    -- Ejemplo: Ana Rivas → ARivas
    SET base_usuario = CONCAT(LEFT(p_nombre, 1), p_apellido);
    SET nuevo_usuario = base_usuario;

    -- Mientras ya exista un usuario con ese nombre, se añade un número al final y se vuelve a intentar
    -- Ejemplo: ARivas → ARivas1 → ARivas2, etc.
    WHILE EXISTS (SELECT 1 FROM usuarios WHERE Usuario = nuevo_usuario) DO
        SET contador = contador + 1;
        SET nuevo_usuario = CONCAT(base_usuario, contador);
    END WHILE;

    -- Inserta finalmente el usuario con un nombre de usuario único y estado "Activo"
    INSERT INTO usuarios (Nombre, Apellido, Usuario, Contraseña, ID_Rol, Estado)
    VALUES (p_nombre, p_apellido, nuevo_usuario, p_contrasena, p_rol_id, 'Activo');
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for generar_reporte
-- ----------------------------
DROP PROCEDURE IF EXISTS `generar_reporte`;
delimiter ;;
CREATE PROCEDURE `generar_reporte`(IN p_tipo VARCHAR(50),
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE)
BEGIN
    DECLARE total_gastos DECIMAL(10,2);
    DECLARE total_ventas DECIMAL(10,2);
    DECLARE ganancia DECIMAL(10,2);

    -- Calcular total de gastos
    SELECT IFNULL(SUM(Monto), 0)
    INTO total_gastos
    FROM gastos
    WHERE Fecha BETWEEN p_fecha_inicio AND p_fecha_fin;

    -- Calcular total de ventas
    SELECT IFNULL(SUM(Total), 0)
    INTO total_ventas
    FROM ventas
    WHERE Fecha BETWEEN p_fecha_inicio AND p_fecha_fin;

    -- Calcular ganancia
    SET ganancia = total_ventas - total_gastos;

    -- Insertar el reporte en la tabla
    INSERT INTO reportes (Tipo, Fecha_Inicio, Fecha_Fin, Total_Gastos, Total_Ventas, Ganancia)
    VALUES (p_tipo, p_fecha_inicio, p_fecha_fin, total_gastos, total_ventas, ganancia);
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table gastos
-- ----------------------------
DROP TRIGGER IF EXISTS `log_insert_gasto`;
delimiter ;;
CREATE TRIGGER `log_insert_gasto` AFTER INSERT ON `gastos` FOR EACH ROW BEGIN
  INSERT INTO bitacora (
    Tabla_Modificada, Operacion, ID_Registro, ID_Usuario, Fecha, Descripcion
  )
  VALUES (
    'Gastos', 'INSERT', NEW.ID_Gasto, NEW.ID_Usuario, NOW(), 'Gasto registrado'
  );
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table gastos
-- ----------------------------
DROP TRIGGER IF EXISTS `log_update_gasto`;
delimiter ;;
CREATE TRIGGER `log_update_gasto` AFTER UPDATE ON `gastos` FOR EACH ROW BEGIN
  INSERT INTO bitacora (
    Tabla_Modificada, Operacion, ID_Registro, ID_Usuario, Fecha, Descripcion,
    Datos_Anteriores, Datos_Nuevos
  )
  VALUES (
    'Gastos',
    'UPDATE',
    NEW.ID_Gasto,
    NEW.ID_Usuario,
    NOW(),
    'Gasto modificado',
    CONCAT('Descripcion: ', OLD.Descripcion, ', Monto: ', OLD.Monto),
    CONCAT('Descripcion: ', NEW.Descripcion, ', Monto: ', NEW.Monto)
  );
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table gastos
-- ----------------------------
DROP TRIGGER IF EXISTS `log_delete_gasto`;
delimiter ;;
CREATE TRIGGER `log_delete_gasto` AFTER DELETE ON `gastos` FOR EACH ROW BEGIN
  INSERT INTO bitacora (
    Tabla_Modificada, Operacion, ID_Registro, ID_Usuario, Fecha, Descripcion
  )
  VALUES (
    'Gastos', 'DELETE', OLD.ID_Gasto, OLD.ID_Usuario, NOW(), 'Gasto eliminado'
  );
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table movimientos_inventario
-- ----------------------------
DROP TRIGGER IF EXISTS `actualizar_inventario`;
delimiter ;;
CREATE TRIGGER `actualizar_inventario` AFTER INSERT ON `movimientos_inventario` FOR EACH ROW BEGIN
    -- Si el movimiento es de tipo 'Entrada'
    IF NEW.Tipo = 'Entrada' THEN

        -- Verifica si el insumo ya existe en el inventario
        IF EXISTS (SELECT 1 FROM inventario WHERE ID_Insumo = NEW.ID_Insumo) THEN
            -- Si existe, suma la cantidad ingresada al stock actual
            UPDATE inventario
            SET Cantidad_Disponible = Cantidad_Disponible + NEW.Cantidad
            WHERE ID_Insumo = NEW.ID_Insumo;
        ELSE
            -- Si no existe, crea el registro en inventario con la cantidad indicada
            INSERT INTO inventario (ID_Insumo, Cantidad_Disponible)
            VALUES (NEW.ID_Insumo, NEW.Cantidad);
        END IF;

    -- Si el movimiento es de tipo 'Salida'
    ELSEIF NEW.Tipo = 'Salida' THEN

        -- Verifica si el insumo existe en el inventario
        IF EXISTS (SELECT 1 FROM inventario WHERE ID_Insumo = NEW.ID_Insumo) THEN
            -- Si existe, descuenta la cantidad del stock actual
            UPDATE inventario
            SET Cantidad_Disponible = Cantidad_Disponible - NEW.Cantidad
            WHERE ID_Insumo = NEW.ID_Insumo;
        ELSE
            -- Si el insumo no está registrado, lanza un error y cancela la operación
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: No existe el insumo en inventario para registrar salida.';
        END IF;

    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table movimientos_inventario
-- ----------------------------
DROP TRIGGER IF EXISTS `log_mov_inv`;
delimiter ;;
CREATE TRIGGER `log_mov_inv` AFTER INSERT ON `movimientos_inventario` FOR EACH ROW BEGIN
  INSERT INTO bitacora (
    Tabla_Modificada, Operacion, ID_Registro, ID_Usuario, Fecha, Descripcion
  )
  VALUES (
    'Movimientos_Inventario', 'Insert', NEW.ID_Movimiento, NEW.ID_Usuario, NOW(), NEW.Descripcion
  );
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table ventas
-- ----------------------------
DROP TRIGGER IF EXISTS `log_venta`;
delimiter ;;
CREATE TRIGGER `log_venta` AFTER INSERT ON `ventas` FOR EACH ROW BEGIN
  INSERT INTO bitacora (
    Tabla_Modificada, Operacion, ID_Registro, ID_Usuario, Fecha, Descripcion
  )
  VALUES (
    'Ventas', 'Insert', NEW.ID_Venta, NEW.ID_Usuario, NOW(), 'Venta registrada'
  );
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
