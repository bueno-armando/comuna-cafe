// Módulo de Productos
(function() {
    const API_URL = '/api/productos';
    let productos = [];
    let categorias = [];
    let editProductoId = null;
    let filteredProductos = [];
    let productosInactivos = [];
    let inactivosLoaded = false;

    // Función para mostrar notificaciones
    function mostrarNotificacion(titulo, mensaje, tipo = 'success') {
        const modal = document.getElementById('notificacionModal');
        const tituloElement = document.getElementById('notificacionTitulo');
        const mensajeElement = document.getElementById('notificacionMensaje');
        
        // Configurar icono y color según el tipo
        let icono, color;
        switch(tipo) {
            case 'success':
                icono = 'bi-check-circle';
                color = 'text-success';
                break;
            case 'error':
                icono = 'bi-exclamation-triangle';
                color = 'text-danger';
                break;
            case 'warning':
                icono = 'bi-exclamation-circle';
                color = 'text-warning';
                break;
            default:
                icono = 'bi-info-circle';
                color = 'text-info';
        }
        
        tituloElement.innerHTML = `<i class="bi ${icono} me-2 ${color}"></i>${titulo}`;
        mensajeElement.textContent = mensaje;
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    function getToken() {
        return localStorage.getItem('token');
    }

    // Función principal de inicialización
    async function initProductos() {
        console.log('=== Inicializando módulo Productos ===');
        
        try {
            // Cargar productos
            await fetchProductos();
            
            // Cargar categorías
            await fetchCategorias();
            
            // Configurar event listeners
            setupEventListeners();
            
            // Poblar selects de categorías después de un pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
                console.log('Poblando selects después del delay...');
                populateCategoriasSelects();
            }, 100);
            
            // Configurar event listeners para productos inactivos
            console.log('[initProductos] Llamando a setupInactivosEventListeners...');
            setupInactivosEventListeners();
            console.log('[initProductos] setupInactivosEventListeners completado.');
            
        } catch (error) {
            console.error('Error inicializando productos:', error);
        }
    }

    // Obtener productos desde el backend
    async function fetchProductos() {
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener los productos');
            }
            
            productos = await response.json();
            filteredProductos = [...productos];
            renderTable();
            
        } catch (error) {
            console.error('Error en fetchProductos:', error);
            const tableBody = document.getElementById('productosTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar los productos</td></tr>';
            }
        }
    }

    // Obtener categorías desde el backend
    async function fetchCategorias() {
        try {
            console.log('Fetching categorías desde:', `${API_URL}/categorias`);
            
            const response = await fetch(`${API_URL}/categorias`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Error al obtener categorías');
            }
            
            categorias = await response.json();
            console.log('Categorías obtenidas:', categorias);
            
            // Renderizar tabla de categorías
            renderCategoriesTable();
            
            // No llamamos populateCategoriasSelects aquí porque se llama después del delay en initProductos
            
        } catch (error) {
            console.error('Error en fetchCategorias:', error);
        }
    }

    async function fetchProductosInactivos() {
        try {
            const url = `${API_URL}/inactivos`;
            console.log('[fetchProductosInactivos] Fetch URL:', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            console.log('[fetchProductosInactivos] Respuesta:', response.status);
            if (!response.ok) throw new Error('Error al obtener productos inactivos');
            productosInactivos = await response.json();
            console.log('[fetchProductosInactivos] Productos inactivos:', productosInactivos);
            renderInactivosTable();
            inactivosLoaded = true;
        } catch (error) {
            console.error('[fetchProductosInactivos] Error:', error);
            const tableBody = document.getElementById('inactivosTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar los productos inactivos</td></tr>';
            }
        }
    }

    function renderInactivosTable() {
        const tableBody = document.getElementById('inactivosTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        // Mostrar siempre la tabla, aunque esté vacía
        if (!productosInactivos || productosInactivos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos inactivos</td></tr>';
            return;
        }
        productosInactivos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.ID_Producto}</td>
                <td>${producto.Producto}</td>
                <td>${producto.Categoria}</td>
                <td>$${parseFloat(producto.Precio_Venta || 0).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-success" data-id="${producto.ID_Producto}" data-action="reactivar">
                        <i class="bi bi-arrow-repeat"></i> Reactivar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    async function reactivarProducto(id) {
        try {
            const url = `${API_URL}/${id}/activar`;
            console.log('[reactivarProducto] Fetch URL:', url);
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            let result;
            let text = await response.text();
            console.log('[reactivarProducto] Respuesta status:', response.status, 'Texto recibido:', text);
            try {
                result = text ? JSON.parse(text) : {};
            } catch (e) {
                console.warn('[reactivarProducto] No se pudo parsear como JSON:', e);
                result = { message: text };
            }
            if (response.ok) {
                // Actualizar ambas tablas
                await fetchProductos();
                await fetchProductosInactivos();
                
                // Mostrar notificación de éxito
                mostrarNotificacion('Éxito', 'Producto reactivado exitosamente', 'success');
            } else {
                mostrarNotificacion('Error', result.message || 'Error al reactivar producto', 'error');
            }
        } catch (error) {
            console.error('[reactivarProducto] Error:', error);
            mostrarNotificacion('Error', 'No se pudo reactivar el producto.', 'error');
        }
    }

    function setupInactivosEventListeners() {
        console.log('[setupInactivosEventListeners] Ejecutando...');
        const btn = document.getElementById('toggleInactivosBtn');
        if (btn) {
            console.log('[setupInactivosEventListeners] Botón toggleInactivosBtn encontrado:', btn);
            btn.addEventListener('click', async function() {
                console.log('[toggleInactivosBtn] Click detectado');
                const section = document.getElementById('inactivosSection');
                if (!section) {
                    console.warn('[setupInactivosEventListeners] No se encontró el elemento inactivosSection');
                    return;
                }
                if (section.style.display === 'none') {
                    section.style.display = '';
                    btn.innerHTML = '<i class="bi bi-eye me-2"></i>Ocultar productos inactivos';
                    if (!inactivosLoaded) {
                        console.log('[toggleInactivosBtn] Llamando a fetchProductosInactivos()');
                        await fetchProductosInactivos();
                    } else {
                        console.log('[toggleInactivosBtn] Llamando a renderInactivosTable()');
                        renderInactivosTable(); // Asegura que la tabla se muestre aunque esté vacía
                    }
                } else {
                    section.style.display = 'none';
                    btn.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Ver productos inactivos';
                }
            });
        } else {
            console.warn('[setupInactivosEventListeners] No se encontró el botón toggleInactivosBtn');
        }
        // Delegar clicks en la tabla de inactivos
        const inactivosTable = document.getElementById('inactivosTableBody');
        if (inactivosTable) {
            console.log('[setupInactivosEventListeners] inactivosTableBody encontrado:', inactivosTable);
            inactivosTable.addEventListener('click', function(e) {
                if (e.target.closest('button[data-action="reactivar"]')) {
                    const id = e.target.closest('button').getAttribute('data-id');
                    reactivarProducto(id);
                }
            });
        } else {
            console.warn('[setupInactivosEventListeners] No se encontró el elemento inactivosTableBody');
        }
    }

    // Poblar los selects de categorías
    function populateCategoriasSelects() {
        console.log('Poblando selects de categorías...');
        console.log('Categorías disponibles:', categorias);
        
        const selects = [
            'select[name="addCategoriaProducto"]',
            'select[name="editCategoriaProducto"]'
        ];

        selects.forEach(selector => {
            const select = document.querySelector(selector);
            console.log(`Buscando elemento: ${selector}`, select);
            
            if (select) {
                select.innerHTML = '<option value="">Seleccione una categoría</option>';
                categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.ID_Categoria;
                    option.textContent = categoria.Nombre;
                    select.appendChild(option);
                });
                console.log(`Select ${selector} poblado con ${categorias.length} categorías`);
            } else {
                console.warn(`Elemento ${selector} no encontrado en el DOM`);
            }
        });
    }

    // Renderizar tabla de productos
    function renderTable() {
        const tableBody = document.getElementById('productosTableBody');
        if (!tableBody) {
            console.warn('Elemento productosTableBody no encontrado');
            return;
        }

        tableBody.innerHTML = '';

        if (!filteredProductos || filteredProductos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos disponibles</td></tr>';
            return;
        }

        filteredProductos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.ID_Producto}</td>
                <td>${producto.Producto}</td>
                <td>${producto.Categoria}</td>
                <td>$${parseFloat(producto.Precio_Venta || 0).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="editProducto(${producto.ID_Producto})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="desactivarProducto(${producto.ID_Producto})">
                        <i class="bi bi-eye-slash"></i> Desactivar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Filtrar productos por búsqueda
    function filterProductos(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            filteredProductos = [...productos];
        } else {
            const term = searchTerm.toLowerCase().trim();
            filteredProductos = productos.filter(producto => 
                producto.Producto.toLowerCase().includes(term) ||
                producto.Categoria.toLowerCase().includes(term)
            );
        }
        renderTable();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Búsqueda de productos
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterProductos(this.value);
            });
        } else {
            console.warn('Elemento productSearch no encontrado');
        }

        // Formulario de agregar producto
        const addForm = document.getElementById('addProductoForm');
        if (addForm) {
            addForm.addEventListener('submit', handleAddProducto);
        } else {
            console.warn('Elemento addProductoForm no encontrado');
        }

        // Formulario de editar producto
        const editForm = document.getElementById('editProductoForm');
        if (editForm) {
            editForm.addEventListener('submit', handleEditProducto);
        } else {
            console.warn('Elemento editProductoForm no encontrado');
        }

        // Botón de eliminar producto
        const deleteBtn = document.getElementById('deleteProductoBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (editProductoId) {
                    deleteProducto(editProductoId);
                }
            });
        }

        // Formulario de agregar categoría
        const addCategoryForm = document.getElementById('addCategoryForm');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', handleAddCategoria);
        } else {
            console.warn('Elemento addCategoryForm no encontrado');
        }

        // Formatear campos de precio para mantener 2 decimales
        setupPriceFormatting();

        // Configurar preview de imagen para el modal de agregar
        setupImagePreview('addRutaImagenProducto', 'addImagePreview');
        // Configurar preview de imagen para el modal de editar
        setupImagePreview('editRutaImagenProducto', 'editImagePreview');
    }

    // Configurar formateo de precios
    function setupPriceFormatting() {
        const priceInputs = [
            'input[name="addPrecioVentaProducto"]',
            'input[name="editPrecioVentaProducto"]'
        ];

        priceInputs.forEach(selector => {
            const input = document.querySelector(selector);
            if (input) {
                // Formatear al cambiar el valor
                input.addEventListener('change', function() {
                    if (this.value) {
                        this.value = parseFloat(this.value).toFixed(2);
                    }
                });

                // Formatear al perder el foco
                input.addEventListener('blur', function() {
                    if (this.value) {
                        this.value = parseFloat(this.value).toFixed(2);
                    }
                });
            }
        });
    }

    // Renderizar tabla de categorías
    function renderCategoriesTable() {
        const tableBody = document.getElementById('categoriesTableBody');
        if (!tableBody) {
            console.warn('Elemento categoriesTableBody no encontrado');
            return;
        }

        tableBody.innerHTML = '';

        if (!categorias || categorias.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No hay categorías disponibles</td></tr>';
            return;
        }

        categorias.forEach(categoria => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${categoria.ID_Categoria}</td>
                <td>${categoria.Nombre}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="editCategoria(${categoria.ID_Categoria})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategoria(${categoria.ID_Categoria})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Manejar agregar producto
    async function handleAddProducto(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = {
            Nombre: formData.get('addNombreProducto'),
            ID_Categoria: parseInt(formData.get('addCategoriaProducto')),
            Precio_Venta: parseFloat(formData.get('addPrecioVentaProducto')),
            ruta_imagen: formData.get('addRutaImagenProducto') || null
        };

        if (!data.Nombre || !data.ID_Categoria || isNaN(data.Precio_Venta)) {
            notificationModal.showWarning('Por favor complete todos los campos correctamente');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Cerrar modal y limpiar formulario
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                if (modal) modal.hide();
                
                event.target.reset();
                
                // Recargar productos
                await fetchProductos();
                
                // Mostrar notificación de éxito
                mostrarNotificacion('Éxito', 'Producto agregado exitosamente', 'success');
                
            } else {
                mostrarNotificacion('Error', result.message || 'Error al agregar producto', 'error');
            }
            
        } catch (error) {
            console.error('Error en handleAddProducto:', error);
            mostrarNotificacion('Error', 'Error al agregar producto', 'error');
        }
    }

    // Función global para editar producto
    window.editProducto = function(id) {
        const producto = productos.find(p => p.ID_Producto == id);
        if (!producto) {
            mostrarNotificacion('Error', 'Producto no encontrado', 'error');
            return;
        }

        editProductoId = id;
        
        // Llenar formulario
        const form = document.getElementById('editProductoForm');
        if (form) {
            form.querySelector('[name="editNombreProducto"]').value = producto.Producto;
            form.querySelector('[name="editCategoriaProducto"]').value = producto.ID_Categoria;
            form.querySelector('[name="editPrecioVentaProducto"]').value = producto.Precio_Venta;
            form.querySelector('[name="editRutaImagenProducto"]').value = producto.ruta_imagen || '';
            
            // Mostrar preview de imagen actual si existe
            const preview = document.getElementById('editImagePreview');
            const img = preview.querySelector('img');
            if (producto.ruta_imagen && img) {
                img.src = producto.ruta_imagen;
                img.onload = function() {
                    preview.style.display = 'block';
                };
                img.onerror = function() {
                    preview.style.display = 'none';
                };
            } else {
                preview.style.display = 'none';
            }
        }

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editProductoModal'));
        modal.show();
    };

    // Manejar editar producto
    async function handleEditProducto(event) {
        event.preventDefault();
        
        if (!editProductoId) return;
        
        const formData = new FormData(event.target);
        const data = {
            Nombre: formData.get('editNombreProducto'),
            ID_Categoria: parseInt(formData.get('editCategoriaProducto')),
            Precio_Venta: parseFloat(formData.get('editPrecioVentaProducto')),
            ruta_imagen: formData.get('editRutaImagenProducto') || null
        };

        if (!data.Nombre || !data.ID_Categoria || isNaN(data.Precio_Venta)) {
            mostrarNotificacion('Error', 'Por favor complete todos los campos correctamente', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${editProductoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProductoModal'));
                if (modal) modal.hide();
                
                editProductoId = null;
                
                // Recargar productos
                await fetchProductos();
                
                // Mostrar notificación de éxito
                mostrarNotificacion('Éxito', 'Producto actualizado exitosamente', 'success');
                
            } else {
                mostrarNotificacion('Error', result.message || 'Error al actualizar producto', 'error');
            }
            
        } catch (error) {
            console.error('Error en handleEditProducto:', error);
            mostrarNotificacion('Error', 'Error al actualizar producto', 'error');
        }
    };

    // Función global para desactivar producto
    window.desactivarProducto = async function(id) {
        console.log('[desactivarProducto] Intentando desactivar producto con id:', id);
        if (!confirm('¿Está seguro de desactivar este producto?')) {
            console.log('[desactivarProducto] Cancelado por el usuario.');
            return;
        }
        try {
            const url = `${API_URL}/${id}/desactivar`;
            console.log('[desactivarProducto] Fetch URL:', url);
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            let result;
            let text = await response.text();
            console.log('[desactivarProducto] Respuesta status:', response.status, 'Texto recibido:', text);
            try {
                result = text ? JSON.parse(text) : {};
            } catch (e) {
                console.warn('[desactivarProducto] No se pudo parsear como JSON:', e);
                result = { message: text };
            }
            if (response.ok) {
                // Cerrar modal si está abierto
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProductoModal'));
                if (modal) modal.hide();
                editProductoId = null;
                // Recargar productos y tabla de inactivos
                await fetchProductos();
                inactivosLoaded = false; // Forzar recarga la próxima vez
                const section = document.getElementById('inactivosSection');
                if (section && section.style.display !== 'none') {
                    await fetchProductosInactivos();
                }
                
                // Mostrar notificación de éxito
                mostrarNotificacion('Éxito', 'Producto desactivado exitosamente', 'success');
            } else {
                mostrarNotificacion('Error', result.message || 'Error al desactivar producto', 'error');
            }
        } catch (error) {
            console.error('[desactivarProducto] Error:', error);
            mostrarNotificacion('Error', 'Error al desactivar producto', 'error');
        }
    };

    // Función global para editar categoría
    window.editCategoria = function(id) {
        const categoria = categorias.find(c => c.ID_Categoria == id);
        if (!categoria) {
            mostrarNotificacion('Error', 'Categoría no encontrada', 'error');
            return;
        }

        const nuevoNombre = prompt('Editar nombre de categoría:', categoria.Nombre);
        if (nuevoNombre === null || nuevoNombre.trim() === '') {
            return;
        }

        updateCategoria(id, nuevoNombre.trim());
    };

    // Función global para eliminar categoría
    window.deleteCategoria = async function(id) {
        const categoria = categorias.find(c => c.ID_Categoria == id);
        if (!categoria) {
            mostrarNotificacion('Error', 'Categoría no encontrada', 'error');
            return;
        }

        if (!confirm(`¿Está seguro de eliminar la categoría "${categoria.Nombre}"?\n¡ADVERTENCIA! Eliminar una categoría puede afectar productos asociados.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/categorias/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            const result = await response.json();

            if (response.ok) {
                // Recargar categorías
                await fetchCategorias();
                
                // Actualizar también los selects de categorías en los formularios de productos
                populateCategoriasSelects();
                
                // Mostrar notificación de éxito
                mostrarNotificacion('Éxito', 'Categoría eliminada exitosamente', 'success');
                
            } else {
                mostrarNotificacion('Error', result.message || 'Error al eliminar categoría', 'error');
            }
            
        } catch (error) {
            console.error('Error en deleteCategoria:', error);
            mostrarNotificacion('Error', 'Error al eliminar categoría', 'error');
        }
    };

    // Actualizar categoría
    async function updateCategoria(id, nuevoNombre) {
        try {
            const response = await fetch(`${API_URL}/categorias/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ Nombre: nuevoNombre })
            });

            const result = await response.json();

            if (response.ok) {
                notificationModal.showSuccess('Categoría actualizada exitosamente');
                
                // Recargar categorías
                await fetchCategorias();
                
                // Actualizar también los selects de categorías en los formularios de productos
                populateCategoriasSelects();
                
            } else {
                notificationModal.showError('Error: ' + (result.message || 'Error al actualizar categoría'));
            }
            
        } catch (error) {
            console.error('Error en updateCategoria:', error);
            notificationModal.showError('Error al actualizar categoría');
        }
    }

    // Manejar agregar categoría
    async function handleAddCategoria(event) {
        event.preventDefault();
        
        const nombre = document.getElementById('newCategoryName').value.trim();
        
        if (!nombre) {
            notificationModal.showWarning('Por favor ingrese el nombre de la categoría');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/categorias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ Nombre: nombre })
            });

            const result = await response.json();

            if (response.ok) {
                notificationModal.showSuccess('Categoría agregada exitosamente');
                
                // Limpiar formulario
                document.getElementById('newCategoryName').value = '';
                
                // Recargar categorías
                await fetchCategorias();
                
                // Actualizar también los selects de categorías en los formularios de productos
                populateCategoriasSelects();
                
            } else {
                notificationModal.showError('Error: ' + (result.message || 'Error al agregar categoría'));
            }
            
        } catch (error) {
            console.error('Error en handleAddCategoria:', error);
            notificationModal.showError('Error al agregar categoría');
        }
    }

    // Función para manejar preview de imagen
    function setupImagePreview(inputName, previewId) {
        const input = document.querySelector(`[name="${inputName}"]`);
        const preview = document.getElementById(previewId);
        const img = preview.querySelector('img');
        
        if (input && preview && img) {
            input.addEventListener('input', function() {
                const url = this.value.trim();
                if (url) {
                    img.src = url;
                    img.onload = function() {
                        preview.style.display = 'block';
                    };
                    img.onerror = function() {
                        preview.style.display = 'none';
                        console.warn('No se pudo cargar la imagen:', url);
                    };
                } else {
                    preview.style.display = 'none';
                }
            });
        }
    }

    // Exportar función de inicialización
    window.initProductos = initProductos;
    console.log('productos.js: window.initProductos ASIGNADO.', typeof window.initProductos);

})(); // Fin de la IIFE 