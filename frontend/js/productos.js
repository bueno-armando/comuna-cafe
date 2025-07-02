// Módulo de Productos
(function() {
    const API_URL_PRODUCTOS = '/api/productos'; 
    const API_URL_CATEGORIAS_PRODUCTO = '/api/categorias/producto'; // Asumiendo este endpoint
    let productos = []; 
    let editProductoId = null;
    let currentFiltersProductos = { nombre: '', categoria: '' }; 
    let currentPageProductos = 1; 
    const rowsPerPageProductos = 10; 

    function getToken() {
        return localStorage.getItem('token');
    }

    async function fetchAPI(url, options = {}) {
        const headers = {
                'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            ...options.headers,
        };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        return response.json();
    }

    async function fetchProductos(filters = {}, page = 1, limit = 10) {
        try {
            const params = new URLSearchParams();
            if (filters.nombre) params.append('nombre', filters.nombre);
            if (filters.categoria) params.append('ID_Categoria_Producto', filters.categoria); // Backend espera ID_Categoria_Producto
            params.append('page', page);
            params.append('limit', limit);

            const data = await fetchAPI(`${API_URL_PRODUCTOS}?${params.toString()}`);
            productos = data.productos || data; 
            renderTableProductos(productos);
            if (data.totalPages) {
                renderPaginationProductos(data.totalPages, page);
            }
        } catch (error) {
            console.error('Error en fetchProductos:', error);
            alert('No se pudieron cargar los productos: ' + error.message);
        }
    }

    async function loadCategoriasProducto() {
        try {
            const categorias = await fetchAPI(API_URL_CATEGORIAS_PRODUCTO);
            const selects = {
                add: document.getElementById('addCategoriaProducto'),
                edit: document.getElementById('editCategoriaProducto'),
                search: document.getElementById('searchCategoriaProducto'),
            };

            Object.values(selects).forEach(select => {
                if (select) {
                    const firstOptionValue = select === selects.search ? 'Todas las Categorías' : 'Seleccione Categoría';
                    select.innerHTML = `<option value="">${firstOptionValue}</option>`;
                    (categorias || []).forEach(cat => select.add(new Option(cat.Nombre, cat.ID_Categoria_Producto)));
                }
            });
        } catch (error) {
            console.error('Error cargando categorías de producto:', error.message);
        }
    }

    function renderTableProductos(productosToRender) {
        const tableBody = document.getElementById('productosTableBody');
        if (!tableBody) return console.warn('Productos: productosTableBody no encontrado para renderizar.');
        tableBody.innerHTML = '';
        (productosToRender || []).forEach(producto => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${producto.ID_Producto}</td>
                <td>${producto.Nombre}</td>
                <td>${producto.categoria_nombre || producto.CategoriaNombre || 'N/A'}</td>
                <td>$${parseFloat(producto.Precio_Venta || 0).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-producto-btn" data-id="${producto.ID_Producto}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-producto-btn" data-id="${producto.ID_Producto}">Eliminar</button>
                    </td>
                `;
        });
    }

    function renderPaginationProductos(totalPages, currentPage) {
        const paginationContainer = document.getElementById('paginationProductos');
        if (!paginationContainer) return console.warn('Productos: paginationProductos no encontrado.');
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
                currentPageProductos = i;
                fetchProductos(currentFiltersProductos, i, rowsPerPageProductos);
            });
            li.appendChild(a);
            paginationContainer.appendChild(li);
        }
    }

    async function addProducto(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            Nombre: formData.get('addNombreProducto'),
            ID_Categoria_Producto: parseInt(formData.get('addCategoriaProducto')),
            Precio_Venta: parseFloat(formData.get('addPrecioVentaProducto')),
        };
        if (!data.Nombre || !data.ID_Categoria_Producto || isNaN(data.Precio_Venta)) {
            return alert('Todos los campos son requeridos y el precio debe ser un número.');
        }
        try {
            await fetchAPI(API_URL_PRODUCTOS, { method: 'POST', body: JSON.stringify(data) });
            fetchProductos(currentFiltersProductos, currentPageProductos, rowsPerPageProductos);
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductoModal'));
            if(modal) modal.hide();
            event.target.reset();
        } catch (error) {
            console.error('Error en addProducto:', error);
            alert('No se pudo agregar el producto: ' + error.message);
        }
    }
    
    function editProducto(id) {
        const producto = productos.find(p => p.ID_Producto == id);
        if (!producto) return console.warn('Producto no encontrado para editar:', id);
        editProductoId = id;
        document.getElementById('editProductoId').value = producto.ID_Producto;
        document.getElementById('editNombreProducto').value = producto.Nombre;
        document.getElementById('editCategoriaProducto').value = producto.ID_Categoria_Producto;
        document.getElementById('editPrecioVentaProducto').value = producto.Precio_Venta;
        const modal = new bootstrap.Modal(document.getElementById('editProductoModal'));
        if(modal) modal.show();
    }

    async function saveEditProducto(event) {
        event.preventDefault();
        if (!editProductoId) return;
        const formData = new FormData(event.target);
        const data = {
            Nombre: formData.get('editNombreProducto'),
            ID_Categoria_Producto: parseInt(formData.get('editCategoriaProducto')),
            Precio_Venta: parseFloat(formData.get('editPrecioVentaProducto')),
        };
        if (!data.Nombre || !data.ID_Categoria_Producto || isNaN(data.Precio_Venta)) {
            return alert('Todos los campos son requeridos y el precio debe ser un número.');
        }
        try {
            await fetchAPI(`${API_URL_PRODUCTOS}/${editProductoId}`, { method: 'PUT', body: JSON.stringify(data) });
            fetchProductos(currentFiltersProductos, currentPageProductos, rowsPerPageProductos);
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductoModal'));
            if(modal) modal.hide();
            editProductoId = null;
        } catch (error) {
            console.error('Error en saveEditProducto:', error);
            alert('No se pudo actualizar el producto: ' + error.message);
        }
    }

    async function deleteProducto(id) {
        if (!confirm('¿Está seguro de eliminar este producto? \n¡ADVERTENCIA! Eliminar un producto puede afectar recetas, ventas registradas e inventario.')) return;
        try {
            await fetchAPI(`${API_URL_PRODUCTOS}/${id}`, { method: 'DELETE' });
            // Si la página actual queda vacía después de eliminar, ir a la página anterior si es posible
            const totalProductosDespuesDeEliminar = productos.length -1;
            if (totalProductosDespuesDeEliminar % rowsPerPageProductos === 0 && currentPageProductos > 1 && Math.ceil(totalProductosDespuesDeEliminar / rowsPerPageProductos) < currentPageProductos) {
                currentPageProductos--;
            }
            fetchProductos(currentFiltersProductos, currentPageProductos, rowsPerPageProductos);
        } catch (error) {
            console.error('Error en deleteProducto:', error);
            alert('No se pudo eliminar el producto: ' + error.message);
        }
    }
    
    function initProductos() {
        console.log('=== Inicializando módulo Productos ===');
        fetchProductos(currentFiltersProductos, currentPageProductos, rowsPerPageProductos);
        loadCategoriasProducto();

        const addForm = document.getElementById('addProductoForm');
        if (addForm) addForm.addEventListener('submit', addProducto);
        else console.warn('Productos: addProductoForm no encontrado');

        const editForm = document.getElementById('editProductoForm');
        if (editForm) editForm.addEventListener('submit', saveEditProducto);
        else console.warn('Productos: editProductoForm no encontrado');
        
        const searchNombre = document.getElementById('searchNombreProducto');
        if (searchNombre) searchNombre.addEventListener('input', (e) => {
            currentFiltersProductos.nombre = e.target.value;
            currentPageProductos = 1;
            fetchProductos(currentFiltersProductos, currentPageProductos, rowsPerPageProductos);
        });
        else console.warn('Productos: searchNombreProducto no encontrado');

        const searchCategoria = document.getElementById('searchCategoriaProducto');
        if (searchCategoria) searchCategoria.addEventListener('change', (e) => {
            currentFiltersProductos.categoria = e.target.value;
            currentPageProductos = 1;
            fetchProductos(currentFiltersProductos, currentPageProductos, rowsPerPageProductos);
        });
        else console.warn('Productos: searchCategoriaProducto no encontrado');

        const tableBody = document.getElementById('productosTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', function(e) {
                const editBtn = e.target.closest('.edit-producto-btn');
                if (editBtn) {
                    editProducto(editBtn.dataset.id);
                }
                const deleteBtn = e.target.closest('.delete-producto-btn');
                if (deleteBtn) {
                    deleteProducto(deleteBtn.dataset.id);
                }
            });
        } else console.warn('Productos: productosTableBody no encontrado para delegación de eventos.');
    }

    window.initProductos = initProductos;
    console.log('productos.js: window.initProductos ASIGNADO.', typeof window.initProductos);

})(); // Fin de la IIFE 