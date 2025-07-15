(function() {
    // Configuración de la API
    const API = {
        URL: 'http://localhost:3000/api/bitacora',
        getToken: () => localStorage.getItem('token')
    };

    // Variables globales
    let bitacora = [];
    let totalRegistros = 0;
    let totalPages = 1;
    let currentFilters = { page: 1, limit: 11 };

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

    // Función para cargar registros de bitácora con filtros y paginación
    async function loadBitacora() {
        try {
            const queryParams = new URLSearchParams(currentFilters).toString();
            const endpoint = queryParams ? `?${queryParams}` : '';
            const data = await fetchAPI(endpoint);
            bitacora = data.registros || [];
            totalRegistros = data.totalRegistros || 0;
            totalPages = data.totalPages || 1;
            renderTable();
            renderPagination();
        } catch (error) {
            console.error('Error al cargar bitácora:', error);
            showAlert('Error al cargar los registros de bitácora', 'danger');
        }
    }

    // Función para renderizar la tabla de bitácora
    function renderTable() {
        const tbody = document.getElementById('bitacoraTable');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (bitacora.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-inbox me-2"></i>No hay registros de bitácora
                    </td>
                </tr>
            `;
            return;
        }
        bitacora.forEach(registro => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${registro.ID_Bitacora}</td>
                <td>${registro.Tabla_Modificada || '-'}</td>
                <td><span class="badge ${getOperationClass(registro.Operacion)} rounded-pill">${registro.Operacion}</span></td>
                <td>${registro.Usuario}</td>
                <td>${formatDate(registro.Fecha)}</td>
                <td>${registro.Descripcion}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Función para obtener la clase CSS según la operación
    function getOperationClass(operacion) {
        switch (operacion?.toUpperCase()) {
            case 'INSERT':
                return 'bg-success text-white';
            case 'UPDATE':
                return 'bg-warning text-dark';
            case 'DELETE':
                return 'bg-danger text-white';
            case 'LOGIN':
                return 'bg-info text-dark';
            default:
                return 'bg-secondary text-white';
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

    // Función para renderizar la paginación
    function renderPagination() {
        const pagination = document.getElementById('bitacoraPagination');
        if (!pagination) return;
        pagination.innerHTML = '';
        if (totalPages <= 1) return;
        const createPageItem = (page, active = false, disabled = false, label = null) => {
            const li = document.createElement('li');
            li.className = `page-item${active ? ' active' : ''}${disabled ? ' disabled' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = label || page;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (!disabled && currentFilters.page !== page) {
                    currentFilters.page = page;
                    loadBitacora();
                }
            });
            li.appendChild(a);
            return li;
        };
        // Flecha izquierda
        pagination.appendChild(createPageItem(currentFilters.page - 1, false, currentFilters.page === 1, '«'));
        // Páginas
        for (let i = 1; i <= totalPages; i++) {
            pagination.appendChild(createPageItem(i, i === currentFilters.page));
        }
        // Flecha derecha
        pagination.appendChild(createPageItem(currentFilters.page + 1, false, currentFilters.page === totalPages, '»'));
    }

    // Función para mostrar alertas (notificación de filtros aplicados)
    function showAlert(message, type = 'info') {
        const alertDiv = document.getElementById('filtrosAplicados');
        const texto = document.getElementById('textoFiltrosAplicados');
        if (!alertDiv || !texto) return;
        texto.textContent = message;
        alertDiv.classList.remove('d-none');
        alertDiv.classList.remove('alert-info', 'alert-danger', 'alert-success', 'alert-warning');
        alertDiv.classList.add(`alert-${type}`);
    }

    // Función para ocultar la alerta de filtros
    function hideAlert() {
        const alertDiv = document.getElementById('filtrosAplicados');
        if (alertDiv) alertDiv.classList.add('d-none');
    }

    // Función para mostrar los filtros aplicados
    function mostrarFiltrosAplicados() {
        let msg = 'Filtros aplicados: ';
        const filtros = [];
        if (currentFilters.usuario) filtros.push(`Usuario: ${currentFilters.usuario}`);
        if (currentFilters.operacion) filtros.push(`Operación: ${currentFilters.operacion}`);
        if (currentFilters.descripcion) filtros.push(`Descripción: ${currentFilters.descripcion}`);
        if (currentFilters.fechaInicio) filtros.push(`Desde: ${currentFilters.fechaInicio}`);
        if (currentFilters.fechaFin) filtros.push(`Hasta: ${currentFilters.fechaFin}`);
        if (filtros.length === 0) msg = 'Sin filtros activos';
        else msg += filtros.join(', ');
        showAlert(msg, 'info');
    }

    // Función para limpiar todos los filtros
    function clearFilters() {
        currentFilters = { page: 1, limit: 11 };
        document.getElementById('buscarUsuario').value = '';
        document.getElementById('buscarOperacion').value = '';
        document.getElementById('buscarDescripcion').value = '';
        document.getElementById('fechaInicio').value = '';
        document.getElementById('fechaFin').value = '';
        // Quitar selección de filtros rápidos
        document.querySelectorAll('[data-period]').forEach(btn => btn.classList.remove('active'));
        document.getElementById('datePickerContainer').style.display = 'none';
        document.getElementById('aplicarFiltrosContainer').classList.add('d-none');
        loadBitacora();
        hideAlert();
    }

    // Función para inicializar los filtros y eventos
    function setupFilters() {
        // Filtros rápidos
        const quickFilterButtons = document.querySelectorAll('[data-period]');
        const datePickerContainer = document.getElementById('datePickerContainer');
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        const aplicarFiltrosContainer = document.getElementById('aplicarFiltrosContainer');
        const aplicarFiltrosBtn = document.getElementById('aplicarFiltrosBtn');
        const limpiarFiltrosBtn = document.getElementById('limpiarFiltrosBtn');

        quickFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                quickFilterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const period = this.getAttribute('data-period');
                const today = new Date();
                switch(period) {
                    case 'hoy':
                        const todayStr = today.toISOString().split('T')[0];
                        currentFilters.fechaInicio = todayStr;
                        currentFilters.fechaFin = todayStr;
                        datePickerContainer.style.display = 'none';
                        aplicarFiltrosContainer.classList.add('d-none');
                        currentFilters.page = 1;
                        loadBitacora();
                        mostrarFiltrosAplicados();
                        break;
                    case 'semana':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        const weekAgoStr = weekAgo.toISOString().split('T')[0];
                        const todayStr2 = today.toISOString().split('T')[0];
                        currentFilters.fechaInicio = weekAgoStr;
                        currentFilters.fechaFin = todayStr2;
                        datePickerContainer.style.display = 'none';
                        aplicarFiltrosContainer.classList.add('d-none');
                        currentFilters.page = 1;
                        loadBitacora();
                        mostrarFiltrosAplicados();
                        break;
                    case 'mes':
                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
                        const lastDayStr = lastDayOfMonth.toISOString().split('T')[0];
                        currentFilters.fechaInicio = firstDayStr;
                        currentFilters.fechaFin = lastDayStr;
                        datePickerContainer.style.display = 'none';
                        aplicarFiltrosContainer.classList.add('d-none');
                        currentFilters.page = 1;
                        loadBitacora();
                        mostrarFiltrosAplicados();
                        break;
                    case 'personalizado':
                        datePickerContainer.style.display = 'block';
                        aplicarFiltrosContainer.classList.remove('d-none');
                        break;
                }
            });
        });

        // Aplicar filtros personalizados
        if (aplicarFiltrosBtn) {
            aplicarFiltrosBtn.addEventListener('click', function() {
                const fechaInicioVal = fechaInicio.value;
                const fechaFinVal = fechaFin.value;
                if (fechaInicioVal) currentFilters.fechaInicio = fechaInicioVal;
                else delete currentFilters.fechaInicio;
                if (fechaFinVal) currentFilters.fechaFin = fechaFinVal;
                else delete currentFilters.fechaFin;
                currentFilters.page = 1;
                loadBitacora();
                mostrarFiltrosAplicados();
            });
        }

        // Limpiar filtros
        if (limpiarFiltrosBtn) {
            limpiarFiltrosBtn.addEventListener('click', clearFilters);
        }

        // Inputs de búsqueda
        document.getElementById('buscarUsuario').addEventListener('input', function() {
            if (this.value) currentFilters.usuario = this.value;
            else delete currentFilters.usuario;
            currentFilters.page = 1;
            loadBitacora();
            mostrarFiltrosAplicados();
        });
        document.getElementById('buscarOperacion').addEventListener('input', function() {
            if (this.value) currentFilters.operacion = this.value;
            else delete currentFilters.operacion;
            currentFilters.page = 1;
            loadBitacora();
            mostrarFiltrosAplicados();
        });
        document.getElementById('buscarDescripcion').addEventListener('input', function() {
            if (this.value) currentFilters.descripcion = this.value;
            else delete currentFilters.descripcion;
            currentFilters.page = 1;
            loadBitacora();
            mostrarFiltrosAplicados();
        });
        // Cerrar notificación de filtros
        document.getElementById('cerrarFiltros').addEventListener('click', clearFilters);
    }

    // Inicialización
    function initBitacora() {
        if (!checkAuth()) return;
        setupFilters();
        loadBitacora();
    }

    window.initBitacora = initBitacora;
})(); 