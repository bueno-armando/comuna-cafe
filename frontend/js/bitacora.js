// Configuración de la API
const API = {
    URL: 'http://localhost:3000/api/bitacora',
    getToken: () => localStorage.getItem('token')
};

// Función para verificar autenticación
function checkAuth() {
    const token = API.getToken();
    if (!token) {
        window.location.href = 'Inicio%20Sesion.html';
        return false;
    }
    return true;
}

// Función para hacer peticiones a la API
async function fetchAPI(endpoint, options = {}) {
    try {
        const token = API.getToken();
        const response = await fetch(`${API.URL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}

// Función para cargar todos los registros de bitácora
async function loadBitacora() {
    try {
        const registros = await fetchAPI('');
        renderBitacora(registros);
    } catch (error) {
        console.error('Error al cargar bitácora:', error);
        alert('Error al cargar los registros de bitácora');
    }
}

// Función para filtrar por rango de fechas
async function filterByDateRange() {
    const fechaInicio = document.querySelector('input[type="date"]:first-of-type').value;
    const fechaFin = document.querySelector('input[type="date"]:last-of-type').value;

    if (!fechaInicio || !fechaFin) {
        alert('Por favor seleccione ambas fechas');
        return;
    }

    try {
        const registros = await fetchAPI(`/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        renderBitacora(registros);
    } catch (error) {
        console.error('Error al filtrar por fechas:', error);
        alert('Error al filtrar los registros');
    }
}

// Función para filtrar por usuario
async function filterByUser(searchTerm) {
    if (!searchTerm) {
        await loadBitacora();
        return;
    }

    try {
        const registros = await fetchAPI('');
        const filteredRegistros = registros.filter(registro => 
            registro.Usuario.toLowerCase().includes(searchTerm.toLowerCase())
        );
        renderBitacora(filteredRegistros);
    } catch (error) {
        console.error('Error al filtrar por usuario:', error);
        alert('Error al filtrar los registros');
    }
}

// Función para renderizar los registros en la tabla
function renderBitacora(registros) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    registros.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.ID_Bitacora}</td>
            <td>${registro.Tabla_Modificada}</td>
            <td><span class="badge badge-${getOperationClass(registro.Operacion)} rounded-pill">${registro.Operacion}</span></td>
            <td>${registro.Usuario}</td>
            <td>${formatDate(registro.Fecha)}</td>
            <td>${registro.Descripcion}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para obtener la clase CSS según la operación
function getOperationClass(operacion) {
    switch (operacion.toUpperCase()) {
        case 'INSERT':
            return 'insert';
        case 'UPDATE':
            return 'update';
        case 'DELETE':
            return 'delete';
        default:
            return 'secondary';
    }
}

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para inicializar el módulo
function initBitacora() {
    console.log('=== Inicializando módulo Bitácora ===');
    
    if (!checkAuth()) {
        console.log('No hay sesión activa, redirigiendo al login...');
        return;
    }

    // Cargar registros iniciales
    loadBitacora();

    // Configurar eventos
    const searchInput = document.querySelector('input[type="text"]');
    searchInput.addEventListener('input', (e) => filterByUser(e.target.value));

    const filterButton = document.querySelector('.date-filter button');
    filterButton.addEventListener('click', filterByDateRange);

    // Configurar paginación (si se implementa en el futuro)
    setupPagination();
}

// Función para configurar la paginación
function setupPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    const pageLinks = pagination.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Implementar lógica de paginación si se requiere
            console.log('Paginación clickeada:', e.target.textContent);
        });
    });
}

// Exportar la función de inicialización
window.initBitacora = initBitacora; 