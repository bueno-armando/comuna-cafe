(function() {
    // Configuración de la API
    const API = {
        URL: 'http://localhost:3000/api/gastos',
        getToken: () => localStorage.getItem('token')
    };

    // Variables globales
    let gastos = [];
    let currentFilters = {};
    let paginationInfo = {
        currentPage: 1,
        totalPages: 1,
        totalRegistros: 0,
        limit: 8
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

    // Función para configurar el formato de decimales en inputs
    function setupMontoInputFormat() {
        const montoInputs = ['modalMonto'];
        
        montoInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.step = '1.00';
                input.inputMode = 'text';
                input.pattern = '[0-9]+(\\.[0-9]{1,2})?';
                
                // Solo mantener el evento blur para formateo
                input.addEventListener('blur', function() {
                    if (this.value) {
                        this.value = this.value.replace(',', '.');
                        const numValue = parseFloat(this.value);
                        if (!isNaN(numValue)) {
                            this.value = numValue.toFixed(2);
                        }
                    }
                });
            }
        });
    }

    // Función para configurar botones de incremento/decremento
    function setupIncrementDecrementButtons() {
        // Botones para el modal
        const incrementBtn = document.getElementById('modalIncrementMonto');
        const decrementBtn = document.getElementById('modalDecrementMonto');
        const montoInput = document.getElementById('modalMonto');
        
        if (incrementBtn && decrementBtn && montoInput) {
            incrementBtn.addEventListener('click', function() {
                const currentValue = parseFloat(montoInput.value) || 0;
                const newValue = currentValue + 1;
                montoInput.value = newValue.toFixed(2);
                montoInput.dispatchEvent(new Event('blur'));
            });
            
            decrementBtn.addEventListener('click', function() {
                const currentValue = parseFloat(montoInput.value) || 0;
                const newValue = Math.max(0, currentValue - 1);
                montoInput.value = newValue.toFixed(2);
                montoInput.dispatchEvent(new Event('blur'));
            });
        }
    }

    // Función para configurar filtros rápidos
    function setupQuickFilters() {
        const quickFilterButtons = document.querySelectorAll('[data-period]');
        const datePickerContainer = document.getElementById('datePickerContainer');
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        const aplicarFiltrosContainer = document.getElementById('aplicarFiltrosContainer');
        
        quickFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remover clase activa de todos los botones
                quickFilterButtons.forEach(btn => btn.classList.remove('active'));
                // Agregar clase activa al botón clickeado
                this.classList.add('active');
                
                const period = this.getAttribute('data-period');
                const today = new Date();
                
                // Preservar el filtro de descripción existente
                const descripcionActual = currentFilters.descripcion;
                
                switch(period) {
                    case 'hoy':
                        // Mostrar solo gastos de hoy
                        const todayStr = today.toISOString().split('T')[0];
                        currentFilters = { fechaInicio: todayStr, fechaFin: todayStr };
                        // Restaurar filtro de descripción si existe
                        if (descripcionActual) {
                            currentFilters.descripcion = descripcionActual;
                        }
                        datePickerContainer.style.display = 'none';
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.add('d-none');
                        break;
                        
                    case 'semana':
                        // Mostrar gastos de los últimos 7 días
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        const weekAgoStr = weekAgo.toISOString().split('T')[0];
                        const todayStr2 = today.toISOString().split('T')[0];
                        currentFilters = { fechaInicio: weekAgoStr, fechaFin: todayStr2 };
                        // Restaurar filtro de descripción si existe
                        if (descripcionActual) {
                            currentFilters.descripcion = descripcionActual;
                        }
                        datePickerContainer.style.display = 'none';
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.add('d-none');
                        break;
                        
                    case 'mes':
                        // Mostrar gastos del mes actual
                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
                        const lastDayStr = lastDayOfMonth.toISOString().split('T')[0];
                        currentFilters = { fechaInicio: firstDayStr, fechaFin: lastDayStr };
                        // Restaurar filtro de descripción si existe
                        if (descripcionActual) {
                            currentFilters.descripcion = descripcionActual;
                        }
                        datePickerContainer.style.display = 'none';
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.add('d-none');
                        break;
                        
                    case 'personalizado':
                        // Mostrar campos de fecha personalizada
                        datePickerContainer.style.display = 'block';
                        currentFilters = {};
                        // Restaurar filtro de descripción si existe
                        if (descripcionActual) {
                            currentFilters.descripcion = descripcionActual;
                        }
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.remove('d-none');
                        return; // No aplicar filtro automáticamente para personalizado
                }
                
                // Aplicar filtro automáticamente para filtros rápidos
                loadGastos(1);
                mostrarFiltrosAplicados();
            });
        });
        
        // Configurar campos de fecha personalizada
        if (fechaInicio && fechaFin) {
            fechaInicio.addEventListener('change', function() {
                if (fechaFin.value && this.value > fechaFin.value) {
                    showAlert('La fecha de inicio no puede ser mayor a la fecha de fin', 'warning');
                    this.value = '';
                    return;
                }
            });
            
            fechaFin.addEventListener('change', function() {
                if (fechaInicio.value && this.value < fechaInicio.value) {
                    showAlert('La fecha de fin no puede ser menor a la fecha de inicio', 'warning');
                    this.value = '';
                    return;
                }
            });
        }
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
    async function loadGastos(page = 1) {
        try {
            // Agregar parámetros de paginación
            const filtersWithPagination = {
                ...currentFilters,
                page: page,
                limit: paginationInfo.limit
            };
            
            const queryParams = new URLSearchParams(filtersWithPagination).toString();
            const endpoint = queryParams ? `?${queryParams}` : '';
            const response = await fetchAPI(endpoint);
            
            // Actualizar datos de paginación
            if (response.gastos !== undefined) {
                gastos = response.gastos;
                paginationInfo = {
                    currentPage: response.currentPage,
                    totalPages: response.totalPages,
                    totalRegistros: response.totalRegistros,
                    limit: response.limit
                };
            } else {
                // Fallback para respuesta sin paginación
                gastos = response;
                paginationInfo = {
                    currentPage: 1,
                    totalPages: 1,
                    totalRegistros: gastos.length,
                    limit: paginationInfo.limit
                };
            }
            
            renderTable();
            updateTotal();
            renderPagination();
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

    // Función para renderizar la paginación
    function renderPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;

        if (paginationInfo.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<nav aria-label="Paginación de gastos"><ul class="pagination justify-content-center">';
        
        // Botón "Anterior"
        const prevDisabled = paginationInfo.currentPage === 1 ? 'disabled' : '';
        paginationHTML += `
            <li class="page-item ${prevDisabled}">
                <button class="page-link" onclick="changePage(${paginationInfo.currentPage - 1})" ${prevDisabled}>
                    <i class="bi bi-chevron-left"></i>
                </button>
            </li>
        `;

        // Calcular rango de páginas a mostrar
        const maxVisiblePages = 5;
        let startPage = Math.max(1, paginationInfo.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(paginationInfo.totalPages, startPage + maxVisiblePages - 1);
        
        // Ajustar si no se muestran suficientes páginas
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Páginas numeradas
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === paginationInfo.currentPage ? 'active' : '';
            paginationHTML += `
                <li class="page-item ${activeClass}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                </li>
            `;
        }

        // Botón "Siguiente"
        const nextDisabled = paginationInfo.currentPage === paginationInfo.totalPages ? 'disabled' : '';
        paginationHTML += `
            <li class="page-item ${nextDisabled}">
                <button class="page-link" onclick="changePage(${paginationInfo.currentPage + 1})" ${nextDisabled}>
                    <i class="bi bi-chevron-right"></i>
                </button>
            </li>
        `;

        paginationHTML += '</ul></nav>';

        // Información de paginación
        const startRecord = (paginationInfo.currentPage - 1) * paginationInfo.limit + 1;
        const endRecord = Math.min(paginationInfo.currentPage * paginationInfo.limit, paginationInfo.totalRegistros);
        
        paginationHTML += `
            <div class="text-muted small mt-1">
                Mostrando ${startRecord}-${endRecord} de ${paginationInfo.totalRegistros} gastos
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    // Función para cambiar de página
    window.changePage = function(page) {
        if (page >= 1 && page <= paginationInfo.totalPages) {
            loadGastos(page);
        }
    };

    // Función para mostrar alertas (usando notificationModal)
    function showAlert(message, type = 'info') {
        switch(type) {
            case 'success':
                notificationModal.showSuccess(message);
                break;
            case 'danger':
            case 'error':
                notificationModal.showError(message);
                break;
            case 'warning':
                notificationModal.showWarning(message);
                break;
            default:
                notificationModal.showInfo(message);
        }
    }

    // Variable para controlar si estamos agregando o editando
    let isEditing = false;
    let gastoEditandoId = null;

    // Función para abrir modal de agregar gasto
    function openAddGastoModal() {
        isEditing = false;
        gastoEditandoId = null;
        
        // Limpiar formulario
        document.getElementById('modalDescripcion').value = '';
        document.getElementById('modalMonto').value = '';
        document.getElementById('modalFecha').value = '';
        
        // Configurar fecha por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('modalFecha').value = today;
        
        // Actualizar título del modal
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Agregar Nuevo Gasto';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('gastoModal'));
        modal.show();
    }

    // Función para abrir modal de editar gasto
    window.editGasto = async function(id) {
        try {
            const gasto = await fetchAPI(`/${id}`);
            isEditing = true;
            gastoEditandoId = id;
            
            // Llenar el modal con los datos del gasto
            document.getElementById('modalDescripcion').value = gasto.Descripcion;
            document.getElementById('modalMonto').value = gasto.Monto;
            
            // Asegurar que la fecha se formatee correctamente para el input date
            const fechaGasto = new Date(gasto.Fecha);
            const fechaFormateada = fechaGasto.toISOString().split('T')[0];
            document.getElementById('modalFecha').value = fechaFormateada;
            
            // Actualizar título del modal
            const modalTitle = document.getElementById('modalTitle');
            modalTitle.innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Gasto';
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('gastoModal'));
            modal.show();
        } catch (error) {
            console.error('Error al cargar gasto para editar:', error);
            showAlert('Error al cargar los datos del gasto', 'danger');
        }
    };

    // Función para mostrar indicador de filtros aplicados
    function mostrarFiltrosAplicados() {
        const alertElement = document.getElementById('filtrosAplicados');
        const textoElement = document.getElementById('textoFiltrosAplicados');
        
        // Determinar qué tipo de filtro está activo
        const activeButton = document.querySelector('[data-period].active');
        let filtroTexto = '';
        let filtrosAplicados = [];
        
        // Agregar filtro de descripción si existe
        if (currentFilters.descripcion) {
            filtrosAplicados.push(`Descripción: "${currentFilters.descripcion}"`);
        }
        
        if (activeButton) {
            const period = activeButton.getAttribute('data-period');
            switch(period) {
                case 'hoy':
                    filtroTexto = 'Mostrando gastos de hoy';
                    break;
                case 'semana':
                    filtroTexto = 'Mostrando gastos de los últimos 7 días';
                    break;
                case 'mes':
                    filtroTexto = 'Mostrando gastos del mes actual';
                    break;
                case 'personalizado':
                    if (currentFilters.fechaInicio && currentFilters.fechaFin) {
                        filtroTexto = `Mostrando gastos desde ${formatDate(currentFilters.fechaInicio)} hasta ${formatDate(currentFilters.fechaFin)}`;
                    } else {
                        filtroTexto = 'Rango personalizado seleccionado';
                    }
                    break;
            }
        } else if (currentFilters.fechaInicio || currentFilters.fechaFin) {
            // Filtros manuales (por compatibilidad)
            if (currentFilters.fechaInicio && currentFilters.fechaFin) {
                filtrosAplicados.push(`Desde: ${formatDate(currentFilters.fechaInicio)} hasta: ${formatDate(currentFilters.fechaFin)}`);
            } else if (currentFilters.fechaInicio) {
                filtrosAplicados.push(`Desde: ${formatDate(currentFilters.fechaInicio)}`);
            } else if (currentFilters.fechaFin) {
                filtrosAplicados.push(`Hasta: ${formatDate(currentFilters.fechaFin)}`);
            }
        }
        
        // Combinar filtros de fecha con filtros de descripción
        if (filtroTexto && filtrosAplicados.length > 0) {
            filtroTexto += ` | ${filtrosAplicados.join(', ')}`;
        } else if (filtrosAplicados.length > 0) {
            filtroTexto = `Filtros aplicados: ${filtrosAplicados.join(', ')}`;
        }
        
        if (filtroTexto) {
            textoElement.textContent = filtroTexto;
            alertElement.classList.remove('d-none');
        } else {
            alertElement.classList.add('d-none');
        }
    }

    // Función para aplicar todos los filtros
    async function aplicarFiltros() {
        // Mostrar indicador de búsqueda
        const searchIndicator = document.getElementById('searchIndicator');
        if (searchIndicator) {
            searchIndicator.classList.remove('d-none');
        }
        
        // Obtener filtro de descripción
        const descripcion = document.getElementById('buscarDescripcion').value.trim();
        if (descripcion) {
            currentFilters.descripcion = descripcion;
        } else {
            delete currentFilters.descripcion;
        }

        // Obtener filtros de fecha si están en modo personalizado
        const personalizadoBtn = document.querySelector('[data-period="personalizado"]');
        const isPersonalizado = personalizadoBtn && personalizadoBtn.classList.contains('active');
        
        if (isPersonalizado) {
            const fechaInicio = document.getElementById('fechaInicio').value;
            const fechaFin = document.getElementById('fechaFin').value;

            // Aplicar filtros de fecha según lo que esté completado
            if (fechaInicio && fechaFin) {
                // Ambas fechas completas
                if (fechaInicio > fechaFin) {
                    showAlert('La fecha de inicio no puede ser mayor a la fecha final', 'warning');
                    return;
                }
                currentFilters.fechaInicio = fechaInicio;
                currentFilters.fechaFin = fechaFin;
            } else if (fechaInicio) {
                // Solo fecha inicio: desde X hasta cualquier fecha
                currentFilters.fechaInicio = fechaInicio;
                delete currentFilters.fechaFin;
            } else if (fechaFin) {
                // Solo fecha fin: desde cualquier fecha hasta Y
                currentFilters.fechaFin = fechaFin;
                delete currentFilters.fechaInicio;
            }
            // Si ambas fechas están vacías, no se aplican filtros de fecha
        }

        await loadGastos(1);
        mostrarFiltrosAplicados();
        
        // Ocultar indicador de búsqueda
        if (searchIndicator) {
            searchIndicator.classList.add('d-none');
        }
    }

    // Función para filtrar gastos por fecha (mantenida por compatibilidad)
    async function filterGastos() {
        // Esta función ya no se usa, se reemplazó por aplicarFiltros()
        await aplicarFiltros();
    }

    // Función para guardar gasto (agregar o editar)
    async function guardarGasto() {
        const descripcion = document.getElementById('modalDescripcion').value.trim();
        const monto = parseFloat(document.getElementById('modalMonto').value);
        const fecha = document.getElementById('modalFecha').value;

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
            if (isEditing) {
                // Actualizar gasto existente
                await fetchAPI(`/${gastoEditandoId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        Descripcion: descripcion,
                        Monto: monto,
                        Fecha: fecha
                    })
                });
                showAlert('Gasto actualizado exitosamente', 'success');
            } else {
                // Agregar nuevo gasto
                const userId = localStorage.getItem('userId') || 1;
                await fetchAPI('', {
                    method: 'POST',
                    body: JSON.stringify({
                        Descripcion: descripcion,
                        Monto: monto,
                        Fecha: fecha,
                        ID_Usuario: parseInt(userId)
                    })
                });
                showAlert('Gasto registrado exitosamente', 'success');
            }
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('gastoModal'));
            modal.hide();
            
            // Recargar gastos
            await loadGastos(1);
        } catch (error) {
            console.error('Error al guardar gasto:', error);
            showAlert(`Error al ${isEditing ? 'actualizar' : 'registrar'} el gasto`, 'danger');
        }
    }

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
            await loadGastos(1);
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
        // Limpiar campos de fecha
        document.getElementById('fechaInicio').value = '';
        document.getElementById('fechaFin').value = '';
        
        // Limpiar campo de búsqueda
        document.getElementById('buscarDescripcion').value = '';
        
        // Ocultar indicador de búsqueda
        const searchIndicator = document.getElementById('searchIndicator');
        if (searchIndicator) {
            searchIndicator.classList.add('d-none');
        }
        
        // Ocultar contenedor de fechas personalizadas
        const datePickerContainer = document.getElementById('datePickerContainer');
        if (datePickerContainer) {
            datePickerContainer.style.display = 'none';
        }
        
        // Ocultar botón de aplicar filtros
        const aplicarFiltrosContainer = document.getElementById('aplicarFiltrosContainer');
        if (aplicarFiltrosContainer) {
            aplicarFiltrosContainer.classList.add('d-none');
        }
        
        // Remover clase activa de todos los botones de filtros rápidos
        const quickFilterButtons = document.querySelectorAll('[data-period]');
        quickFilterButtons.forEach(btn => btn.classList.remove('active'));
        
        currentFilters = {};
        
        // Ocultar indicador de filtros
        const alertElement = document.getElementById('filtrosAplicados');
        alertElement.classList.add('d-none');
        
        loadGastos(1);
    }

    // Función para configurar event listeners
    function setupEventListeners() {
        // Botón de agregar gasto
        const agregarGastoBtn = document.getElementById('agregarGastoBtn');
        if (agregarGastoBtn) {
            agregarGastoBtn.addEventListener('click', openAddGastoModal);
        }

        // Botón de aplicar filtros
        const aplicarFiltrosBtn = document.getElementById('aplicarFiltrosBtn');
        if (aplicarFiltrosBtn) {
            aplicarFiltrosBtn.addEventListener('click', aplicarFiltros);
        }

        // Event listener para aplicar filtros con Enter y en tiempo real
        const buscarDescripcionInput = document.getElementById('buscarDescripcion');
        if (buscarDescripcionInput) {
            // Debounce para evitar demasiadas peticiones
            let debounceTimer;
            
            buscarDescripcionInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    aplicarFiltros();
                }, 500); // Esperar 500ms después de que el usuario deje de escribir
            });
            
            // Mantener el evento Enter para compatibilidad
            buscarDescripcionInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    clearTimeout(debounceTimer);
                    aplicarFiltros();
                }
            });
        }

        // Event listener para cerrar filtros desde el indicador
        const cerrarFiltrosBtn = document.getElementById('cerrarFiltros');
        if (cerrarFiltrosBtn) {
            cerrarFiltrosBtn.addEventListener('click', clearFilters);
        }
        
        // Event listener para limpiar solo el filtro de descripción con Escape
        const descripcionInput = document.getElementById('buscarDescripcion');
        if (descripcionInput) {
            descripcionInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    delete currentFilters.descripcion;
                    loadGastos(1);
                    mostrarFiltrosAplicados();
                    
                    // Ocultar indicador de búsqueda
                    const searchIndicator = document.getElementById('searchIndicator');
                    if (searchIndicator) {
                        searchIndicator.classList.add('d-none');
                    }
                }
            });
        }

        // Event listener para guardar gasto
        const guardarGastoBtn = document.getElementById('guardarGasto');
        if (guardarGastoBtn) {
            guardarGastoBtn.addEventListener('click', guardarGasto);
        }

        // Configurar botones de incremento/decremento
        setupMontoInputFormat();
        setupIncrementDecrementButtons();
        setupQuickFilters(); // Llamar a la nueva función de filtros rápidos
    }

    // Función para inicializar el módulo
    function initGastos() {
        console.log('=== Inicializando módulo Gastos ===');
        
        if (!checkAuth()) {
            console.log('No hay sesión activa, redirigiendo al login...');
            return;
        }

        // Ocultar botón de aplicar filtros al inicio
        const aplicarFiltrosContainer = document.getElementById('aplicarFiltrosContainer');
        console.log('aplicarFiltrosContainer encontrado:', aplicarFiltrosContainer);
        if (aplicarFiltrosContainer) {
            aplicarFiltrosContainer.classList.add('d-none');
            console.log('Botón de aplicar filtros oculto');
        } else {
            console.log('ERROR: No se encontró aplicarFiltrosContainer');
        }

        setupEventListeners();
        loadGastos(1);
    }

    // Exportar la función de inicialización
    window.initGastos = initGastos;
    console.log('gastos.js: window.initGastos ASIGNADO.', typeof window.initGastos);

})(); // Fin de la IIFE 