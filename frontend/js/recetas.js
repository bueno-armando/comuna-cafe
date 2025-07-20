(function() {
    // Configuración de la API
    var API = {
        URL: '/api/recetas',
        PRODUCTOS_URL: '/api/recetas/productos/todos', // Usar el nuevo endpoint
        INSUMOS_URL: '/api/insumos',
        getToken: () => localStorage.getItem('token')
    };

    // Variables globales del módulo
    let currentProductId = null;
    let productosList = [];
    let selectedProductName = '';
    let insumosList = []; // Lista de insumos disponibles

    // Función para verificar autenticación
    function checkAuth() {
        const token = API.getToken();
        if (!token) {
            window.location.href = 'Inicio%20Sesion.html';
            return false;
        }
        return true;
    }

    // Función para configurar el formato de decimales en inputs
    function setupQuantityInputFormat() {
        const quantityInputs = ['ingredientQuantity', 'editIngredientQuantity'];
        
        quantityInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.step = '1.00';
                input.inputMode = 'text';
                input.pattern = '[0-9]+(\\.[0-9]{1,2})?';
                
                // Solo mantener el evento blur para formateo
                input.addEventListener('blur', function() {
                    if (this.value) {
                        this.value = this.value.replace(',', '.');
                        const numValue = parseFloat(this.value);
                        if (!isNaN(numValue)) {
                            this.value = numValue.toFixed(2);
                        }
                    }
                });
            }
        });
    }

    // Función para configurar botones de incremento/decremento
    function setupIncrementDecrementButtons() {
        // Botones para el modal de agregar
        const incrementBtn = document.getElementById('incrementBtn');
        const decrementBtn = document.getElementById('decrementBtn');
        const quantityInput = document.getElementById('ingredientQuantity');
        
        if (incrementBtn && decrementBtn && quantityInput) {
            incrementBtn.addEventListener('click', function() {
                const currentValue = parseFloat(quantityInput.value) || 0;
                const newValue = currentValue + 1;
                quantityInput.value = newValue.toFixed(2);
                quantityInput.dispatchEvent(new Event('blur'));
            });
            
            decrementBtn.addEventListener('click', function() {
                const currentValue = parseFloat(quantityInput.value) || 0;
                const newValue = Math.max(0, currentValue - 1);
                quantityInput.value = newValue.toFixed(2);
                quantityInput.dispatchEvent(new Event('blur'));
            });
        }
        
        // Botones para el modal de editar
        const editIncrementBtn = document.getElementById('editIncrementBtn');
        const editDecrementBtn = document.getElementById('editDecrementBtn');
        const editQuantityInput = document.getElementById('editIngredientQuantity');
        
        if (editIncrementBtn && editDecrementBtn && editQuantityInput) {
            editIncrementBtn.addEventListener('click', function() {
                const currentValue = parseFloat(editQuantityInput.value) || 0;
                const newValue = currentValue + 1;
                editQuantityInput.value = newValue.toFixed(2);
                editQuantityInput.dispatchEvent(new Event('blur'));
            });
            
            editDecrementBtn.addEventListener('click', function() {
                const currentValue = parseFloat(editQuantityInput.value) || 0;
                const newValue = Math.max(0, currentValue - 1);
                editQuantityInput.value = newValue.toFixed(2);
                editQuantityInput.dispatchEvent(new Event('blur'));
            });
        }
    }

    // Función para actualizar la unidad cuando se selecciona un insumo
    function updateUnitForIngredient(insumoId, unitElementId) {
        const insumo = insumosList.find(i => i.ID_Insumo === parseInt(insumoId));
        const unitElement = document.getElementById(unitElementId);
        
        if (insumo && unitElement) {
            unitElement.textContent = insumo.Unidad;
        }
    }

    // Función para actualizar el estilo de la barra de búsqueda
    function updateSearchInputStyle(isSearching = false) {
        const searchInput = document.getElementById('productSearch');
        if (isSearching) {
            searchInput.style.color = '#6c757d'; // Color gris para placeholder
        } else if (selectedProductName) {
            searchInput.style.color = '#212529'; // Color normal para texto seleccionado
            searchInput.value = selectedProductName;
        }
    }

    // Función para cargar todos los productos
    async function loadAllProductos() {
        if (!checkAuth()) return;

        try {
            console.log('Cargando productos desde:', API.PRODUCTOS_URL);
            const response = await fetch(`${API.PRODUCTOS_URL}`, {
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar los productos: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Debug: mostrar la respuesta completa
            console.log('Respuesta API productos:', data);
            
            // Asegurarnos de que productosList sea un array
            productosList = Array.isArray(data) ? data : [];
            
            console.log('Productos cargados:', productosList.length);
            
            return productosList;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            notificationModal.showError('Error al cargar los productos: ' + error.message);
            return [];
        }
    }

    // Función para cargar las recetas de un producto
    async function loadRecetas(productId, productName) {
        if (!checkAuth()) return;
        
        console.log('Cargando recetas para producto:', productId, productName);
        currentProductId = productId;
        selectedProductName = productName;

        try {
            const response = await fetch(`${API.URL}/producto/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Si no hay recetas, mostrar mensaje y tabla vacía
                    displayRecetas([]);
                    return;
                }
                throw new Error(`Error al cargar las recetas: ${response.status} ${response.statusText}`);
            }

            const recetas = await response.json();
            console.log('Recetas cargadas:', recetas);
            displayRecetas(recetas);
        } catch (error) {
            console.error('Error:', error);
            notificationModal.showError('Error al cargar las recetas: ' + error.message);
        }
    }

    // Función para cargar todos los insumos
    async function loadInsumos() {
        if (!checkAuth()) return;

        try {
            console.log('Iniciando carga de insumos...');
            const response = await fetch(`${API.INSUMOS_URL}`, {
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar los insumos: ${response.status} ${response.statusText}`);
            }

            insumosList = await response.json();
            
            console.log('Insumos cargados:', insumosList.length);
            
            // Actualizar el select de insumos
            const select = document.getElementById('ingredientName');
            if (select) {
                select.innerHTML = '<option value="">Seleccione un insumo</option>';
                
                insumosList.forEach(insumo => {
                    const option = document.createElement('option');
                    option.value = insumo.ID_Insumo;
                    option.textContent = `${insumo.Nombre} (${insumo.Unidad})`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar insumos:', error);
            notificationModal.showError('Error al cargar los insumos disponibles: ' + error.message);
        }
    }

    // Función para mostrar las recetas en la tabla
    function displayRecetas(recetas) {
        const tbody = document.getElementById('recipeTableBody');
        if (!tbody) {
            console.error('No se encontró el elemento recipeTableBody');
            return;
        }
        
        tbody.innerHTML = '';

        if (recetas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <div class="alert alert-info mb-0">
                            <i class="bi bi-info-circle me-2"></i>Este producto no tiene recetas registradas.
                            <button class="btn btn-primary btn-sm ms-3" onclick="openAddIngredientModal()">
                                <i class="bi bi-plus-circle me-1"></i>Agregar primera receta
                            </button>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        recetas.forEach(receta => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${receta.Insumo}</td>
                <td>${receta.Cantidad_Necesaria}</td>
                <td>${receta.Unidad}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" 
                            onclick="editIngredient(${receta.ID_Producto}, ${receta.ID_Insumo}, '${receta.Insumo}', ${receta.Cantidad_Necesaria}, '${receta.Unidad}')">
                        <i class="bi bi-pencil-square me-1"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="deleteIngredient(${receta.ID_Producto}, ${receta.ID_Insumo})">
                        <i class="bi bi-trash me-1"></i>Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Función para mostrar todos los productos en grid
    function displayProductGrid(productos) {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) {
            console.error('No se encontró el elemento productGrid');
            return;
        }
        
        productGrid.innerHTML = '';

        if (productos.length === 0) {
            productGrid.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>No hay productos disponibles.
                    </div>
                </div>`;
            return;
        }

        // Configurar el manejador de clicks para botones
        ProductCard.setButtonClickHandler(viewRecipe);

        productos.forEach(producto => {
            const productCard = new ProductCard(producto, {
                showPrice: false,
                showCategory: true,
                showIngredients: true,
                showButton: true,
                buttonText: 'Ver Receta',
                buttonClass: 'btn-success',
                buttonIcon: 'bi-journal-text',
                cardClass: 'product-card'
            });
            
            productGrid.innerHTML += productCard.renderColumn();
            
            // Cargar el conteo de ingredientes para este producto
            loadIngredientCount(producto.ID_Producto);
        });
    }

    // Función para cargar el conteo de ingredientes de un producto
    async function loadIngredientCount(productId) {
        try {
            const response = await fetch(`${API.URL}/producto/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`
                }
            });
            
            let count = 0;
            if (response.ok) {
                const recetas = await response.json();
                count = recetas.length;
            }
            
            // Usar el método estático de ProductCard para actualizar el conteo
            ProductCard.updateIngredientCount(productId, count);
        } catch (error) {
            console.error('Error al cargar conteo de ingredientes:', error);
            ProductCard.updateIngredientCount(productId, 0);
        }
    }

    // Función para mostrar la vista de productos
    function showAllProducts() {
        const productsView = document.getElementById('productsView');
        const recipeView = document.getElementById('recipeView');
        const backBtn = document.getElementById('backBtn');
        const recipeTitle = document.getElementById('recipeTitle');
        const currentProduct = document.getElementById('currentProduct');
        
        if (productsView) productsView.style.display = 'block';
        if (recipeView) recipeView.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        if (recipeTitle) {
            recipeTitle.innerHTML = '<i class="bi bi-journal-text me-2"></i>Gestión de Recetas';
        }
        if (currentProduct) {
            currentProduct.textContent = 'Seleccione un producto';
        }
        
        // Limpiar selección actual
        currentProductId = null;
        selectedProductName = '';
        
        // Mostrar grid de productos
        if (productosList.length > 0) {
            displayProductGrid(productosList);
        }
    }

    // Función para mostrar la vista de receta específica
    function viewRecipe(productId, productName) {
        const productsView = document.getElementById('productsView');
        const recipeView = document.getElementById('recipeView');
        const backBtn = document.getElementById('backBtn');
        const recipeTitle = document.getElementById('recipeTitle');
        const currentProduct = document.getElementById('currentProduct');
        
        if (productsView) productsView.style.display = 'none';
        if (recipeView) recipeView.style.display = 'block';
        if (backBtn) backBtn.style.display = 'block';
        if (recipeTitle) {
            recipeTitle.innerHTML = `<i class="bi bi-journal-text me-2"></i>Receta: ${productName}`;
        }
        if (currentProduct) {
            currentProduct.textContent = productName;
        }
        
        // Cargar las recetas del producto seleccionado
        loadRecetas(productId, productName);
    }

    // Función para mostrar/ocultar resultados de búsqueda
    function toggleSearchResults(show) {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = show ? 'block' : 'none';
        }
    }

    // Función para buscar productos
    async function searchProductos(query) {
        if (!checkAuth()) return;

        try {
            // Si no tenemos la lista de productos, la cargamos
            if (productosList.length === 0) {
                await loadAllProductos();
            }

            console.log('Buscando productos con query:', query);
            console.log('Total productos disponibles:', productosList.length);

            // Filtrar productos por nombre
            const filteredProductos = productosList.filter(p => 
                p.Nombre && p.Nombre.toLowerCase().includes(query.toLowerCase())
            );

            console.log('Productos filtrados:', filteredProductos.length);

            // Mostrar resultados en un dropdown
            const searchResults = document.getElementById('searchResults');
            if (!searchResults) {
                console.error('No se encontró el elemento searchResults');
                return;
            }
            
            searchResults.innerHTML = '';

            if (filteredProductos.length > 0) {
                filteredProductos.forEach(producto => {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    div.innerHTML = `<i class="bi bi-cup-hot me-2"></i>${producto.Nombre}`;
                    div.onclick = () => {
                        loadRecetas(producto.ID_Producto, producto.Nombre);
                        toggleSearchResults(false);
                    };
                    searchResults.appendChild(div);
                });
                toggleSearchResults(true);
            } else {
                searchResults.innerHTML = '<div class="search-result-item"><i class="bi bi-exclamation-triangle me-2"></i>No se encontraron productos</div>';
                toggleSearchResults(true);
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            notificationModal.showError('Error al buscar productos: ' + error.message);
        }
    }

    // Función para agregar un nuevo ingrediente
    async function addIngredient(event) {
        event.preventDefault();
        
        if (!currentProductId) {
            notificationModal.showWarning('Por favor, seleccione un producto primero');
            return;
        }

        const insumoId = document.getElementById('ingredientName').value;
        const cantidad = document.getElementById('ingredientQuantity').value;

        if (!insumoId || !cantidad) {
            notificationModal.showWarning('Por favor, complete todos los campos');
            return;
        }

        if (parseFloat(cantidad) <= 0) {
            notificationModal.showWarning('La cantidad debe ser mayor a 0');
            return;
        }

        try {
            // Obtener el insumo seleccionado para obtener su unidad
            const insumoSeleccionado = insumosList.find(i => i.ID_Insumo === parseInt(insumoId));
            if (!insumoSeleccionado) {
                throw new Error('No se encontró el insumo seleccionado');
            }

            console.log('Enviando datos para agregar ingrediente:', {
                ID_Producto: currentProductId,
                ID_Insumo: parseInt(insumoId),
                Cantidad_Necesaria: parseFloat(cantidad),
                Unidad: insumoSeleccionado.Unidad
            });

            const response = await fetch(`${API.URL}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ID_Producto: currentProductId,
                    ID_Insumo: parseInt(insumoId),
                    Cantidad_Necesaria: parseFloat(cantidad),
                    Unidad: insumoSeleccionado.Unidad
                })
            });

            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error detallado:', errorData);
                throw new Error(errorData?.message || 'Error al agregar el ingrediente');
            }

            // Cerrar el modal correctamente
            const modalElement = document.getElementById('addIngredientModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // Si no hay instancia, crear una nueva y ocultarla
                    const newModal = new bootstrap.Modal(modalElement);
                    newModal.hide();
                }
            }
            
            // Limpiar el backdrop manualmente si es necesario
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Remover la clase modal-open del body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            // Limpiar el formulario
            const form = document.getElementById('ingredientForm');
            if (form) {
                form.reset();
            }
            
            // Recargar las recetas
            loadRecetas(currentProductId, selectedProductName);
            
            notificationModal.showSuccess('Ingrediente agregado exitosamente');
        } catch (error) {
            console.error('Error completo:', error);
            notificationModal.showError(error.message || 'Error al agregar el ingrediente');
        }
    }

    // Función para editar un ingrediente
    async function editIngredient(productoId, insumoId, nombre, cantidad, unidad) {
        document.getElementById('editIngredientId').value = insumoId;
        document.getElementById('editProductoId').value = productoId;
        document.getElementById('editIngredientName').value = nombre;
        document.getElementById('editIngredientQuantity').value = cantidad;
        document.getElementById('editIngredientUnit').textContent = unidad;
        
        const editModal = new bootstrap.Modal(document.getElementById('editIngredientModal'));
        editModal.show();
    }

    // Función para eliminar un ingrediente
    async function deleteIngredient(productoId, insumoId) {
        if (!confirm('¿Está seguro de eliminar este ingrediente de la receta?')) {
            return;
        }

        try {
            const response = await fetch(`${API.URL}/${productoId}/${insumoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al eliminar el ingrediente');
            }

            // Si se eliminó desde el modal de editar, cerrar el modal
            const editModal = document.getElementById('editIngredientModal');
            if (editModal && editModal.classList.contains('show')) {
                const modal = bootstrap.Modal.getInstance(editModal);
                if (modal) {
                    modal.hide();
                }
                
                // Limpiar el backdrop manualmente
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                
                // Remover la clase modal-open del body
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }

            // Recargar las recetas después de eliminar
            loadRecetas(productoId, selectedProductName);
            notificationModal.showSuccess('Ingrediente eliminado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            notificationModal.showError(error.message || 'Error al eliminar el ingrediente');
        }
    }

    // Función para guardar cambios en un ingrediente
    async function saveIngredientChanges(event) {
        event.preventDefault();
        
        const productoId = document.getElementById('editProductoId').value;
        const insumoId = document.getElementById('editIngredientId').value;
        const cantidad = document.getElementById('editIngredientQuantity').value;
        const unidad = document.getElementById('editIngredientUnit').textContent;

        if (parseFloat(cantidad) <= 0) {
            notificationModal.showWarning('La cantidad debe ser mayor a 0');
            return;
        }

        try {
            const response = await fetch(`${API.URL}/${productoId}/${insumoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    Cantidad_Necesaria: parseFloat(cantidad),
                    Unidad: unidad
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al actualizar el ingrediente');
            }

            // Cerrar el modal correctamente
            const modalElement = document.getElementById('editIngredientModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // Si no hay instancia, crear una nueva y ocultarla
                    const newModal = new bootstrap.Modal(modalElement);
                    newModal.hide();
                }
            }
            
            // Limpiar el backdrop manualmente si es necesario
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Remover la clase modal-open del body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            loadRecetas(productoId, selectedProductName);
            notificationModal.showSuccess('Ingrediente actualizado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            notificationModal.showError(error.message || 'Error al actualizar el ingrediente');
        }
    }

    // Función para abrir el modal de agregar ingrediente
    function openAddIngredientModal() {
        if (!currentProductId) {
            notificationModal.showWarning('Por favor, seleccione un producto primero');
            return;
        }
        
        // Asegurarse de que tenemos la lista de insumos
        if (insumosList.length === 0) {
            loadInsumos();
        }
        
        const addModal = new bootstrap.Modal(document.getElementById('addIngredientModal'));
        addModal.show();
    }

    // Inicializar eventos cuando se carga la página
    function initRecetas() {
        console.log('Inicializando módulo de recetas...');
        
        // Configurar formato de inputs
        setupQuantityInputFormat();
        
        // Configurar botones de incremento/decremento
        setupIncrementDecrementButtons();
        
        // Búsqueda de productos
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.trim();
                if (searchTerm.length < selectedProductName.length) {
                    selectedProductName = '';
                    updateSearchInputStyle(true);
                    toggleSearchResults(false);
                    return;
                }
                if (searchTerm.length > 2) {
                    updateSearchInputStyle(true);
                    searchProductos(searchTerm);
                } else {
                    toggleSearchResults(false);
                    if (!searchTerm && selectedProductName) {
                        updateSearchInputStyle();
                    }
                }
            });
        } else {
            console.warn('Elemento productSearch no encontrado');
        }

        // Cerrar resultados de búsqueda al hacer clic fuera
        document.addEventListener('click', function(event) {
            const searchContainer = document.querySelector('.search-container');
            const searchResults = document.getElementById('searchResults');
            if (searchContainer && searchInput && !searchContainer.contains(event.target)) {
                toggleSearchResults(false);
                if (!searchInput.value.trim() && selectedProductName) {
                    updateSearchInputStyle();
                }
            }
        });

        // Configurar formularios
        const editForm = document.getElementById('editIngredientForm');
        if (editForm) {
            editForm.addEventListener('submit', saveIngredientChanges);
        }
        
        const ingredientForm = document.getElementById('ingredientForm');
        if (ingredientForm) {
            ingredientForm.addEventListener('submit', addIngredient);
        }

        const deleteBtn = document.getElementById('deleteIngredientBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const productoId = document.getElementById('editProductoId').value;
                const insumoId = document.getElementById('editIngredientId').value;
                deleteIngredient(productoId, insumoId);
            });
        }

        const addBtn = document.getElementById('addIngredientBtn');
        if (addBtn) {
            addBtn.addEventListener('click', openAddIngredientModal);
        }

        // Configurar eventos para actualizar unidades
        const ingredientSelect = document.getElementById('ingredientName');
        if (ingredientSelect) {
            ingredientSelect.addEventListener('change', function() {
                updateUnitForIngredient(this.value, 'ingredientUnit');
            });
        }

        // Cargar datos iniciales
        loadAllProductos().then(() => {
            console.log('Productos cargados correctamente');
            // Mostrar la vista de productos por defecto
            showAllProducts();
        }).catch(error => {
            console.error('Error al cargar productos:', error);
        });
        
        loadInsumos().then(() => {
            console.log('Insumos cargados correctamente');
        }).catch(error => {
            console.error('Error al cargar insumos:', error);
        });
    }

    // Exportar función de inicialización
    window.initRecetas = initRecetas;
    console.log('recetas.js: window.initRecetas asignado');

    // Exportar funciones necesarias para el HTML
    window.openAddIngredientModal = openAddIngredientModal;
    window.editIngredient = editIngredient;
    window.deleteIngredient = deleteIngredient;
    window.saveIngredientChanges = saveIngredientChanges;
    window.showAllProducts = showAllProducts;
    window.viewRecipe = viewRecipe;

})(); // Fin de la IIFE 