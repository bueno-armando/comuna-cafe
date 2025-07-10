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

    function initInsumos() {
        console.log('=== Inicializando módulo Insumos ===');
        fetchInsumos(currentFilters, currentPage, rowsPerPage);

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

        // Eliminar búsqueda por categoría (no existe en el HTML)
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
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        // Convertir a números donde sea necesario
        data.ID_Categoria_Insumo = parseInt(data.ID_Categoria_Insumo);
        data.Stock = parseFloat(data.Stock);
        data.Stock_Minimo = parseFloat(data.Stock_Minimo);
        data.Stock_Maximo = parseFloat(data.Stock_Maximo);

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