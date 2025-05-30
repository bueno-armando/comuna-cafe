-- Crear tabla de Proveedores
CREATE TABLE IF NOT EXISTS Proveedores (
    ID_Proveedor INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20),
    Email VARCHAR(100),
    Direccion TEXT,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Insumos
CREATE TABLE IF NOT EXISTS Insumos (
    ID_Insumo INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    ID_Proveedor INT,
    Costo DECIMAL(10,2) NOT NULL,
    Unidad VARCHAR(20) NOT NULL,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Proveedor) REFERENCES Proveedores(ID_Proveedor)
);

-- Insertar algunos proveedores de ejemplo
INSERT INTO Proveedores (Nombre, Telefono, Email, Direccion) VALUES
('Proveedor 1', '123-456-7890', 'proveedor1@email.com', 'Dirección 1'),
('Proveedor 2', '234-567-8901', 'proveedor2@email.com', 'Dirección 2'),
('Proveedor 3', '345-678-9012', 'proveedor3@email.com', 'Dirección 3');

-- Insertar algunos insumos de ejemplo
INSERT INTO Insumos (Nombre, ID_Proveedor, Costo, Unidad) VALUES
('Café Arábica', 1, 150.00, 'kg'),
('Leche', 2, 25.00, 'L'),
('Azúcar', 3, 20.00, 'kg'),
('Canela', 1, 30.00, 'kg'),
('Chocolate', 2, 45.00, 'kg'); 