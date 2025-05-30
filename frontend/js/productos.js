// Módulo de Productos
const ProductosModule = {
    // Configuración de la API
    API_URL: 'http://localhost:3000/api/productos',
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),

    init: function() {
        console.log('=== Inicializando módulo de Productos ===');
        console.log('API_URL:', this.API_URL);
        console.log('Token:', this.token ? 'Presente' : 'Ausente');
        console.log('User ID:', this.userId ? 'Presente' : 'Ausente');
        
        if (this.checkAuth()) {
            console.log('Autenticación exitosa, cargando datos...');
            this.cargarProductos();
            this.cargarCategorias();
            this.initializeEventListeners();
        } else {
            console.log('Autenticación fallida');
        }
    },

    checkAuth() {
        console.log('=== Verificando autenticación ===');
        const token = this.getToken();
        console.log('Token encontrado:', token ? 'Sí' : 'No');
        
        if (!token) {
            console.log('No hay token, redirigiendo a login...');
            alert('Por favor, inicie sesión para acceder a esta página');
            window.location.href = 'Inicio Sesion.html';
            return false;
        }
        console.log('Autenticación verificada');
        return true;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    async apiRequest(endpoint, options = {}) {
        console.log('=== Realizando petición API ===');
        console.log('Endpoint:', endpoint);
        console.log('Opciones:', options);

        if (!this.checkAuth()) {
            console.log('Autenticación fallida, abortando petición');
            return Promise.reject('No hay token');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            }
        };

        try {
            console.log('URL completa:', `${this.API_URL}${endpoint}`);
            console.log('Headers:', { ...defaultOptions.headers, ...options.headers });
            
            const response = await fetch(`${this.API_URL}${endpoint}`, { ...defaultOptions, ...options });
            console.log('Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            if (response.status === 401 || response.status === 403) {
                console.log('Error de autenticación, limpiando sesión');
                localStorage.clear();
                alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
                window.location.href = 'Inicio Sesion.html';
                throw new Error('Sesión expirada');
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);
            return data;
        } catch (error) {
            console.error('Error en la petición:', error);
            throw error;
        }
    },

    initializeEventListeners() {
        // Evento para agregar producto
        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarProducto();
        });

        // Evento para editar producto
        document.getElementById('editProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.actualizarProducto();
        });

        // Evento para eliminar producto
        document.getElementById('deleteProductBtn').addEventListener('click', () => {
            if(confirm('¿Está seguro que desea eliminar este producto?')) {
                this.eliminarProducto();
            }
        });

        // Evento para agregar categoría
        document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarCategoria();
        });

        // Evento para cargar datos al modal de edición
        document.getElementById('editProductModal').addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const productId = button.getAttribute('data-product-id');
            this.cargarDatosProducto(productId);
        });

        // Evento para búsqueda
        document.getElementById('productSearch').addEventListener('input', (e) => {
            this.filtrarProductos(e.target.value);
        });
    },

    async cargarProductos() {
        console.log('=== Cargando productos ===');
        try {
            const productos = await this.apiRequest('');
            console.log('Productos recibidos:', productos);
            
            const tbody = document.getElementById('productsTableBody');
            console.log('Elemento tbody encontrado:', tbody ? 'Sí' : 'No');
            
            tbody.innerHTML = '';

            if (productos.length === 0) {
                console.log('No hay productos para mostrar');
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay productos registrados.</td></tr>';
                return;
            }

            console.log(`Renderizando ${productos.length} productos`);
            productos.forEach((producto, index) => {
                console.log(`Renderizando producto ${index + 1}:`, producto);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${producto.ID_Producto}.</td>
                    <td>${producto.Producto}</td>
                    <td>${producto.Categoria}</td>
                    <td>${producto.Precio_Venta}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-product-btn" 
                                data-bs-toggle="modal" 
                                data-bs-target="#editProductModal" 
                                data-product-id="${producto.ID_Producto}">
                            Editar
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            console.log('Tabla de productos actualizada');
        } catch (error) {
            console.error('Error al cargar productos:', error);
            alert('Error al cargar los productos');
        }
    },

    async cargarCategorias() {
        console.log('=== Cargando categorías ===');
        try {
            const categorias = await this.apiRequest('/categorias');
            console.log('Categorías recibidas:', categorias);
            
            // Llenar select de categorías en formulario de agregar
            const addSelect = document.getElementById('addProductCategory');
            console.log('Select de agregar encontrado:', addSelect ? 'Sí' : 'No');
            addSelect.innerHTML = '<option value="">Seleccione una categoría</option>';
            
            // Llenar select de categorías en formulario de editar
            const editSelect = document.getElementById('editProductCategory');
            console.log('Select de editar encontrado:', editSelect ? 'Sí' : 'No');
            editSelect.innerHTML = '<option value="">Seleccione una categoría</option>';

            console.log(`Agregando ${categorias.length} categorías a los selects`);
            categorias.forEach(categoria => {
                console.log('Agregando categoría:', categoria);
                const option = document.createElement('option');
                option.value = categoria.ID_Categoria;
                option.textContent = categoria.Nombre;
                addSelect.appendChild(option.cloneNode(true));
                editSelect.appendChild(option);
            });

            // Actualizar tabla de categorías
            const tbody = document.getElementById('categoriesTableBody');
            console.log('Elemento tbody de categorías encontrado:', tbody ? 'Sí' : 'No');
            tbody.innerHTML = '';

            console.log(`Renderizando ${categorias.length} categorías en la tabla`);
            categorias.forEach(categoria => {
                console.log('Renderizando categoría:', categoria);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${categoria.ID_Categoria}.</td>
                    <td>${categoria.Nombre}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-category-btn">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-category-btn">&times;</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            console.log('Tabla de categorías actualizada');
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            alert('Error al cargar las categorías');
        }
    },

    async agregarProducto() {
        try {
            const nombre = document.getElementById('addProductName').value;
            const categoria = document.getElementById('addProductCategory').value;
            const precio = document.getElementById('addProductPrice').value;

            await this.apiRequest('', {
                method: 'POST',
                body: JSON.stringify({
                    Nombre: nombre,
                    ID_Categoria: categoria,
                    Precio_Venta: precio
                })
            });

            // Cerrar modal y recargar productos
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            this.cargarProductos();
            
            // Limpiar formulario
            document.getElementById('addProductForm').reset();
        } catch (error) {
            console.error('Error al agregar producto:', error);
            alert(error.message || 'Error al agregar el producto');
        }
    },

    async cargarDatosProducto(id) {
        try {
            const productos = await this.apiRequest('');
            const producto = productos.find(p => p.ID_Producto === parseInt(id));
            
            if (producto) {
                document.getElementById('editProductId').value = producto.ID_Producto;
                document.getElementById('editProductName').value = producto.Producto;
                document.getElementById('editProductCategory').value = producto.ID_Categoria;
                document.getElementById('editProductPrice').value = producto.Precio_Venta;
            }
        } catch (error) {
            console.error('Error al cargar datos del producto:', error);
            alert('Error al cargar los datos del producto');
        }
    },

    async actualizarProducto() {
        try {
            const id = document.getElementById('editProductId').value;
            const nombre = document.getElementById('editProductName').value;
            const categoria = document.getElementById('editProductCategory').value;
            const precio = document.getElementById('editProductPrice').value;

            await this.apiRequest(`/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    Nombre: nombre,
                    ID_Categoria: categoria,
                    Precio_Venta: precio
                })
            });

            // Cerrar modal y recargar productos
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            this.cargarProductos();
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            alert(error.message || 'Error al actualizar el producto');
        }
    },

    async eliminarProducto() {
        try {
            const id = document.getElementById('editProductId').value;
            await this.apiRequest(`/${id}`, { method: 'DELETE' });
            
            // Cerrar modal y recargar productos
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            this.cargarProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert(error.message || 'Error al eliminar el producto');
        }
    },

    async agregarCategoria() {
        try {
            const nombre = document.getElementById('newCategoryName').value;

            await this.apiRequest('/categorias', {
                method: 'POST',
                body: JSON.stringify({ Nombre: nombre })
            });

            // Limpiar campo y recargar categorías
            document.getElementById('newCategoryName').value = '';
            this.cargarCategorias();
        } catch (error) {
            console.error('Error al agregar categoría:', error);
            alert(error.message || 'Error al agregar la categoría');
        }
    },

    filtrarProductos(busqueda) {
        const tbody = document.getElementById('productsTableBody');
        const filas = tbody.getElementsByTagName('tr');

        for (let fila of filas) {
            const texto = fila.textContent.toLowerCase();
            const mostrar = texto.includes(busqueda.toLowerCase());
            fila.style.display = mostrar ? '' : 'none';
        }
    }
};

// Exportar la función de inicialización
window.initProductos = function() {
    ProductosModule.init();
}; 