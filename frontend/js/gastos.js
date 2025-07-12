(function() {
    // Configuración de la API
    const API = {
        URL: 'http://localhost:3000/api/gastos',
        getToken: () => localStorage.getItem('token')
    };

    // Variables globales
    let gastos = [];
    let currentFilters = {};

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

    // Función para cargar todos los gastos
    async function loadGastos() {
        try {
            const queryParams = new URLSearchParams(currentFilters).toString();
            const endpoint = queryParams ? `?${queryParams}` : '';
            gastos = await fetchAPI(endpoint);
            renderTable();
            updateTotal();
        } catch (error) {
            console.error('Error al cargar gastos:', error);
            showAlert('Error al cargar los gastos', 'danger');
        }
    }

    // Función para renderizar la tabla de gastos
    function renderTable() {
        const tbody = document.getElementById('gastosTable');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (gastos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <i class="bi bi-inbox me-2"></i>No hay gastos registrados
                    </td>
                </tr>
            `;
            return;
        }

        gastos.forEach(gasto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${gasto.Descripcion}</td>
                <td class="text-end">$${parseFloat(gasto.Monto).toFixed(2)}</td>
                <td>${formatDate(gasto.Fecha)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editGasto(${gasto.ID_Gasto})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGasto(${gasto.ID_Gasto})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Función para formatear fecha
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Función para actualizar el total
    function updateTotal() {
        const totalElement = document.getElementById('totalGastos');
        if (!totalElement) return;

        const total = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.Monto), 0);
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Función para mostrar alertas
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.main-container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            
            // Auto-remover después de 5 segundos
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    // Función para registrar un nuevo gasto
    async function registerGasto(event) {
        event.preventDefault();
        
        const descripcion = document.getElementById('descripcion').value.trim();
        const monto = parseFloat(document.getElementById('monto').value);
        const fecha = document.getElementById('fecha').value;

        // Validaciones
        if (!descripcion) {
            showAlert('La descripción es requerida', 'warning');
            return;
        }

        if (!monto || monto <= 0) {
            showAlert('El monto debe ser mayor a 0', 'warning');
            return;
        }

        if (!fecha) {
            showAlert('La fecha es requerida', 'warning');
            return;
        }

        // Validar fecha futura
        const fechaGasto = new Date(fecha);
        const fechaActual = new Date();
        if (fechaGasto > fechaActual) {
            showAlert('No se pueden registrar gastos con fecha futura', 'warning');
            return;
        }

        try {
            const userId = localStorage.getItem('userId') || 1;
            const gastoData = {
                Descripcion: descripcion,
                Monto: monto,
                Fecha: fecha,
                ID_Usuario: parseInt(userId)
            };

            await fetchAPI('', {
                method: 'POST',
                body: JSON.stringify(gastoData)
            });

            showAlert('Gasto registrado exitosamente', 'success');
            
            // Limpiar formulario
            document.getElementById('descripcion').value = '';
            document.getElementById('monto').value = '';
            document.getElementById('fecha').value = '';
            
            // Recargar gastos
            await loadGastos();
        } catch (error) {
            console.error('Error al registrar gasto:', error);
            showAlert('Error al registrar el gasto', 'danger');
        }
    }

    // Función para filtrar gastos por fecha
    async function filterGastos() {
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;

        if (!fechaInicio || !fechaFin) {
            showAlert('Por favor seleccione ambas fechas', 'warning');
            return;
        }

        if (fechaInicio > fechaFin) {
            showAlert('La fecha de inicio no puede ser mayor a la fecha final', 'warning');
            return;
        }

        currentFilters = {
            fechaInicio,
            fechaFin
        };

        await loadGastos();
        showAlert(`Filtrado gastos del ${formatDate(fechaInicio)} al ${formatDate(fechaFin)}`, 'info');
    }

    // Función para editar gasto
    window.editGasto = async function(id) {
        try {
            const gasto = await fetchAPI(`/${id}`);
            
            // Llenar modal de edición (si existe) o usar alert para datos
            const nuevaDescripcion = prompt('Nueva descripción:', gasto.Descripcion);
            if (nuevaDescripcion === null) return;
            
            const nuevoMonto = prompt('Nuevo monto:', gasto.Monto);
            if (nuevoMonto === null) return;
            
            const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):', gasto.Fecha);
            if (nuevaFecha === null) return;

            // Validaciones
            if (!nuevaDescripcion.trim()) {
                showAlert('La descripción es requerida', 'warning');
                return;
            }

            const monto = parseFloat(nuevoMonto);
            if (!monto || monto <= 0) {
                showAlert('El monto debe ser mayor a 0', 'warning');
                return;
            }

            // Validar fecha futura
            const fechaGasto = new Date(nuevaFecha);
            const fechaActual = new Date();
            if (fechaGasto > fechaActual) {
                showAlert('No se pueden registrar gastos con fecha futura', 'warning');
                return;
            }

            await fetchAPI(`/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    Descripcion: nuevaDescripcion,
                    Monto: monto,
                    Fecha: nuevaFecha
                })
            });

            showAlert('Gasto actualizado exitosamente', 'success');
            await loadGastos();
        } catch (error) {
            console.error('Error al editar gasto:', error);
            showAlert('Error al actualizar el gasto', 'danger');
        }
    };

    // Función para eliminar gasto
    window.deleteGasto = async function(id) {
        if (!confirm('¿Está seguro que desea eliminar este gasto?')) {
            return;
        }

        try {
            await fetchAPI(`/${id}`, {
                method: 'DELETE'
            });

            showAlert('Gasto eliminado exitosamente', 'success');
            await loadGastos();
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            if (error.message.includes('30 días')) {
                showAlert('No se puede eliminar gastos con más de 30 días de antigüedad', 'warning');
            } else {
                showAlert('Error al eliminar el gasto', 'danger');
            }
        }
    };

    // Función para limpiar filtros
    function clearFilters() {
        document.getElementById('fechaInicio').value = '';
        document.getElementById('fechaFin').value = '';
        currentFilters = {};
        loadGastos();
        showAlert('Filtros limpiados', 'info');
    }

    // Función para configurar event listeners
    function setupEventListeners() {
        // Botón de registrar gasto
        const registrarBtn = document.getElementById('registrarBtn');
        if (registrarBtn) {
            registrarBtn.addEventListener('click', registerGasto);
        }

        // Botón de filtrar
        const filtrarBtn = document.getElementById('filtrarBtn');
        if (filtrarBtn) {
            filtrarBtn.addEventListener('click', filterGastos);
        }

        // Botón de limpiar filtros (agregar si no existe)
        const clearFiltersBtn = document.createElement('button');
        clearFiltersBtn.className = 'btn btn-outline-secondary ms-2';
        clearFiltersBtn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Limpiar';
        clearFiltersBtn.addEventListener('click', clearFilters);
        
        const filterContainer = document.querySelector('.row.g-3.mb-4:last-child .col-md-4:last-child');
        if (filterContainer) {
            filterContainer.appendChild(clearFiltersBtn);
        }

        // Configurar fecha por defecto
        const fechaInput = document.getElementById('fecha');
        if (fechaInput && !fechaInput.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaInput.value = today;
        }

        // Configurar formato de monto
        const montoInput = document.getElementById('monto');
        if (montoInput) {
            montoInput.addEventListener('blur', function() {
                if (this.value) {
                    this.value = parseFloat(this.value).toFixed(2);
                }
            });
        }
    }

    // Función para inicializar el módulo
    function initGastos() {
        console.log('=== Inicializando módulo Gastos ===');
        
        if (!checkAuth()) {
            console.log('No hay sesión activa, redirigiendo al login...');
            return;
        }

        setupEventListeners();
        loadGastos();
    }

    // Exportar la función de inicialización
    window.initGastos = initGastos;
    console.log('gastos.js: window.initGastos ASIGNADO.', typeof window.initGastos);

})(); // Fin de la IIFE 