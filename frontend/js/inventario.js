// Módulo de Inventario
(function() {
    const API_URL = '/api/inventario';
    let inventario = [];
    let insumos = [];
    let filteredInventario = [];

    function getToken() {
        return localStorage.getItem('token');
    }

    // === INICIO: Helper de conversión de unidades (copiado de recetas.js) ===
    const CONVERSION_FACTORS = {
        // Peso
        'kg_to_g': 1000,
        'g_to_kg': 0.001,
        'oz_to_g': 28.3495,
        'g_to_oz': 0.03527396,
        'kg_to_oz': 35.27396,
        'oz_to_kg': 0.0283495,
        // Volumen
        'L_to_ml': 1000,
        'ml_to_L': 0.001,
        'L_to_oz': 33.814,
        'oz_to_L': 0.0295735,
        'L_to_tsp': 202.884,
        'tsp_to_L': 0.00492892,
        'L_to_tbsp': 67.628,
        'tbsp_to_L': 0.0147868,
        'L_to_cc': 1000,
        'cc_to_L': 0.001,
        'ml_to_oz': 0.033814,
        'oz_to_ml': 29.5735,
        'ml_to_tsp': 0.202884,
        'tsp_to_ml': 4.92892,
        'ml_to_tbsp': 0.067628,
        'tbsp_to_ml': 14.7868,
        'ml_to_cc': 1,
        'cc_to_ml': 1,
        'oz_to_tsp': 6,
        'tsp_to_oz': 0.166667,
        'oz_to_tbsp': 2,
        'tbsp_to_oz': 0.5,
        'tbsp_to_tsp': 3,
        'tsp_to_tbsp': 0.333333,
        'cc_to_tsp': 0.202884,
        'tsp_to_cc': 4.92892,
        'cc_to_tbsp': 0.067628,
        'tbsp_to_cc': 14.7868,
        // Volumen a Peso (aproximaciones para agua/leche)
        'ml_to_g_water': 1,
        'g_to_ml_water': 1,
        'L_to_kg_water': 1,
        'kg_to_L_water': 1
    };
    function convertirUnidad(cantidad, unidadOrigen, unidadDestino) {
        if (unidadOrigen === unidadDestino) return cantidad;
        const conversionKey = `${unidadOrigen}_to_${unidadDestino}`;
        const factor = CONVERSION_FACTORS[conversionKey];
        if (factor) return cantidad * factor;
        const reverseKey = `${unidadDestino}_to_${unidadOrigen}`;
        const reverseFactor = CONVERSION_FACTORS[reverseKey];
        if (reverseFactor) return cantidad / reverseFactor;
        console.warn(`No se encontró conversión de ${unidadOrigen} a ${unidadDestino}`);
        return cantidad;
    }
    // === FIN: Helper de conversión de unidades ===

    // === INICIO: Lógica de unidades compatibles y UI en modal de movimiento ===
    async function updateCompatibleUnitsForMovement(insumoId) {
        const unitElement = document.getElementById('movementUnidad');
        if (!insumoId || !unitElement) return;
        try {
            const response = await fetch(`/api/recetas/unidades-compatibles/${insumoId}`, {
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            if (!response.ok) throw new Error('Error al obtener unidades compatibles');
            const data = await response.json();
            unitElement.innerHTML = '';
            const optionInsumo = document.createElement('option');
            optionInsumo.value = data.unidadInsumo;
            optionInsumo.textContent = data.unidadInsumo;
            optionInsumo.selected = true;
            unitElement.appendChild(optionInsumo);
            if (data.unidadesCompatibles && data.unidadesCompatibles.length > 0) {
                data.unidadesCompatibles.forEach(unidad => {
                    const option = document.createElement('option');
                    option.value = unidad;
                    option.textContent = unidad;
                    unitElement.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar unidades compatibles:', error);
            unitElement.innerHTML = '<option value="" selected>Error</option>';
        }
    }

    // === INICIO: Botones incremento/decremento y formateo para cantidad ===
    function setupCantidadInputFormat() {
        const input = document.getElementById('movementCantidad');
        if (!input) return;
        input.inputMode = 'text';
        input.pattern = '[0-9]+(\\.[0-9]{1,3})?';
        input.addEventListener('blur', function() {
            if (this.value) {
                this.value = this.value.replace(',', '.');
                const numValue = parseFloat(this.value);
                if (!isNaN(numValue)) {
                    this.value = numValue.toFixed(3).replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
                }
            }
        });
    }
    function setupIncrementDecrementButtons() {
        const incrementBtn = document.getElementById('incrementCantidadBtn');
        const decrementBtn = document.getElementById('decrementCantidadBtn');
        const input = document.getElementById('movementCantidad');
        if (!incrementBtn || !decrementBtn || !input) return;
        incrementBtn.addEventListener('click', function() {
            const currentValue = parseFloat(input.value) || 0;
            const newValue = currentValue + 1;
            input.value = newValue.toFixed(3).replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
            input.dispatchEvent(new Event('blur'));
        });
        decrementBtn.addEventListener('click', function() {
            const currentValue = parseFloat(input.value) || 0;
            const newValue = Math.max(0, currentValue - 1);
            input.value = newValue.toFixed(3).replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
            input.dispatchEvent(new Event('blur'));
        });
    }
    // === FIN: Botones incremento/decremento ===

    // === INICIO: Hook para actualizar unidades y formato al abrir el modal ===
    function setupMovementModalUX() {
        const insumoSelect = document.getElementById('movementInsumo');
        if (insumoSelect) {
            insumoSelect.addEventListener('change', function() {
                updateCompatibleUnitsForMovement(this.value);
            });
        }
        setupCantidadInputFormat();
        setupIncrementDecrementButtons();
        // --- Conversión visual al cambiar unidad ---
        const unidadSelect = document.getElementById('movementUnidad');
        const cantidadInput = document.getElementById('movementCantidad');
        if (unidadSelect && cantidadInput) {
            unidadSelect.addEventListener('change', function() {
                // Obtener la unidad base del insumo seleccionado
                const insumoId = insumoSelect ? insumoSelect.value : null;
                const insumo = insumos.find(i => i.ID_Insumo == insumoId);
                if (!insumo) return;
                const unidadBase = insumo.Unidad;
                const cantidadActual = parseFloat(cantidadInput.value);
                if (isNaN(cantidadActual)) return;
                // Convertir la cantidad actual desde la unidad anterior a la nueva unidad seleccionada
                // Detectar la unidad anterior (antes del cambio)
                // Guardar la unidad anterior en un atributo temporal
                const prevUnidad = unidadSelect.getAttribute('data-prev-unidad') || unidadBase;
                const nuevaUnidad = this.value;
                let cantidadConvertida = cantidadActual;
                if (prevUnidad !== nuevaUnidad) {
                    cantidadConvertida = convertirUnidad(cantidadActual, prevUnidad, nuevaUnidad);
                }
                cantidadInput.value = cantidadConvertida.toFixed(3).replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
                // Actualizar el atributo para la próxima conversión
                unidadSelect.setAttribute('data-prev-unidad', nuevaUnidad);
            });
            // Inicializar el atributo de unidad previa
            unidadSelect.setAttribute('data-prev-unidad', unidadSelect.value);
        }
    }
    // === FIN: Hook ===

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
                    <div class="acciones-fila d-flex gap-2">
                        <button class="btn btn-success btn-sm p-1 accion-fila-btn" onclick="openRegisterMovementModalWithInsumo(${item.ID_Insumo})" title="Registrar movimiento">
                            <i class="bi bi-lightning-charge"></i>
                        </button>
                        <button class="btn btn-info btn-sm p-1 accion-fila-btn" onclick="viewMovements(${item.ID_Insumo}, '${item.Nombre}')" title="Ver movimientos">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
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

        // Al abrir el modal universal, habilitar el select de insumos
        const registerMovementModal = document.getElementById('registerMovementModal');
        if (registerMovementModal) {
            registerMovementModal.addEventListener('show.bs.modal', function() {
                setupMovementModalUX();
                // Limpiar cantidad
                const cantidadInput = document.getElementById('movementCantidad');
                if (cantidadInput) cantidadInput.value = '';
                // Llenar combo de unidad según insumo seleccionado (si hay alguno)
                const insumoSelect = document.getElementById('movementInsumo');
                if (insumoSelect && insumoSelect.value) {
                    updateCompatibleUnitsForMovement(insumoSelect.value);
                } else {
                    const unidadSelect = document.getElementById('movementUnidad');
                    if (unidadSelect) unidadSelect.innerHTML = '';
                }
                // Habilitar el select de insumos (solo en modo universal)
                if (insumoSelect) insumoSelect.disabled = false;
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
        const cantidadInput = document.getElementById('movementCantidad').value;
        const unidadSeleccionada = document.getElementById('movementUnidad').value;
        let unidadBase = '';
        // Obtener la unidad base del insumo seleccionado
        const insumo = insumos.find(i => i.ID_Insumo == insumoId);
        if (insumo) unidadBase = insumo.Unidad;
        let cantidadNormalizada = parseFloat(cantidadInput);
        if (unidadSeleccionada && unidadBase && unidadSeleccionada !== unidadBase) {
            cantidadNormalizada = convertirUnidad(parseFloat(cantidadInput), unidadSeleccionada, unidadBase);
        }
        const descripcion = document.getElementById('movementDescripcion').value;
        const tipoDiv = document.getElementById('movementTipo');
        const tipo = tipoDiv ? tipoDiv.textContent.trim() : '';
        if (!insumoId || !cantidadInput || !descripcion) {
            notificationModal.showWarning('Por favor complete todos los campos requeridos');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/movimientos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getToken()
                },
                body: JSON.stringify({
                    ID_Insumo: parseInt(insumoId),
                    Tipo: tipo,
                    Cantidad: cantidadNormalizada,
                    Descripcion: descripcion,
                    ID_Usuario: localStorage.getItem('userId') || 1
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Error al registrar movimiento');
            fetchInventario();
            notificationModal.showSuccess('Movimiento registrado exitosamente');
            event.target.reset();
        } catch (error) {
            console.error('Error en handleRegisterMovement:', error);
            notificationModal.showError('No se pudo registrar el movimiento.');
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

    // Permite abrir el modal con insumo preseleccionado y bloqueado
    window.openRegisterMovementModalWithInsumo = function(insumoId) {
        // Abre el modal
        const modal = new bootstrap.Modal(document.getElementById('registerMovementModal'));
        modal.show();
        // Llenar el select de insumos con el insumo preseleccionado y bloqueado
        populateInsumosSelect(insumoId);
        // Llenar el combo de unidad
        updateCompatibleUnitsForMovement(insumoId);
        // Bloquear el select de insumos
        const insumoSelect = document.getElementById('movementInsumo');
        if (insumoSelect) {
            insumoSelect.value = insumoId;
            insumoSelect.disabled = true;
        }
    };
    // Modifica populateInsumosSelect para soportar insumo preseleccionado/bloqueado
    function populateInsumosSelect(preselectedId) {
        const select = document.getElementById('movementInsumo');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccione un insumo</option>';
        insumos.forEach(insumo => {
            const option = document.createElement('option');
            option.value = insumo.ID_Insumo;
            option.textContent = insumo.Nombre;
            option.dataset.unidad = insumo.Unidad;
            if (preselectedId && insumo.ID_Insumo == preselectedId) option.selected = true;
            select.appendChild(option);
        });
        // Si no hay preselección, habilitar el select
        if (!preselectedId) select.disabled = false;
    }

    // Exportar función de inicialización
    window.initInventario = initInventario;
    console.log('inventario.js: window.initInventario ASIGNADO.', typeof window.initInventario);

})(); // Fin de la IIFE 