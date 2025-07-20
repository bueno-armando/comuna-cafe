// Módulo de Inventario
(function() {
    const API_URL = '/api/inventario';
    let inventario = [];
    let insumos = [];
    let filteredInventario = [];

    function getToken() {
        return localStorage.getItem('token');
    }

    // Función principal de inicialización
    async function initInventario() {
        console.log('=== Inicializando módulo Inventario ===');
        
        try {
            // Cargar inventario
            await fetchInventario();
            
            // Cargar insumos para el modal
            await fetchInsumos();
            
            // Configurar event listeners
            setupEventListeners();
            
        } catch (error) {
            console.error('Error inicializando inventario:', error);
        }
    }

    // Obtener inventario desde el backend
    async function fetchInventario() {
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener el inventario');
            }
            
            inventario = await response.json();
            filteredInventario = [...inventario];
            renderTable();
            
        } catch (error) {
            console.error('Error en fetchInventario:', error);
            const tableBody = document.getElementById('inventoryTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar el inventario</td></tr>';
            }
        }
    }

    // Obtener insumos para el modal
    async function fetchInsumos() {
        try {
            const response = await fetch(`${API_URL}/insumos`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener insumos');
            }
            
            insumos = await response.json();
            populateInsumosSelect();
            
        } catch (error) {
            console.error('Error en fetchInsumos:', error);
        }
    }

    // Poblar el select de insumos en el modal
    function populateInsumosSelect() {
        const select = document.getElementById('movementInsumo');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccione un insumo</option>';
        insumos.forEach(insumo => {
            const option = document.createElement('option');
            option.value = insumo.ID_Insumo;
            option.textContent = insumo.Nombre;
            option.dataset.unidad = insumo.Unidad;
            select.appendChild(option);
        });
    }

    // Renderizar tabla de inventario
    function renderTable() {
        const tableBody = document.getElementById('inventoryTableBody');
        if (!tableBody) {
            console.warn('Elemento inventoryTableBody no encontrado');
            return;
        }

        tableBody.innerHTML = '';

        if (!filteredInventario || filteredInventario.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos en inventario</td></tr>';
            return;
        }

        filteredInventario.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.ID_Inventario}</td>
                <td>${item.Nombre}</td>
                <td>${item.Unidad}</td>
                <td>${item.Cantidad_Disponible}</td>
                <td>
                    <button class="btn btn-sm btn-info me-2" onclick="viewMovements(${item.ID_Insumo}, '${item.Nombre}')">
                        <i class="bi bi-eye"></i> Ver Movimientos
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Filtrar inventario por búsqueda
    function filterInventario(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            filteredInventario = [...inventario];
        } else {
            const term = searchTerm.toLowerCase().trim();
            filteredInventario = inventario.filter(item => 
                item.Nombre.toLowerCase().includes(term) ||
                (item.Nombre_Proveedor && item.Nombre_Proveedor.toLowerCase().includes(term))
            );
        }
        renderTable();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Búsqueda de inventario
        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterInventario(this.value);
            });
        } else {
            console.warn('Elemento inventorySearch no encontrado');
        }

        // Formulario de registro de movimiento
        const form = document.getElementById('registerMovementForm');
        if (form) {
            form.addEventListener('submit', handleRegisterMovement);
        } else {
            console.warn('Elemento registerMovementForm no encontrado');
        }

        // Select de insumo para actualizar unidad
        const insumoSelect = document.getElementById('movementInsumo');
        if (insumoSelect) {
            insumoSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const unidadInput = document.getElementById('movementUnidad');
                if (unidadInput && selectedOption.dataset.unidad) {
                    unidadInput.value = selectedOption.dataset.unidad;
                }
            });
        }

        // Select de descripción para actualizar tipo automáticamente
        const descripcionSelect = document.getElementById('movementDescripcion');
        if (descripcionSelect) {
            descripcionSelect.addEventListener('change', function() {
                const tipoDiv = document.getElementById('movementTipo');
                if (tipoDiv) {
                    let tipoText = '';
                    let tipoClass = '';
                    
                    switch(this.value) {
                        case 'Compra':
                            tipoText = 'Entrada';
                            tipoClass = 'text-success fw-bold';
                            break;
                        case 'Venta':
                        case 'Merma':
                            tipoText = 'Salida';
                            tipoClass = 'text-danger fw-bold';
                            break;
                        default:
                            tipoText = 'Se seleccionará automáticamente';
                            tipoClass = 'text-muted';
                    }
                    
                    tipoDiv.innerHTML = `<span class="${tipoClass}">${tipoText}</span>`;
                }
            });
        }
    }

    // Manejar registro de movimiento
    async function handleRegisterMovement(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const insumoId = document.getElementById('movementInsumo').value;
        const cantidad = document.getElementById('movementCantidad').value;
        const descripcion = document.getElementById('movementDescripcion').value;
        const tipoDiv = document.getElementById('movementTipo');
        const tipo = tipoDiv ? tipoDiv.textContent.trim() : '';

        if (!insumoId || !cantidad || !descripcion) {
            notificationModal.showWarning('Por favor complete todos los campos requeridos');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/movimientos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    ID_Insumo: parseInt(insumoId),
                    Tipo: tipo,
                    Cantidad: parseFloat(cantidad),
                    Descripcion: descripcion,
                    ID_Usuario: localStorage.getItem('userId') || 1
                })
            });

            const result = await response.json();

            if (response.ok) {
                notificationModal.showSuccess('Movimiento registrado exitosamente');
                
                // Cerrar modal y limpiar formulario
                const modal = bootstrap.Modal.getInstance(document.getElementById('registerMovementModal'));
                if (modal) modal.hide();
                
                event.target.reset();
                document.getElementById('movementUnidad').value = '';
                
                // Resetear el campo de tipo
                const tipoDiv = document.getElementById('movementTipo');
                if (tipoDiv) {
                    tipoDiv.innerHTML = '<span class="text-muted">Se seleccionará automáticamente</span>';
                }
                
                // Recargar inventario
                await fetchInventario();
                
            } else {
                notificationModal.showError('Error: ' + (result.message || 'Error al registrar movimiento'));
            }
            
        } catch (error) {
            console.error('Error en handleRegisterMovement:', error);
            notificationModal.showError('Error al registrar movimiento');
        }
    }

    // Ver movimientos de un insumo (función global)
    window.viewMovements = async function(insumoId, insumoName) {
        try {
            const response = await fetch(`${API_URL}/movimientos/${insumoId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener movimientos');
            }
            
            const movimientos = await response.json();
            renderMovementsModal(movimientos, insumoName);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('movementsModal'));
            modal.show();
            
        } catch (error) {
            console.error('Error en viewMovements:', error);
            notificationModal.showError('Error al cargar movimientos');
        }
    };

    // Renderizar modal de movimientos
    function renderMovementsModal(movimientos, insumoName) {
        const tableBody = document.getElementById('movementsTableBody');
        const insumoNameSpan = document.getElementById('movInsumoName');
        
        if (insumoNameSpan) {
            insumoNameSpan.textContent = insumoName;
        }
        
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (!movimientos || movimientos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay movimientos registrados</td></tr>';
            return;
        }

        movimientos.forEach(movimiento => {
            const row = document.createElement('tr');
            const fecha = new Date(movimiento.Fecha).toLocaleDateString();
            const tipoClass = movimiento.Tipo === 'Entrada' ? 'text-success' : 'text-danger';
            
            row.innerHTML = `
                <td>${fecha}</td>
                <td><span class="${tipoClass} fw-bold">${movimiento.Tipo}</span></td>
                <td>${movimiento.Cantidad}</td>
                <td>${movimiento.Nombre_Usuario} ${movimiento.Apellido_Usuario}</td>
                <td>${movimiento.Descripcion || '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Exportar función de inicialización
    window.initInventario = initInventario;
    console.log('inventario.js: window.initInventario ASIGNADO.', typeof window.initInventario);

})(); // Fin de la IIFE 