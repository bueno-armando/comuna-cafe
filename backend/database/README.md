# Configuración de la Base de Datos

Este directorio contiene los archivos SQL necesarios para configurar la base de datos del sistema de gestión de café.

## Requisitos
- MySQL Server 8.0 o superior (para `comuna_cafe.sql`)
- XAMPP/LAMPP (para `comuna_cafe_xampp.sql`)

## Pasos para la configuración

1. Asegúrate de tener MySQL instalado y corriendo en tu sistema.

2. Importa la base de datos usando uno de estos métodos:

   **Si usas MySQL Server 8.0 o superior:**
   ```bash
   mysql -u root -p < comuna_cafe.sql
   ```

   **Si usas XAMPP/LAMPP:**
   ```bash
   /opt/lampp/bin/mysql -u root -p < comuna_cafe_xampp.sql
   ```

   **Usando MySQL Workbench:**
   - Abre MySQL Workbench
   - Conéctate a tu servidor MySQL
   - Ve a File > Open SQL Script
   - Selecciona el archivo `comuna_cafe.sql` o `comuna_cafe_xampp.sql` según tu versión
   - Haz clic en el botón de ejecutar (⚡)

3. Verifica que la base de datos se haya creado correctamente:
   ```sql
   SHOW DATABASES;
   USE comuna_cafe;
   SHOW TABLES;
   ```

## Estructura de la Base de Datos

La base de datos incluye las siguientes tablas principales:
- usuarios
- roles
- insumos
- proveedores
- inventario
- productos_venta
- categorias
- recetas
- ventas
- detalle_venta
- gastos
- reportes
- bitacora

También incluye procedimientos almacenados y triggers para:
- Creación automática de usuarios
- Generación de reportes
- Actualización de inventario
- Registro de bitácora

## Notas Importantes
- Asegúrate de que las credenciales en `src/config/database.js` coincidan con tu configuración de MySQL
- La base de datos incluye datos de ejemplo que puedes usar para pruebas
- Los usuarios de prueba tienen las siguientes credenciales:
  - Usuario: ARivas, Contraseña: 1234Segura (Rol: Administrador)
  - Usuario: ARivas1, Contraseña: rivas123 (Rol: Cajero)

## Solución de Problemas

Si encuentras el error "Unknown collation: 'utf8mb4_0900_ai_ci'", significa que estás usando una versión anterior de MySQL (como la que viene con XAMPP). En este caso:
1. Usa el archivo `comuna_cafe_xampp.sql` en lugar de `comuna_cafe.sql`
2. O actualiza tu versión de MySQL a 8.0 o superior 