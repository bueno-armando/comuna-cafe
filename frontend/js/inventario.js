// Módulo de Inventario
const InventarioModule = {
    init: function() {
        console.log('=== Inicializando módulo de Inventario ===');
        console.log('Verificando elementos del DOM...');
        console.log('inventoryTableBody:', document.getElementById('inventoryTableBody') ? 'Encontrado' : 'No encontrado');
        console.log('registerMovementForm:', document.getElementById('registerMovementForm') ? 'Encontrado' : 'No encontrado');
        console.log('movementsModal:', document.getElementById('movementsModal') ? 'Encontrado' : 'No encontrado');
        console.log('movementInsumo:', document.getElementById('movementInsumo') ? 'Encontrado' : 'No encontrado');
        console.log('inventorySearch:', document.getElementById('inventorySearch') ? 'Encontrado' : 'No encontrado');
        
        this.apiUrl = '/api/inventario';
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
        console.log('Token:', this.token ? 'Presente' : 'Ausente');
        console.log('User ID:', this.userId ? 'Presente' : 'Ausente');
        console.log('API URL:', this.apiUrl);
        
        this.initializeEventListeners();
        this.cargarInventario();
        this.cargarInsumos();
    },

    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        console.log(`=== Petición API a ${url} ===`);
        console.log('Opciones:', options);
        console.log('Headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            ...options.headers
        });

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    ...options.headers
                }
            });

            console.log('=== Respuesta recibida ===');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log('Headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const error = await response.json();
                console.error('Error en la respuesta:', error);
                throw new Error(error.message || 'Error en la petición');
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);
            return data;
        } catch (error) {
            console.error('=== Error en la petición ===');
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            throw error;
        }
    },

    initializeEventListeners() {
        console.log('Inicializando event listeners...');
        
        // Evento para registrar movimiento
        const registerForm = document.getElementById('registerMovementForm');
        if (registerForm) {
            console.log('Formulario de registro encontrado');
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarMovimiento();
            });
        } else {
            console.error('No se encontró el formulario de registro');
        }

        // Evento para mostrar movimientos
        const movementsModal = document.getElementById('movementsModal');
        if (movementsModal) {
            console.log('Modal de movimientos encontrado');
            movementsModal.addEventListener('show.bs.modal', (event) => {
                const button = event.relatedTarget;
                const idInsumo = button.getAttribute('data-insumo-id');
                const nombreInsumo = button.getAttribute('data-insumo-nombre');
                console.log('Mostrando movimientos para insumo:', { idInsumo, nombreInsumo });
                document.getElementById('movInsumoName').textContent = nombreInsumo;
                this.cargarMovimientos(idInsumo);
            });
        } else {
            console.error('No se encontró el modal de movimientos');
        }

        // Evento para actualizar unidad según insumo seleccionado
        const insumoSelect = document.getElementById('movementInsumo');
        if (insumoSelect) {
            console.log('Select de insumos encontrado');
            insumoSelect.addEventListener('change', (e) => {
                const insumoId = e.target.value;
                console.log('Insumo seleccionado:', insumoId);
                const insumo = this.insumos.find(i => i.ID_Insumo === parseInt(insumoId));
                if (insumo) {
                    console.log('Unidad actualizada:', insumo.Unidad);
                    document.getElementById('movementUnidad').value = insumo.Unidad;
                }
            });
        } else {
            console.error('No se encontró el select de insumos');
        }

        // Evento para búsqueda
        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            console.log('Input de búsqueda encontrado');
            searchInput.addEventListener('input', (e) => {
                this.filtrarInventario(e.target.value);
            });
        } else {
            console.error('No se encontró el input de búsqueda');
        }
    },

    async cargarInventario() {
        console.log('=== Cargando inventario ===');
        try {
            console.log('Realizando petición al API...');
            const inventario = await this.apiRequest('');
            console.log('Inventario recibido:', inventario);
            
            const tbody = document.getElementById('inventoryTableBody');
            if (!tbody) {
                console.error('No se encontró el elemento tbody para el inventario');
                return;
            }
            
            console.log('Limpiando tabla...');
            tbody.innerHTML = '';

            if (!Array.isArray(inventario) || inventario.length === 0) {
                console.log('No hay insumos en el inventario');
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay insumos registrados.</td></tr>';
                return;
            }

            console.log(`Renderizando ${inventario.length} insumos...`);
            inventario.forEach((item, index) => {
                console.log(`Renderizando insumo ${index + 1}:`, item);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.ID_Inventario}</td>
                    <td>${item.Nombre}</td>
                    <td>${item.Unidad}</td>
                    <td>${item.Cantidad_Disponible}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-success view-movements-btn" 
                                data-bs-toggle="modal" 
                                data-bs-target="#movementsModal"
                                data-insumo-id="${item.ID_Insumo}"
                                data-insumo-nombre="${item.Nombre}">
                            Ver Movimientos
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            console.log('Tabla actualizada con éxito');
        } catch (error) {
            console.error('=== Error al cargar inventario ===');
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            alert('Error al cargar el inventario');
        }
    },

    async cargarInsumos() {
        console.log('Cargando lista de insumos...');
        try {
            this.insumos = await this.apiRequest('/insumos');
            console.log('Insumos cargados:', this.insumos);
            
            const select = document.getElementById('movementInsumo');
            if (!select) {
                console.error('No se encontró el select de insumos');
                return;
            }
            
            select.innerHTML = '<option value="">Seleccione un insumo</option>';

            this.insumos.forEach(insumo => {
                console.log('Agregando insumo al select:', insumo);
                const option = document.createElement('option');
                option.value = insumo.ID_Insumo;
                option.textContent = insumo.Nombre;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar insumos:', error);
            alert('Error al cargar los insumos');
        }
    },

    async cargarMovimientos(idInsumo) {
        console.log('Cargando movimientos para insumo:', idInsumo);
        try {
            const movimientos = await this.apiRequest(`/movimientos/${idInsumo}`);
            console.log('Movimientos cargados:', movimientos);
            
            const tbody = document.getElementById('movementsTableBody');
            if (!tbody) {
                console.error('No se encontró el tbody para los movimientos');
                return;
            }
            
            tbody.innerHTML = '';

            if (movimientos.length === 0) {
                console.log('No hay movimientos para este insumo');
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay movimientos registrados.</td></tr>';
                return;
            }

            console.log('Renderizando', movimientos.length, 'movimientos');
            movimientos.forEach(mov => {
                console.log('Renderizando movimiento:', mov);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(mov.Fecha).toLocaleDateString()}</td>
                    <td>${mov.Tipo}</td>
                    <td>${mov.Cantidad}</td>
                    <td>${mov.Nombre_Usuario} ${mov.Apellido_Usuario}</td>
                    <td>${mov.Descripcion || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            alert('Error al cargar los movimientos');
        }
    },

    async registrarMovimiento() {
        console.log('Registrando nuevo movimiento...');
        try {
            const ID_Insumo = document.getElementById('movementInsumo').value;
            const Tipo = document.getElementById('movementTipo').value;
            const Cantidad = document.getElementById('movementCantidad').value;
            const Descripcion = document.getElementById('movementDescripcion').value;

            console.log('Datos del movimiento:', { ID_Insumo, Tipo, Cantidad, Descripcion });

            if (!ID_Insumo || !Tipo || !Cantidad) {
                console.error('Faltan campos requeridos');
                alert('Por favor complete todos los campos requeridos');
                return;
            }

            if (!this.userId) {
                console.error('No hay ID de usuario');
                alert('Error: No se pudo identificar al usuario');
                return;
            }

            await this.apiRequest('/movimientos', {
                method: 'POST',
                body: JSON.stringify({
                    ID_Insumo,
                    Tipo,
                    Cantidad: parseInt(Cantidad),
                    Descripcion,
                    ID_Usuario: this.userId
                })
            });

            console.log('Movimiento registrado exitosamente');
            // Cerrar modal y recargar inventario
            bootstrap.Modal.getInstance(document.getElementById('registerMovementModal')).hide();
            this.cargarInventario();
            
            // Limpiar formulario
            document.getElementById('registerMovementForm').reset();
            document.getElementById('movementUnidad').value = '';

        } catch (error) {
            console.error('Error al registrar movimiento:', error);
            alert(error.message || 'Error al registrar el movimiento');
        }
    },

    filtrarInventario(busqueda) {
        console.log('Filtrando inventario con:', busqueda);
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) {
            console.error('No se encontró el tbody para filtrar');
            return;
        }
        
        const filas = tbody.getElementsByTagName('tr');
        console.log('Filas a filtrar:', filas.length);

        for (let fila of filas) {
            const texto = fila.textContent.toLowerCase();
            const mostrar = texto.includes(busqueda.toLowerCase());
            fila.style.display = mostrar ? '' : 'none';
            if (mostrar) console.log('Fila visible:', texto);
        }
    }
};

// Exportar la función de inicialización
window.initInventario = function() {
    InventarioModule.init();
}; 