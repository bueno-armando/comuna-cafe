// Módulo de Productos
(function() {
    const API_URL = '/api/productos';
    let productos = [];
    let categorias = [];
    let editProductoId = null;
    let filteredProductos = [];

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
                    <button class="btn btn-sm btn-danger" onclick="deleteProducto(${producto.ID_Producto})">
                        <i class="bi bi-trash"></i> Eliminar
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
            Precio_Venta: parseFloat(formData.get('addPrecioVentaProducto'))
        };

        if (!data.Nombre || !data.ID_Categoria || isNaN(data.Precio_Venta)) {
            alert('Por favor complete todos los campos correctamente');
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
                alert('Producto agregado exitosamente');
                
                // Cerrar modal y limpiar formulario
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                if (modal) modal.hide();
                
                event.target.reset();
                
                // Recargar productos
                await fetchProductos();
                
            } else {
                alert('Error: ' + (result.message || 'Error al agregar producto'));
            }
            
        } catch (error) {
            console.error('Error en handleAddProducto:', error);
            alert('Error al agregar producto');
        }
    }

    // Función global para editar producto
    window.editProducto = function(id) {
        const producto = productos.find(p => p.ID_Producto == id);
        if (!producto) {
            alert('Producto no encontrado');
            return;
        }

        editProductoId = id;
        
        // Llenar formulario
        const form = document.getElementById('editProductoForm');
        if (form) {
            form.querySelector('[name="editNombreProducto"]').value = producto.Producto;
            form.querySelector('[name="editCategoriaProducto"]').value = producto.ID_Categoria;
            form.querySelector('[name="editPrecioVentaProducto"]').value = producto.Precio_Venta;
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
            Precio_Venta: parseFloat(formData.get('editPrecioVentaProducto'))
        };

        if (!data.Nombre || !data.ID_Categoria || isNaN(data.Precio_Venta)) {
            alert('Por favor complete todos los campos correctamente');
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
                alert('Producto actualizado exitosamente');
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProductoModal'));
                if (modal) modal.hide();
                
                editProductoId = null;
                
                // Recargar productos
                await fetchProductos();
                
            } else {
                alert('Error: ' + (result.message || 'Error al actualizar producto'));
            }
            
        } catch (error) {
            console.error('Error en handleEditProducto:', error);
            alert('Error al actualizar producto');
        }
    };

    // Función global para eliminar producto
    window.deleteProducto = async function(id) {
        if (!confirm('¿Está seguro de eliminar este producto?\n¡ADVERTENCIA! Eliminar un producto puede afectar recetas, ventas registradas e inventario.')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            const result = await response.json();

            if (response.ok) {
                alert('Producto eliminado exitosamente');
                
                // Cerrar modal si está abierto
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProductoModal'));
                if (modal) modal.hide();
                
                editProductoId = null;
                
                // Recargar productos
                await fetchProductos();
                
            } else {
                alert('Error: ' + (result.message || 'Error al eliminar producto'));
            }
            
        } catch (error) {
            console.error('Error en deleteProducto:', error);
            alert('Error al eliminar producto');
        }
    };

    // Función global para editar categoría
    window.editCategoria = function(id) {
        const categoria = categorias.find(c => c.ID_Categoria == id);
        if (!categoria) {
            alert('Categoría no encontrada');
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
            alert('Categoría no encontrada');
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
                alert('Categoría eliminada exitosamente');
                
                // Recargar categorías
                await fetchCategorias();
                
                // Actualizar también los selects de categorías en los formularios de productos
                populateCategoriasSelects();
                
            } else {
                alert('Error: ' + (result.message || 'Error al eliminar categoría'));
            }
            
        } catch (error) {
            console.error('Error en deleteCategoria:', error);
            alert('Error al eliminar categoría');
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
                alert('Categoría actualizada exitosamente');
                
                // Recargar categorías
                await fetchCategorias();
                
                // Actualizar también los selects de categorías en los formularios de productos
                populateCategoriasSelects();
                
            } else {
                alert('Error: ' + (result.message || 'Error al actualizar categoría'));
            }
            
        } catch (error) {
            console.error('Error en updateCategoria:', error);
            alert('Error al actualizar categoría');
        }
    }

    // Manejar agregar categoría
    async function handleAddCategoria(event) {
        event.preventDefault();
        
        const nombre = document.getElementById('newCategoryName').value.trim();
        
        if (!nombre) {
            alert('Por favor ingrese el nombre de la categoría');
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
                alert('Categoría agregada exitosamente');
                
                // Limpiar formulario
                document.getElementById('newCategoryName').value = '';
                
                // Recargar categorías
                await fetchCategorias();
                
                // Actualizar también los selects de categorías en los formularios de productos
                populateCategoriasSelects();
                
            } else {
                alert('Error: ' + (result.message || 'Error al agregar categoría'));
            }
            
        } catch (error) {
            console.error('Error en handleAddCategoria:', error);
            alert('Error al agregar categoría');
        }
    }



    // Exportar función de inicialización
    window.initProductos = initProductos;
    console.log('productos.js: window.initProductos ASIGNADO.', typeof window.initProductos);

})(); // Fin de la IIFE 