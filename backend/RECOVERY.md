# Recuperación del Sistema - La Comuna Café

## 🔧 Recuperación de Contraseña de Administrador

### Método 1: Script de Emergencia (Recomendado)

Si el administrador olvida su contraseña, ejecuta:

```bash
cd backend
node reset-admin.js
```

**Resultado:**
- Si existe un administrador: resetea su contraseña
- Si no existe: crea un nuevo administrador
- Nueva contraseña: `admin123`

### Método 2: Reset Manual en Base de Datos

1. Conectar a MySQL/MariaDB:
```bash
mysql -u root -p comuna_cafe
```

2. Resetear contraseña:
```sql
UPDATE usuarios 
SET Contraseña = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE Rol = 'Administrador' 
LIMIT 1;
-- Esta es la contraseña: 'password'
```

### Método 3: Crear Nuevo Administrador

```sql
INSERT INTO usuarios (Usuario, Contraseña, Rol, Estado) 
VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Activo');
-- Contraseña: 'password'
```

## ⚠️ Medidas de Seguridad

1. **Cambiar contraseña inmediatamente** después del login
2. **Eliminar el script** después de usarlo
3. **Guardar credenciales** en lugar seguro
4. **Documentar** el proceso de recuperación

## 📋 Checklist de Recuperación

- [ ] Ejecutar script de recuperación
- [ ] Verificar login con nuevas credenciales
- [ ] Cambiar contraseña por una segura
- [ ] Eliminar script de recuperación
- [ ] Documentar incidente

## 🔐 Contraseñas de Emergencia

- **admin123** - Script de recuperación
- **password** - Reset manual en BD

---

**Nota**: Este archivo debe mantenerse en un lugar seguro y accesible solo para administradores del sistema. 