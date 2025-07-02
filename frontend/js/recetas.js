(function() {
    // Configuración de la API
    var API = {
        URL: '/api/recetas',
        PRODUCTOS_URL: '/api/productos',
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
            // Obtener todos los productos, no solo los que tienen recetas
            const response = await fetch(`${API.PRODUCTOS_URL}`, {
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }

            const data = await response.json();
            
            // Debug: mostrar la respuesta completa con todos los detalles
            console.log('Respuesta API productos (detallada):', JSON.stringify(data, null, 2));
            
            // Asegurarnos de que productosList sea un array
            productosList = Array.isArray(data) ? data : [];
            
            // Debug: mostrar información de los productos cargados con todos los detalles
            console.log('Productos cargados (detallado):', JSON.stringify(productosList, null, 2));
            
            return productosList;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            alert('Error al cargar los productos');
            return [];
        }
    }

    // Función para cargar las recetas de un producto
    async function loadRecetas(productId, productName) {
        if (!checkAuth()) return;
        currentProductId = productId;
        selectedProductName = productName;
        updateSearchInputStyle();

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
                throw new Error('Error al cargar las recetas');
            }

            const recetas = await response.json();
            displayRecetas(recetas);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar las recetas');
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
            
            // Debug: mostrar los insumos cargados
            console.log('Insumos cargados:', insumosList);
            
            // Actualizar el select de insumos
            const select = document.getElementById('ingredientName');
            select.innerHTML = '<option value="">Seleccione un insumo</option>';
            
            insumosList.forEach(insumo => {
                const option = document.createElement('option');
                option.value = insumo.ID_Insumo;
                option.textContent = `${insumo.Nombre} (${insumo.Unidad})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar insumos:', error);
            alert('Error al cargar los insumos disponibles');
        }
    }

    // Función para mostrar las recetas en la tabla
    function displayRecetas(recetas) {
        const tbody = document.getElementById('recipeTableBody');
        tbody.innerHTML = '';

        if (recetas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <div class="alert alert-info mb-0">
                            Este producto no tiene recetas registradas.
                            <button class="btn btn-primary btn-sm ms-3" onclick="openAddIngredientModal()">
                                Agregar primera receta
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
                        Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="deleteIngredient(${receta.ID_Producto}, ${receta.ID_Insumo})">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Función para mostrar/ocultar resultados de búsqueda
    function toggleSearchResults(show) {
        const searchResults = document.getElementById('searchResults');
        if (show) {
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
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

            // Debug: mostrar la lista completa antes de filtrar con todos los detalles
            console.log('Lista completa de productos (detallada):', JSON.stringify(productosList, null, 2));

            // Filtrar productos por nombre (usando el campo Producto en lugar de Nombre)
            const filteredProductos = productosList.filter(p => 
                p.Producto && p.Producto.toLowerCase().includes(query.toLowerCase())
            );

            // Mostrar resultados en un dropdown
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = '';

            if (filteredProductos.length > 0) {
                filteredProductos.forEach(producto => {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    div.textContent = producto.Producto; // Usar Producto en lugar de Nombre
                    div.onclick = () => {
                        loadRecetas(producto.ID_Producto, producto.Producto); // Usar Producto en lugar de Nombre
                        toggleSearchResults(false);
                    };
                    searchResults.appendChild(div);
                });
                toggleSearchResults(true);
            } else {
                searchResults.innerHTML = '<div class="search-result-item">No se encontraron productos</div>';
                toggleSearchResults(true);
            }

            // Debug: mostrar información de la búsqueda con todos los detalles
            console.log('Búsqueda (detallada):', {
                query,
                totalProductos: productosList.length,
                productosFiltrados: filteredProductos.length,
                productos: JSON.stringify(filteredProductos, null, 2)
            });
        } catch (error) {
            console.error('Error en búsqueda:', error);
            alert('Error al buscar productos');
        }
    }

    // Función para agregar un nuevo ingrediente
    async function addIngredient(event) {
        event.preventDefault();
        
        if (!currentProductId) {
            alert('Por favor, seleccione un producto primero');
            return;
        }

        const insumoId = document.getElementById('ingredientName').value;
        const cantidad = document.getElementById('ingredientQuantity').value;

        if (!insumoId || !cantidad) {
            alert('Por favor, complete todos los campos');
            return;
        }

        try {
            // Obtener el insumo seleccionado para obtener su unidad
            const insumoSeleccionado = insumosList.find(i => i.ID_Insumo === parseInt(insumoId));
            if (!insumoSeleccionado) {
                throw new Error('No se encontró el insumo seleccionado');
            }

            // Debug: mostrar los datos que se enviarán
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

            // Debug: mostrar la respuesta del servidor
            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error detallado:', errorData);
                throw new Error(errorData?.message || 'Error al agregar el ingrediente');
            }

            // Cerrar el modal y recargar las recetas
            const addModal = bootstrap.Modal.getInstance(document.getElementById('addIngredientModal'));
            addModal.hide();
            
            // Limpiar el formulario
            document.getElementById('ingredientForm').reset();
            
            // Recargar las recetas
            loadRecetas(currentProductId, selectedProductName);
            
            alert('Ingrediente agregado exitosamente');
        } catch (error) {
            console.error('Error completo:', error);
            alert(error.message || 'Error al agregar el ingrediente');
        }
    }

    // Función para editar un ingrediente
    async function editIngredient(productoId, insumoId, nombre, cantidad, unidad) {
        document.getElementById('editIngredientId').value = insumoId;
        document.getElementById('editProductoId').value = productoId;
        document.getElementById('editIngredientName').value = nombre;
        document.getElementById('editIngredientQuantity').value = cantidad;
        
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

            // Recargar las recetas después de eliminar
            loadRecetas(productoId, selectedProductName);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al eliminar el ingrediente');
        }
    }

    // Función para guardar cambios en un ingrediente
    async function saveIngredientChanges(event) {
        event.preventDefault();
        
        const productoId = document.getElementById('editProductoId').value;
        const insumoId = document.getElementById('editIngredientId').value;
        const cantidad = document.getElementById('editIngredientQuantity').value;

        try {
            const response = await fetch(`${API.URL}/${productoId}/${insumoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${API.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    Cantidad_Necesaria: parseFloat(cantidad)
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al actualizar el ingrediente');
            }

            // Cerrar el modal y recargar las recetas
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editIngredientModal'));
            editModal.hide();
            loadRecetas(productoId, selectedProductName);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al actualizar el ingrediente');
        }
    }

    // Función para abrir el modal de agregar ingrediente
    function openAddIngredientModal() {
        if (!currentProductId) {
            alert('Por favor, seleccione un producto primero');
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
        console.log('initRecetas ejecutándose...');
        // Búsqueda de productos
        const searchInput = document.getElementById('productSearch');
        if (searchInput) { // Verificar que el elemento exista
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
            console.warn('Elemento productSearch no encontrado en initRecetas');
        }

        // Cerrar resultados de búsqueda al hacer clic fuera
        document.addEventListener('click', function(event) {
            const searchContainer = document.querySelector('.search-container');
            const searchResults = document.getElementById('searchResults');
            // Asegurarse que searchContainer y searchInput existen antes de usarlos
            if (searchContainer && searchInput && !searchContainer.contains(event.target)) {
                toggleSearchResults(false);
                if (!searchInput.value.trim() && selectedProductName) {
                    updateSearchInputStyle();
                }
            }
        });

        const editForm = document.getElementById('editIngredientForm');
        if (editForm) editForm.addEventListener('submit', saveIngredientChanges);
        
        const ingredientForm = document.getElementById('ingredientForm');
        if (ingredientForm) ingredientForm.addEventListener('submit', addIngredient);

        const deleteBtn = document.getElementById('deleteIngredientBtn');
        if (deleteBtn) deleteBtn.addEventListener('click', function() {
            const productoId = document.getElementById('editProductoId').value;
            const insumoId = document.getElementById('editIngredientId').value;
            deleteIngredient(productoId, insumoId);
        });

        const addBtn = document.getElementById('addIngredientBtn');
        if (addBtn) addBtn.addEventListener('click', openAddIngredientModal);

        loadAllProductos();
        loadInsumos().then(() => {
            console.log('Insumos cargados correctamente desde initRecetas');
        }).catch(error => {
            console.error('Error al cargar insumos desde initRecetas:', error);
        });
    }

    // Exportar función de inicialización
    window.initRecetas = initRecetas;
    console.log('recetas.js: window.initRecetas ASIGNADO.', typeof window.initRecetas);

    // Exportar funciones necesarias para el HTML (si son llamadas directamente desde onclick en HTML)
    window.openAddIngredientModal = openAddIngredientModal;
    window.addIngredient = addIngredient; // Considerar si esto es realmente necesario globalmente o solo para el form submit
    window.editIngredient = editIngredient;
    window.deleteIngredient = deleteIngredient;
    window.saveIngredientChanges = saveIngredientChanges; // Considerar si esto es realmente necesario globalmente

})(); // Fin de la IIFE 