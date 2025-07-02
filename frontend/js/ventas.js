(function() {
    const API_URL_VENTAS = '/api/ventas'; 
    let ventas = [];
    let currentFiltersVentas = { fechaInicio: '', fechaFin: '', usuario: '' }; // Renombrar
    let currentPageVentas = 1; // Renombrar
    const rowsPerPageVentas = 10; // Renombrar

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

    async function fetchVentas(filters = {}, page = 1, limit = 10) {
        try {
            const params = new URLSearchParams();
            if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
            if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
            if (filters.usuario) params.append('usuario', filters.usuario); // Asumiendo que el backend puede filtrar por nombre de usuario o ID
            params.append('page', page);
            params.append('limit', limit);

            const data = await fetchAPI(`${API_URL_VENTAS}?${params.toString()}`);
            ventas = data.ventas || data; 
            renderTableVentas(ventas);
            if (data.totalPages) {
                renderPaginationVentas(data.totalPages, page);
            }
        } catch (error) {
            alert('No se pudieron cargar las ventas: ' + error.message);
        }
    }

    function renderTableVentas(ventasToRender) {
        const tableBody = document.getElementById('salesTableBody'); // ID de la tabla en Ventas.html
        if (!tableBody) return console.warn('Ventas: salesTableBody no encontrado.');
        tableBody.innerHTML = '';
        (ventasToRender || []).forEach(venta => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                    <td>${venta.ID_Venta}</td>
                <td>${new Date(venta.Fecha).toLocaleDateString('es-MX')} ${new Date(venta.Fecha).toLocaleTimeString('es-MX')}</td>
                <td>${venta.NombreUsuario || 'N/A'}</td> <!-- Asumiendo que el backend envía NombreUsuario -->
                    <td>$${parseFloat(venta.Total).toFixed(2)}</td>
                    <td>${venta.Metodo_Pago}</td>
                <td>
                    <button class="btn btn-sm btn-info view-details-btn" data-id="${venta.ID_Venta}">Ver Detalles</button>
                    </td>
                `;
        });
    }

    function renderPaginationVentas(totalPages, currentPage) {
        const paginationContainer = document.getElementById('paginationVentas'); // ID del paginador en Ventas.html
        if (!paginationContainer) return console.warn('Ventas: paginationVentas no encontrado.');
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
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
    }

    async function viewSaleDetails(ventaId) {
        try {
            const detalles = await fetchAPI(`${API_URL_VENTAS}/${ventaId}/detalles`);
            const modalBody = document.getElementById('saleDetailsModalBody'); // ID del cuerpo del modal de detalles
            const modalTitle = document.getElementById('saleDetailsModalTitle');
            if (!modalBody || !modalTitle) return console.warn('Ventas: Elementos del modal de detalles no encontrados.');
            
            modalTitle.textContent = `Detalles de Venta #${ventaId}`;
            modalBody.innerHTML = ''; // Limpiar detalles anteriores

            if (!detalles || detalles.length === 0) {
                modalBody.innerHTML = '<p>No hay detalles para esta venta.</p>';
            } else {
                const list = document.createElement('ul');
                list.className = 'list-group';
                detalles.forEach(detalle => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                    listItem.innerHTML = `
                        ${detalle.NombreProducto} (x${detalle.Cantidad})
                        <span>$${parseFloat(detalle.Subtotal).toFixed(2)}</span>
                    `;
                    list.appendChild(listItem);
                });
                modalBody.appendChild(list);
            }
            const modal = new bootstrap.Modal(document.getElementById('saleDetailsModal')); // ID del modal
            if (modal) modal.show();
        } catch (error) {
            alert('Error al cargar los detalles de la venta: ' + error.message);
        }
    }

    function initVentas() {
        console.log('=== Inicializando módulo Ventas ===');
        fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);

        // Event listeners para filtros
        const fechaInicioInput = document.getElementById('filtroFechaInicio');
        const fechaFinInput = document.getElementById('filtroFechaFin');
        const usuarioInput = document.getElementById('filtroUsuario');
        const aplicarFiltrosBtn = document.getElementById('aplicarFiltrosVentas');

        if (aplicarFiltrosBtn) {
            aplicarFiltrosBtn.addEventListener('click', () => {
                if (fechaInicioInput) currentFiltersVentas.fechaInicio = fechaInicioInput.value;
                if (fechaFinInput) currentFiltersVentas.fechaFin = fechaFinInput.value;
                if (usuarioInput) currentFiltersVentas.usuario = usuarioInput.value;
                currentPageVentas = 1;
                fetchVentas(currentFiltersVentas, currentPageVentas, rowsPerPageVentas);
            });
        } else console.warn('Ventas: aplicarFiltrosVentas no encontrado.');

        // Delegación de eventos para botones "Ver Detalles"
        const tableBody = document.getElementById('salesTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', function(e) {
                const detailsBtn = e.target.closest('.view-details-btn');
                if (detailsBtn && detailsBtn.dataset.id) {
                    viewSaleDetails(detailsBtn.dataset.id);
                }
            });
        } else console.warn('Ventas: salesTableBody no encontrado para delegación.');
    }

    window.initVentas = initVentas;
    console.log('ventas.js: window.initVentas ASIGNADO.', typeof window.initVentas);

})(); // Fin de la IIFE 