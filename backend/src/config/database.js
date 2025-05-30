const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Configuración de base de datos:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    // No mostramos la contraseña por seguridad
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión
pool.getConnection()
    .then(connection => {
        console.log('Conexión a la base de datos establecida exitosamente');
        connection.release();
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', {
            message: err.message,
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
    });

module.exports = pool; 