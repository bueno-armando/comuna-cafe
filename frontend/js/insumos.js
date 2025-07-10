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
        const select = document.getElementById('addInsumoProveedor');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccione un proveedor</option>';
        try {
            const response = await fetch('/api/insumos/proveedores', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!response.ok) throw new Error('Error al obtener proveedores');
            const proveedores = await response.json();
            proveedores.forEach(prov => {
                const option = document.createElement('option');
                option.value = prov.ID_Proveedor;
                option.textContent = prov.Nombre;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            select.innerHTML = '<option value="">Error al cargar proveedores</option>';
        }
    }

    // Asegurar saltos de 1.00 y punto decimal en el input de costo
    function setupCostoInputStep() {
        const addCosto = document.getElementById('addInsumoCosto');
        if (addCosto) {
            addCosto.step = '1.00';
            addCosto.inputMode = 'decimal';
            addCosto.pattern = '[0-9]+(\\.[0-9]{1,2})?';
            addCosto.addEventListener('keypress', function(e) {
                // Solo permitir números y punto
                if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault();
                }
                // Solo un punto decimal
                if (e.key === '.' && this.value.includes('.')) {
                    e.preventDefault();
                }
            });
            addCosto.addEventListener('change', function() {
                if (typeof this.value === 'string') {
                    this.value = this.value.replace(',', '.');
                }
                if (this.value) {
                    this.value = parseFloat(this.value).toFixed(2);
                }
            });
        }
        const editCosto = document.getElementById('editInsumoCosto');
        if (editCosto) {
            editCosto.step = '1.00';
            editCosto.inputMode = 'decimal';
            editCosto.pattern = '[0-9]+(\\.[0-9]{1,2})?';
            editCosto.addEventListener('keypress', function(e) {
                if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault();
                }
                if (e.key === '.' && this.value.includes('.')) {
                    e.preventDefault();
                }
            });
            editCosto.addEventListener('change', function() {
                if (typeof this.value === 'string') {
                    this.value = this.value.replace(',', '.');
                }
                if (this.value) {
                    this.value = parseFloat(this.value).toFixed(2);
                }
            });
        }
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
        const insumo = insumos.find(i => i.ID_Insumo == id);
        if (!insumo) return;
        editInsumoId = id;
        document.getElementById('editNombre').value = insumo.Nombre;
        document.getElementById('editCategoria').value = insumo.ID_Categoria_Insumo;
        document.getElementById('editUnidad').value = insumo.Unidad;
        document.getElementById('editStock').value = insumo.Stock;
        document.getElementById('editStockMinimo').value = insumo.Stock_Minimo;
        document.getElementById('editStockMaximo').value = insumo.Stock_Maximo;
        new bootstrap.Modal(document.getElementById('editInsumoModal')).show();
    }

    async function saveEditInsumo(event) {
        event.preventDefault();
        if (!editInsumoId) return;
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        // Convertir a números
        data.ID_Categoria_Insumo = parseInt(data.ID_Categoria_Insumo);
        data.Stock = parseFloat(data.Stock);
        data.Stock_Minimo = parseFloat(data.Stock_Minimo);
        data.Stock_Maximo = parseFloat(data.Stock_Maximo);

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
            fetchInsumos(currentFilters, currentPage, rowsPerPage); // Recargar
        } catch (error) {
            console.error('Error en deleteInsumo:', error);
            alert('No se pudo eliminar el insumo.');
        }
    }

    window.initInsumos = initInsumos;
    console.log('insumos.js: window.initInsumos ASIGNADO.', typeof window.initInsumos);

})(); // Fin de la IIFE 