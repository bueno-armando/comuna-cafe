(function() {
    const API_URL_VENTAS = '/api/ventas'; 
    let ventas = [];
    let currentFiltersVentas = { 
        fechaInicio: '', 
        fechaFin: '', 
        usuario: '', 
        metodoPago: '' 
    };
    let currentPageVentas = 1; // Renombrar
    const rowsPerPageVentas = 9; // Renombrar

    function getToken() {
        return localStorage.getItem('token');
    }

    async function fetchAPI(url, options = {}) {
        const headers = {
                'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            ...options.headers,
        };
        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Fetch API Error en Ventas:', error.message, 'URL:', url, 'Options:', options);
            throw error;
        }
    }

    async function fetchVentas(filters = {}, page = 1, limit = 9) {
        try {
            const params = new URLSearchParams();
            if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
            if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
            if (filters.usuario) params.append('usuario', filters.usuario);
            if (filters.metodoPago) params.append('metodoPago', filters.metodoPago);
            params.append('page', page);
            params.append('limit', limit);

            const data = await fetchAPI(`${API_URL_VENTAS}?${params.toString()}`);
            
            // Manejar respuesta paginada
            if (data.ventas) {
                ventas = data.ventas;
                renderTableVentas(ventas);
                
                // Renderizar paginación si hay múltiples páginas
                if (data.totalPages > 1) {
                    renderPaginationVentas(data.totalPages, data.currentPage);
                } else {
                    // Ocultar paginación si solo hay una página
                    const paginationContainer = document.getElementById('paginationVentas');
                    if (paginationContainer) {
                        paginationContainer.innerHTML = '';
                    }
                }
            } else {
                // Fallback para respuesta sin paginación
                ventas = data;
                renderTableVentas(ventas);
                const paginationContainer = document.getElementById('paginationVentas');
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                }
            }
        } catch (error) {
            notificationModal.showError('No se pudieron cargar las ventas: ' + error.message);
        }
    }

    function renderTableVentas(ventasToRender) {
        const tableBody = document.getElementById('salesTableBody');
        if (!tableBody) return console.warn('Ventas: salesTableBody no encontrado.');
        tableBody.innerHTML = '';
        
        if (!ventasToRender || ventasToRender.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-inbox me-2"></i>No hay ventas registradas
                    </td>
                </tr>
            `;
            return;
        }
        
        ventasToRender.forEach(venta => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                    <td>${venta.ID_Venta}</td>
                <td>${formatDate(venta.Fecha)}</td>
                <td>$${parseFloat(venta.Total).toFixed(2)}</td>
                <td>${venta.Metodo_Pago}</td>
                <td>${venta.Nombre_Usuario || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-info ver-detalle-btn" data-venta-id="${venta.ID_Venta}">
                        <i class="bi bi-eye me-1"></i>Ver Detalles
                    </button>
                    </td>
                `;
        });
    }

    // Función para formatear fechas en formato DD/MM/YY
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    }

    function renderPaginationVentas(totalPages, currentPage) {
        const paginationContainer = document.getElementById('paginationVentas');
        if (!paginationContainer) return console.warn('Ventas: paginationVentas no encontrado.');
        
        paginationContainer.innerHTML = '';
        
        // Botón "Anterior"
        if (currentPage > 1) {
            const prevLi = document.createElement('li');
            prevLi.className = 'page-item';
            const prevA = document.createElement('a');
            prevA.className = 'page-link';
            prevA.href = '#';
            prevA.innerHTML = '&laquo; Anterior';
            prevA.addEventListener('click', (e) => {
                e.preventDefault();
                currentPageVentas = currentPage - 1;
                fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);
            });
            prevLi.appendChild(prevA);
            paginationContainer.appendChild(prevLi);
        }
        
        // Calcular rango de páginas a mostrar
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Ajustar si estamos cerca del final
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Páginas numeradas
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === parseInt(currentPage) ? 'active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = i;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentPageVentas = i;
                fetchVentas(currentFiltersVentas, i, rowsPerPageVentas);
            });
            li.appendChild(a);
            paginationContainer.appendChild(li);
        }
        
        // Botón "Siguiente"
        if (currentPage < totalPages) {
            const nextLi = document.createElement('li');
            nextLi.className = 'page-item';
            const nextA = document.createElement('a');
            nextA.className = 'page-link';
            nextA.href = '#';
            nextA.innerHTML = 'Siguiente &raquo;';
            nextA.addEventListener('click', (e) => {
                e.preventDefault();
                currentPageVentas = currentPage + 1;
                fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);
            });
            nextLi.appendChild(nextA);
            paginationContainer.appendChild(nextLi);
        }
    }

    async function viewSaleDetails(ventaId) {
        try {
            const res = await fetchAPI(`${API_URL_VENTAS}/${ventaId}`);
            if (!res || !res.venta) {
                notificationModal.showWarning('No se encontraron detalles para esta venta.');
                return;
            }
            // Llenar campos del modal
            document.getElementById('saleDetailId').value = res.venta.ID_Venta;
            document.getElementById('saleDetailUser').value = res.venta.Nombre_Usuario;
            document.getElementById('saleDetailDate').value = formatDate(res.venta.Fecha);
            document.getElementById('saleDetailMethod').value = res.venta.Metodo_Pago;
            document.getElementById('saleDetailTotal').value = `$${parseFloat(res.venta.Total).toFixed(2)}`;
            // Llenar tabla de productos vendidos
            const tbody = document.getElementById('saleDetailProducts');
            tbody.innerHTML = '';
            if (res.detalles && res.detalles.length > 0) {
                res.detalles.forEach(det => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${det.Producto}</td>
                        <td>${det.Cantidad}</td>
                        <td>$${parseFloat(det.Precio_Unitario).toFixed(2)}</td>
                        <td>$${parseFloat(det.Subtotal).toFixed(2)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay productos registrados en esta venta.</td></tr>';
            }
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('detalleVentaModal'));
            modal.show();
        } catch (error) {
            notificationModal.showError('Error al cargar los detalles de la venta: ' + error.message);
        }
    }

    // Función para mostrar indicador de filtros aplicados
    function mostrarFiltrosAplicados() {
        const filtrosAplicados = [];
        if (currentFiltersVentas.fechaInicio) filtrosAplicados.push(`Desde: ${formatDate(currentFiltersVentas.fechaInicio)}`);
        if (currentFiltersVentas.fechaFin) filtrosAplicados.push(`Hasta: ${formatDate(currentFiltersVentas.fechaFin)}`);
        if (currentFiltersVentas.usuario) filtrosAplicados.push(`Usuario: ${currentFiltersVentas.usuario}`);
        if (currentFiltersVentas.metodoPago) filtrosAplicados.push(`Método: ${currentFiltersVentas.metodoPago}`);

        const alertElement = document.getElementById('filtrosAplicados');
        const textoElement = document.getElementById('textoFiltrosAplicados');
        
        if (filtrosAplicados.length > 0) {
            textoElement.textContent = `Filtros aplicados: ${filtrosAplicados.join(', ')}`;
            alertElement.classList.remove('d-none');
        } else {
            alertElement.classList.add('d-none');
        }
    }

    // Función para limpiar filtros
    function limpiarFiltros() {
        currentFiltersVentas = { fechaInicio: '', fechaFin: '', usuario: '', metodoPago: '' };
        
        // Limpiar campos del formulario
        const fechaInicioInput = document.getElementById('filtroFechaInicio');
        const fechaFinInput = document.getElementById('filtroFechaFin');
        const usuarioInput = document.getElementById('filtroUsuario');
        const metodoPagoInput = document.getElementById('filtroMetodoPago');
        
        if (fechaInicioInput) fechaInicioInput.value = '';
        if (fechaFinInput) fechaFinInput.value = '';
        if (usuarioInput) usuarioInput.value = '';
        if (metodoPagoInput) metodoPagoInput.value = '';
        
        // Ocultar indicador de filtros
        const alertElement = document.getElementById('filtrosAplicados');
        alertElement.classList.add('d-none');
        
        // Recargar ventas sin filtros
        currentPageVentas = 1;
        fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);
    }

    function initVentas() {
        console.log('=== Inicializando módulo Ventas ===');
        fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);

        // Event listeners para filtros
        const fechaInicioInput = document.getElementById('filtroFechaInicio');
        const fechaFinInput = document.getElementById('filtroFechaFin');
        const usuarioInput = document.getElementById('filtroUsuario');
        const metodoPagoInput = document.getElementById('filtroMetodoPago');
        const aplicarFiltrosBtn = document.getElementById('aplicarFiltrosVentas');
        const cerrarFiltrosBtn = document.getElementById('cerrarFiltros');

        if (aplicarFiltrosBtn) {
            aplicarFiltrosBtn.addEventListener('click', () => {
                currentFiltersVentas.fechaInicio = fechaInicioInput ? fechaInicioInput.value : '';
                currentFiltersVentas.fechaFin = fechaFinInput ? fechaFinInput.value : '';
                currentFiltersVentas.usuario = usuarioInput ? usuarioInput.value.trim() : '';
                currentFiltersVentas.metodoPago = metodoPagoInput ? metodoPagoInput.value : '';
                
                currentPageVentas = 1;
                fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);
                mostrarFiltrosAplicados();
            });
        } else console.warn('Ventas: aplicarFiltrosVentas no encontrado.');



        if (cerrarFiltrosBtn) {
            cerrarFiltrosBtn.addEventListener('click', limpiarFiltros);
        }

        // Búsqueda en tiempo real para usuario
        if (usuarioInput) {
            usuarioInput.addEventListener('input', debounce(() => {
                currentFiltersVentas.usuario = usuarioInput.value.trim();
                currentPageVentas = 1;
                fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);
                mostrarFiltrosAplicados();
            }, 500));
        }

        // Filtro automático para método de pago
        if (metodoPagoInput) {
            metodoPagoInput.addEventListener('change', () => {
                currentFiltersVentas.metodoPago = metodoPagoInput.value;
                currentPageVentas = 1;
                fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);
                mostrarFiltrosAplicados();
            });
        }

        // Delegación de eventos para botones "Ver Detalles"
        const tableBody = document.getElementById('salesTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', function(e) {
                const detailsBtn = e.target.closest('button');
                if (detailsBtn && detailsBtn.classList.contains('ver-detalle-btn')) {
                    const ventaId = detailsBtn.getAttribute('data-venta-id');
                    viewSaleDetails(ventaId);
                }
            });
        } else console.warn('Ventas: salesTableBody no encontrado para delegación.');
    }

    // Función debounce para búsqueda en tiempo real
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    window.initVentas = initVentas;
    console.log('ventas.js: window.initVentas ASIGNADO.', typeof window.initVentas);

})(); // Fin de la IIFE 