const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Obtener el header de autorización
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader); // Debug log

    if (!authHeader) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    // Verificar si el header tiene el formato correcto
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const token = parts[1];
    console.log('Token extraído:', token); // Debug log

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded); // Debug log
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error al verificar token:', error); // Debug log
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = verifyToken; 