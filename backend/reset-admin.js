const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('./src/config/database');

/**
 * Script de emergencia para resetear contraseña de administrador
 * USO: node reset-admin.js
 */

async function resetAdminPassword() {
    const connection = await mysql.createConnection(config);
    
    try {
        console.log('🔧 Script de recuperación de contraseña de administrador');
        console.log('==================================================');
        
        // Nueva contraseña por defecto
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Buscar usuario administrador
        const [admins] = await connection.execute(
            'SELECT ID_Usuario, Usuario, Rol FROM usuarios WHERE Rol = "Administrador" LIMIT 1'
        );
        
        if (admins.length === 0) {
            console.log('❌ No se encontró ningún administrador en el sistema');
            console.log('💡 Creando cuenta de administrador por defecto...');
            
            await connection.execute(
                'INSERT INTO usuarios (Usuario, Contraseña, Rol, Estado) VALUES (?, ?, "Administrador", "Activo")',
                ['admin', hashedPassword]
            );
            
            console.log('✅ Cuenta de administrador creada:');
            console.log('   Usuario: admin');
            console.log('   Contraseña: admin123');
        } else {
            const admin = admins[0];
            console.log(`🔄 Reseteando contraseña para administrador: ${admin.Usuario}`);
            
            await connection.execute(
                'UPDATE usuarios SET Contraseña = ? WHERE ID_Usuario = ?',
                [hashedPassword, admin.ID_Usuario]
            );
            
            console.log('✅ Contraseña reseteada exitosamente');
            console.log(`   Usuario: ${admin.Usuario}`);
            console.log('   Nueva contraseña: admin123');
        }
        
        console.log('\n⚠️  IMPORTANTE:');
        console.log('   - Cambia la contraseña inmediatamente después del login');
        console.log('   - Elimina este script después de usarlo');
        console.log('   - Guarda este script en un lugar seguro');
        
    } catch (error) {
        console.error('❌ Error durante el reset:', error.message);
    } finally {
        await connection.end();
    }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
    resetAdminPassword();
}

module.exports = resetAdminPassword; 