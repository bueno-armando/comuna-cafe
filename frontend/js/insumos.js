(function() {
    const API_URL = '/api/insumos'; // URL relativa
    let insumos = []; // Para almacenar la lista de insumos
    let editInsumoId = null;
    let currentFilters = { nombre: '', categoria: '' };
    let currentPage = 1;
    const rowsPerPage = 10;

    function getToken() {
        return localStorage.getItem('token');
    }

    async function fetchInsumos(filters = {}, page = 1, limit = 10) {
        try {
            console.log('fetchInsumos: filtros =', filters, 'page =', page, 'limit =', limit);
            // Construir query params para filtros y paginación
            const params = new URLSearchParams();
            if (filters.nombre) params.append('nombre', filters.nombre);
            if (filters.categoria) params.append('categoria', filters.categoria);
            params.append('page', page);
            params.append('limit', limit);

            const url = `${API_URL}?${params.toString()}`;
            console.log('fetchInsumos: URL solicitada =', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            console.log('fetchInsumos: status respuesta =', response.status);
            if (!response.ok) throw new Error('Error al obtener insumos');
            const data = await response.json();
            console.log('fetchInsumos: datos recibidos =', data);
            insumos = data.insumos || data; // Ajustar según la estructura de respuesta del backend
            renderTable(insumos);
            if (data.totalPages) {
                renderPagination(data.totalPages, page);
            }
        } catch (error) {
            console.error('Error en fetchInsumos:', error);
            alert('No se pudieron cargar los insumos.');
        }
    }
    
    // ... (Resto de las funciones: renderTable, renderPagination, addInsumo, editInsumo, saveEditInsumo, deleteInsumo, etc.)
    // Todas deben estar definidas dentro de la IIFE

    // Función para cargar proveedores y poblar el select
    async function cargarProveedores() {
        const addSelect = document.getElementById('addInsumoProveedor');
        const editSelect = document.getElementById('editInsumoProveedor');
        
        try {
            const response = await fetch('/api/insumos/proveedores', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Error al obtener proveedores');
            const proveedores = await response.json();
            
            // Cargar en el select de agregar
            if (addSelect) {
                addSelect.innerHTML = '<option value="">Seleccione un proveedor</option>';
                proveedores.forEach(prov => {
                    const option = document.createElement('option');
                    option.value = prov.ID_Proveedor;
                    option.textContent = prov.Nombre;
                    addSelect.appendChild(option);
                });
            }
            
            // Cargar en el select de editar
            if (editSelect) {
                editSelect.innerHTML = '<option value="">Seleccione un proveedor</option>';
                proveedores.forEach(prov => {
                    const option = document.createElement('option');
                    option.value = prov.ID_Proveedor;
                    option.textContent = prov.Nombre;
                    editSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            if (addSelect) addSelect.innerHTML = '<option value="">Error al cargar proveedores</option>';
            if (editSelect) editSelect.innerHTML = '<option value="">Error al cargar proveedores</option>';
        }
    }

    // Asegurar saltos de 1.00 y punto decimal en el input de costo
    function setupCostoInputStep() {
        console.log('=== setupCostoInputStep iniciado ===');
        
        const addCosto = document.getElementById('addInsumoCosto');
        console.log('addCosto encontrado:', !!addCosto);
        
        if (addCosto) {
            addCosto.step = '1.00';
            addCosto.inputMode = 'text';
            addCosto.pattern = '[0-9]+(\\.[0-9]{1,2})?';
            
            console.log('Configurando eventos para addCosto...');
            
            // TEMPORAL: Comentar todos los eventos para probar si el punto funciona sin ellos
            /*
            addCosto.addEventListener('input', function(e) {
                console.log('addCosto input event:', e.target.value, 'key:', e.data);
                this.value = this.value.replace(',', '.');
                console.log('addCosto después de reemplazar:', this.value);
            });
            
            addCosto.addEventListener('keypress', function(e) {
                console.log('addCosto keypress event:', e.key, 'value antes:', this.value);
                if (!/[0-9.]/.test(e.key)) {
                    console.log('addCosto: previniendo tecla no válida:', e.key);
                    e.preventDefault();
                    return;
                }
                if (e.key === '.' && this.value.includes('.')) {
                    console.log('addCosto: previniendo punto duplicado');
                    e.preventDefault();
                    return;
                }
                console.log('addCosto: permitiendo tecla:', e.key);
            });
            
            addCosto.addEventListener('keydown', function(e) {
                console.log('addCosto keydown event:', e.key, 'value:', this.value);
                if (e.key === '.') {
                    console.log('addCosto: detectado punto en keydown');
                }
            });
            
            addCosto.addEventListener('beforeinput', function(e) {
                console.log('addCosto beforeinput event:', e.inputType, 'data:', e.data, 'value:', this.value);
            });
            */
            
            // Solo mantener el evento blur para formateo
            addCosto.addEventListener('blur', function() {
                console.log('addCosto blur event, valor:', this.value);
                if (this.value) {
                    this.value = this.value.replace(',', '.');
                    const numValue = parseFloat(this.value);
                    if (!isNaN(numValue)) {
                        this.value = numValue.toFixed(2);
                        console.log('addCosto: formateado a:', this.value);
                    }
                }
            });
            
            console.log('Eventos configurados para addCosto (solo blur)');
        }
        
        const editCosto = document.getElementById('editInsumoCosto');
        console.log('editCosto encontrado:', !!editCosto);
        
        if (editCosto) {
            editCosto.step = '1.00';
            editCosto.inputMode = 'text';
            editCosto.pattern = '[0-9]+(\\.[0-9]{1,2})?';
            
            console.log('Configurando eventos para editCosto...');
            
            // TEMPORAL: Comentar todos los eventos para probar si el punto funciona sin ellos
            /*
            editCosto.addEventListener('input', function(e) {
                console.log('editCosto input event:', e.target.value, 'key:', e.data);
                this.value = this.value.replace(',', '.');
                console.log('editCosto después de reemplazar:', this.value);
            });
            
            editCosto.addEventListener('keypress', function(e) {
                console.log('editCosto keypress event:', e.key, 'value antes:', this.value);
                if (!/[0-9.]/.test(e.key)) {
                    console.log('editCosto: previniendo tecla no válida:', e.key);
                    e.preventDefault();
                    return;
                }
                if (e.key === '.' && this.value.includes('.')) {
                    console.log('editCosto: previniendo punto duplicado');
                    e.preventDefault();
                    return;
                }
                console.log('editCosto: permitiendo tecla:', e.key);
            });
            
            editCosto.addEventListener('keydown', function(e) {
                console.log('editCosto keydown event:', e.key, 'value:', this.value);
            });
            
            editCosto.addEventListener('beforeinput', function(e) {
                console.log('editCosto beforeinput event:', e.inputType, 'data:', e.data, 'value:', this.value);
            });
            */
            
            // Solo mantener el evento blur para formateo
            editCosto.addEventListener('blur', function() {
                console.log('editCosto blur event, valor:', this.value);
                if (this.value) {
                    this.value = this.value.replace(',', '.');
                    const numValue = parseFloat(this.value);
                    if (!isNaN(numValue)) {
                        this.value = numValue.toFixed(2);
                        console.log('editCosto: formateado a:', this.value);
                    }
                }
            });
            
            console.log('Eventos configurados para editCosto (solo blur)');
        }
        
        console.log('=== setupCostoInputStep completado ===');
    }

    // Llamar esta función al inicializar el módulo y al mostrar los modales
    function initInsumos() {
        console.log('=== Inicializando módulo Insumos ===');
        fetchInsumos(currentFilters, currentPage, rowsPerPage);
        cargarProveedores();
        setupCostoInputStep();

        const addInsumoForm = document.getElementById('addInsumoForm');
        if (addInsumoForm) addInsumoForm.addEventListener('submit', addInsumo);
        else console.warn('Insumos: addInsumoForm no encontrado');

        const editInsumoForm = document.getElementById('editInsumoForm');
        if (editInsumoForm) editInsumoForm.addEventListener('submit', saveEditInsumo);
        else console.warn('Insumos: editInsumoForm no encontrado');
        
        // Enlazar correctamente la barra de búsqueda por nombre
        const insumoSearchInput = document.getElementById('insumoSearch');
        if (insumoSearchInput) {
            console.log('Insumos: input de búsqueda encontrado');
            insumoSearchInput.addEventListener('input', (e) => {
                console.log('Insumos: input de búsqueda cambiado:', e.target.value);
                currentFilters.nombre = e.target.value;
                currentPage = 1; // Reset page on new search
                fetchInsumos(currentFilters, currentPage, rowsPerPage);
            });
        } else console.warn('Insumos: insumoSearchInput no encontrado');

        // Recargar proveedores cada vez que se abre el modal de agregar insumo
        const addInsumoModal = document.getElementById('addInsumoModal');
        if (addInsumoModal) {
            addInsumoModal.addEventListener('show.bs.modal', function() {
                cargarProveedores();
                setupCostoInputStep();
            });
        }

        // Delegación de eventos para botones de editar/eliminar en la tabla
        const insumosTableBody = document.getElementById('insumosTableBody');
        if (insumosTableBody) {
            insumosTableBody.addEventListener('click', function(e) {
                if (e.target.classList.contains('edit-btn')) {
                    const id = e.target.dataset.id;
                    editInsumo(id);
                }
                if (e.target.classList.contains('delete-btn')) {
                    const id = e.target.dataset.id;
                    deleteInsumo(id);
                }
            });
        } else console.warn('Insumos: insumosTableBody no encontrado');

        // Enlazar correctamente la barra de búsqueda por nombre
        const editInsumoModal = document.getElementById('editInsumoModal');
        if (editInsumoModal) {
            editInsumoModal.addEventListener('show.bs.modal', setupCostoInputStep);
        }

        // Botón eliminar insumo
        const deleteInsumoBtn = document.getElementById('deleteInsumoBtn');
        if (deleteInsumoBtn) {
            deleteInsumoBtn.addEventListener('click', function() {
                if (editInsumoId) {
                    deleteInsumo(editInsumoId);
                }
            });
        } else console.warn('Insumos: deleteInsumoBtn no encontrado');

        // ===== EVENT LISTENERS PARA PROVEEDORES =====
        
        // Formulario de proveedores
        const proveedorForm = document.getElementById('proveedorForm');
        if (proveedorForm) {
            proveedorForm.addEventListener('submit', function(event) {
                if (editProveedorId) {
                    saveEditProveedor(event);
                } else {
                    addProveedor(event);
                }
            });
        } else console.warn('Insumos: proveedorForm no encontrado');

        // Botón cancelar edición de proveedor
        const cancelProveedorEditBtn = document.getElementById('cancelProveedorEdit');
        if (cancelProveedorEditBtn) {
            cancelProveedorEditBtn.addEventListener('click', cancelProveedorEdit);
            cancelProveedorEditBtn.style.display = 'none'; // Ocultar inicialmente
        } else console.warn('Insumos: cancelProveedorEditBtn no encontrado');

        // Delegación de eventos para botones de editar/eliminar proveedores en la tabla
        const proveedoresTableBody = document.getElementById('proveedoresTableBody');
        if (proveedoresTableBody) {
            proveedoresTableBody.addEventListener('click', function(e) {
                if (e.target.classList.contains('edit-proveedor-btn') || e.target.closest('.edit-proveedor-btn')) {
                    const id = e.target.dataset.id || e.target.closest('.edit-proveedor-btn').dataset.id;
                    editProveedor(id);
                }
                if (e.target.classList.contains('delete-proveedor-btn') || e.target.closest('.delete-proveedor-btn')) {
                    const id = e.target.dataset.id || e.target.closest('.delete-proveedor-btn').dataset.id;
                    deleteProveedor(id);
                }
            });
        } else console.warn('Insumos: proveedoresTableBody no encontrado');

        // Cargar proveedores cuando se abre el modal
        const proveedoresModal = document.getElementById('proveedoresModal');
        if (proveedoresModal) {
            proveedoresModal.addEventListener('show.bs.modal', function() {
                cargarProveedoresTabla();
                // Resetear formulario y estado
                const form = document.getElementById('proveedorForm');
                if (form) {
                    form.reset();
                    editProveedorId = null;
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.textContent = 'Guardar';
                        submitBtn.classList.remove('btn-warning');
                        submitBtn.classList.add('btn-cafe');
                    }
                    const cancelBtn = document.getElementById('cancelProveedorEdit');
                    if (cancelBtn) cancelBtn.style.display = 'none';
                }
            });
        }
    }

    // Funciones auxiliares (renderTable, renderPagination, etc.) deben estar aquí dentro
    function renderTable(insumosToRender) {
        const tableBody = document.getElementById('insumosTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        (insumosToRender || []).forEach(insumo => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${insumo.ID_Insumo}</td>
                <td>${insumo.Nombre}</td>
                <td>${insumo.Unidad}</td>
                <td>${insumo.Costo}</td>
                <td>${insumo.Proveedor_Nombre || insumo.Proveedor || ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${insumo.ID_Insumo}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${insumo.ID_Insumo}">Eliminar</button>
                </td>
            `;
        });
    }

    function renderPagination(totalPages, currentPage) {
        const paginationContainer = document.getElementById('paginationInsumos');
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = i;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                fetchInsumos(currentFilters, i, rowsPerPage);
            });
            li.appendChild(a);
            paginationContainer.appendChild(li);
        }
    }

    async function addInsumo(event) {
        event.preventDefault();
        const form = event.target;
        // Mapear los nombres del formulario a los que espera el backend
        const data = {
            Nombre: form.querySelector('#addInsumoNombre').value,
            Unidad: form.querySelector('#addInsumoUnidad').value,
            Costo: form.querySelector('#addInsumoCosto').value,
            ID_Proveedor: form.querySelector('#addInsumoProveedor').value
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al agregar insumo');
            fetchInsumos(currentFilters, currentPage, rowsPerPage); // Recargar
            bootstrap.Modal.getInstance(document.getElementById('addInsumoModal')).hide();
            event.target.reset();
        } catch (error) {
            console.error('Error en addInsumo:', error);
            alert('No se pudo agregar el insumo.');
        }
    }
    
    function editInsumo(id) {
        console.log('editInsumo llamado con ID:', id);
        const insumo = insumos.find(i => i.ID_Insumo == id);
        if (!insumo) {
            console.error('Insumo no encontrado con ID:', id);
            return;
        }
        console.log('Insumo encontrado:', insumo);
        
        editInsumoId = id;
        
        // Llenar formulario con los datos correctos
        document.getElementById('editInsumoId').value = insumo.ID_Insumo;
        document.getElementById('editInsumoNombre').value = insumo.Nombre;
        document.getElementById('editInsumoUnidad').value = insumo.Unidad;
        document.getElementById('editInsumoCosto').value = insumo.Costo;
        
        // Cargar proveedores en el select y seleccionar el actual
        cargarProveedores().then(() => {
            const editSelect = document.getElementById('editInsumoProveedor');
            if (editSelect) {
                editSelect.value = insumo.ID_Proveedor;
            }
        });
        
        // Mostrar modal
        new bootstrap.Modal(document.getElementById('editInsumoModal')).show();
    }

    async function saveEditInsumo(event) {
        event.preventDefault();
        if (!editInsumoId) return;
        
        const form = event.target;
        // Mapear los nombres del formulario a los que espera el backend
        const data = {
            Nombre: form.querySelector('#editInsumoNombre').value,
            Unidad: form.querySelector('#editInsumoUnidad').value,
            Costo: form.querySelector('#editInsumoCosto').value,
            ID_Proveedor: form.querySelector('#editInsumoProveedor').value
        };

        try {
            const response = await fetch(`${API_URL}/${editInsumoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al actualizar insumo');
            fetchInsumos(currentFilters, currentPage, rowsPerPage); // Recargar
            bootstrap.Modal.getInstance(document.getElementById('editInsumoModal')).hide();
            editInsumoId = null;
        } catch (error) {
            console.error('Error en saveEditInsumo:', error);
            alert('No se pudo actualizar el insumo.');
        }
    }

    async function deleteInsumo(id) {
        if (!confirm('¿Está seguro de eliminar este insumo?')) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Error al eliminar insumo');
            
            // Cerrar modal si está abierto
            const editModal = document.getElementById('editInsumoModal');
            if (editModal) {
                const modalInstance = bootstrap.Modal.getInstance(editModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            
            fetchInsumos(currentFilters, currentPage, rowsPerPage); // Recargar
            alert('Insumo eliminado exitosamente');
        } catch (error) {
            console.error('Error en deleteInsumo:', error);
            alert('No se pudo eliminar el insumo.');
        }
    }

    // ===== FUNCIONES PARA PROVEEDORES =====
    let proveedores = [];
    let editProveedorId = null;

    // Cargar proveedores para la tabla
    async function cargarProveedoresTabla() {
        try {
            const response = await fetch('/api/insumos/proveedores/completos', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Error al obtener proveedores');
            proveedores = await response.json();
            renderProveedoresTable(proveedores);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            alert('No se pudieron cargar los proveedores.');
        }
    }

    // Renderizar tabla de proveedores
    function renderProveedoresTable(proveedoresToRender) {
        const tableBody = document.getElementById('proveedoresTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        // Ordenar por ID ascendente
        (proveedoresToRender || []).sort((a, b) => a.ID_Proveedor - b.ID_Proveedor).forEach(proveedor => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${proveedor.ID_Proveedor}</td>
                <td>${proveedor.Nombre}</td>
                <td>${proveedor.Telefono || ''}</td>
                <td>${proveedor.Direccion || ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-proveedor-btn" data-id="${proveedor.ID_Proveedor}">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger delete-proveedor-btn" data-id="${proveedor.ID_Proveedor}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
        });
    }

    // Agregar proveedor
    async function addProveedor(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            Nombre: form.querySelector('#proveedorNombre').value,
            Telefono: form.querySelector('#proveedorTelefono').value,
            Direccion: form.querySelector('#proveedorDireccion').value
        };

        try {
            const response = await fetch('/api/insumos/proveedores', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al agregar proveedor');
            
            // Recargar proveedores
            await cargarProveedoresTabla();
            await cargarProveedores(); // Recargar también el select de insumos
            
            // Limpiar formulario
            form.reset();
            alert('Proveedor agregado exitosamente');
        } catch (error) {
            console.error('Error en addProveedor:', error);
            alert('No se pudo agregar el proveedor.');
        }
    }

    // Editar proveedor
    async function editProveedor(id) {
        try {
            const response = await fetch(`/api/insumos/proveedores/${id}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Error al obtener proveedor');
            
            const proveedor = await response.json();
            editProveedorId = id;
            
            // Llenar formulario
            document.getElementById('proveedorNombre').value = proveedor.Nombre;
            document.getElementById('proveedorTelefono').value = proveedor.Telefono;
            document.getElementById('proveedorDireccion').value = proveedor.Direccion || '';
            
            // Cambiar botón a "Actualizar"
            const submitBtn = document.querySelector('#proveedorForm button[type="submit"]');
            submitBtn.textContent = 'Actualizar';
            submitBtn.classList.remove('btn-cafe');
            submitBtn.classList.add('btn-warning');
            
            // Mostrar botón cancelar
            document.getElementById('cancelProveedorEdit').style.display = 'inline-block';
        } catch (error) {
            console.error('Error en editProveedor:', error);
            alert('No se pudo cargar el proveedor.');
        }
    }

    // Guardar edición de proveedor
    async function saveEditProveedor(event) {
        event.preventDefault();
        if (!editProveedorId) return;
        
        const form = event.target;
        const data = {
            Nombre: form.querySelector('#proveedorNombre').value,
            Telefono: form.querySelector('#proveedorTelefono').value,
            Direccion: form.querySelector('#proveedorDireccion').value
        };

        try {
            const response = await fetch(`/api/insumos/proveedores/${editProveedorId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al actualizar proveedor');
            
            // Recargar proveedores
            await cargarProveedoresTabla();
            await cargarProveedores(); // Recargar también el select de insumos
            
            // Limpiar formulario y resetear estado
            form.reset();
            editProveedorId = null;
            
            // Cambiar botón de vuelta a "Guardar"
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Guardar';
            submitBtn.classList.remove('btn-warning');
            submitBtn.classList.add('btn-cafe');
            
            // Ocultar botón cancelar
            document.getElementById('cancelProveedorEdit').style.display = 'none';
            
            alert('Proveedor actualizado exitosamente');
        } catch (error) {
            console.error('Error en saveEditProveedor:', error);
            alert('No se pudo actualizar el proveedor.');
        }
    }

    // Cancelar edición de proveedor
    function cancelProveedorEdit() {
        const form = document.getElementById('proveedorForm');
        form.reset();
        editProveedorId = null;
        
        // Cambiar botón de vuelta a "Guardar"
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Guardar';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-cafe');
        
        // Ocultar botón cancelar
        document.getElementById('cancelProveedorEdit').style.display = 'none';
    }

    // Eliminar proveedor
    async function deleteProveedor(id) {
        if (!confirm('¿Está seguro de eliminar este proveedor?')) return;
        try {
            const response = await fetch(`/api/insumos/proveedores/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar proveedor');
            }
            
            // Recargar proveedores
            await cargarProveedoresTabla();
            await cargarProveedores(); // Recargar también el select de insumos
            
            alert('Proveedor eliminado exitosamente');
        } catch (error) {
            console.error('Error en deleteProveedor:', error);
            alert(error.message || 'No se pudo eliminar el proveedor.');
        }
    }

    window.initInsumos = initInsumos;
    console.log('insumos.js: window.initInsumos ASIGNADO.', typeof window.initInsumos);

})(); // Fin de la IIFE 