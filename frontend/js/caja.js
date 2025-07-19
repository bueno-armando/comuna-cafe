(function() {
    // Variables globales para esta vista (dentro de la IIFE)
    let cart = [];
    let products = [];
    let filteredProducts = []; // Para almacenar productos filtrados por búsqueda
    let paymentModalInstance = null; // Para la instancia del modal de Bootstrap

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

    // Simular carga de productos y configuración inicial
    async function initCaja() {
        console.log('initCaja ejecutándose...');
        cart = []; // Reiniciar carrito
        products = []; // Reiniciar productos

        // Asegurarse de que el modal se inicialice solo una vez o se obtenga la instancia si ya existe
        const paymentModalElement = document.getElementById('paymentModal');
        if (paymentModalElement) {
            paymentModalInstance = bootstrap.Modal.getInstance(paymentModalElement) || new bootstrap.Modal(paymentModalElement);
        } else {
            console.error('Elemento paymentModal no encontrado');
            return; // Salir si el modal no existe, ya que es crucial
        }
        
        try {
            console.log('Intentando cargar productos para Caja...');
            const response = await fetch('/api/caja/productos'); // URL relativa
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            console.log('Productos cargados para Caja:', products);
            
            // Inicializar productos filtrados con todos los productos
            filteredProducts = [...products];
            
            renderProducts();
            setupEventListeners(); // Configurar listeners después de cargar y renderizar productos
        } catch (error) {
            console.error('Error loading products for Caja:', error);
            const productListElement = document.getElementById('productList');
            if (productListElement) {
                productListElement.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar los productos</div>';
            }
        }
    }

    function renderProducts() {
        const productListElement = document.getElementById('productList');
        if (!productListElement) {
            console.error('Elemento productList no encontrado para renderizar productos');
            return;
        }
        productListElement.innerHTML = ''; // Limpiar lista

        if (!filteredProducts || filteredProducts.length === 0) {
            productListElement.innerHTML = '<div class="col-12 text-center">No hay productos disponibles</div>';
            return;
        }

        filteredProducts.forEach(product => {
            const precio = parseFloat(product.Precio_Venta) || 0;
            const productCard = `
                <div class="col">
                    <div class="card product-card h-100" data-product-id="${product.ID_Producto}">
                        <div class="card-body">
                            <h5 class="card-title">${product.Nombre}</h5>
                            <p class="card-text text-success">$${precio.toFixed(2)}</p>
                            <small class="text-muted">${product.categoria_nombre || 'Sin categoría'}</small>
                        </div>
                    </div>
                </div>
            `;
            productListElement.innerHTML += productCard;
        });
    }

    // Función para filtrar productos por búsqueda
    function filterProducts(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            filteredProducts = [...products];
        } else {
            const term = searchTerm.toLowerCase().trim();
            filteredProducts = products.filter(product => 
                product.Nombre.toLowerCase().includes(term) ||
                (product.categoria_nombre && product.categoria_nombre.toLowerCase().includes(term))
            );
        }
        renderProducts();
    }

    // Función para configurar todos los event listeners
    // Es importante que esta función se llame DESPUÉS de que el HTML de la vista de Caja esté en el DOM
    // y que se maneje la posible re-asignación de listeners si la vista se carga múltiples veces.
    function setupEventListeners() {
        // Remover listeners anteriores para evitar duplicados (más robusto con IIFE)
        // Para simplificar, nos apoyaremos en que la IIFE crea un nuevo scope,
        // pero para listeners en `document`, es más complejo.
        // Aquí, los listeners se asignan a elementos que se espera estén DENTRO de la vista de caja.

        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Event listener para la búsqueda de productos
        const productSearchInput = document.getElementById('productSearch');
        if (productSearchInput) {
            productSearchInput.addEventListener('input', function() {
                filterProducts(this.value);
            });
        } else {
            console.warn('Elemento productSearch no encontrado para configurar búsqueda');
        }

        // Delegación de eventos para elementos dinámicos dentro de #main-content
        mainContent.onclick = function(e) {
            // Agregar producto al carrito
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = parseInt(productCard.dataset.productId);
                const product = products.find(p => p.ID_Producto === productId);
                if (product) addToCart(product);
                return; // Evento manejado
            }
            
            // Eliminar producto del carrito
            if (e.target.classList.contains('remove-item')) {
                const row = e.target.closest('tr');
                if (row && row.parentNode) {
                    const index = Array.from(row.parentNode.children).indexOf(row);
                    removeFromCart(index);
                }
                return; // Evento manejado
            }
            
            // Actualizar cantidad
            const quantityBtn = e.target.closest('.quantity-btn');
            if (quantityBtn) {
                const input = quantityBtn.closest('.input-group').querySelector('input');
                const row = quantityBtn.closest('tr');
                if (input && row && row.parentNode) {
                    const index = Array.from(row.parentNode.children).indexOf(row);
                    if (quantityBtn.classList.contains('minus-btn')) {
                        input.value = Math.max(1, parseInt(input.value) - 1);
                    } else {
                        input.value = parseInt(input.value) + 1;
                    }
                    updateCartItem(index, parseInt(input.value));
                }
                return; // Evento manejado
            }
        };
        
        const processPaymentButton = document.getElementById('processPayment');
        if (processPaymentButton) {
            processPaymentButton.addEventListener('click', function() {
                const total = calculateTotal();
                const modalTotalAmount = document.getElementById('modalTotalAmount');
                if(modalTotalAmount) modalTotalAmount.textContent = `$${total.toFixed(2)}`;
                
                const paymentMethodChecked = document.querySelector('input[name="paymentMethod"]:checked');
                const cashPaymentSection = document.getElementById('cashPaymentSection');
                if (paymentMethodChecked && cashPaymentSection) {
                    cashPaymentSection.style.display = paymentMethodChecked.value === 'Efectivo' ? 'block' : 'none';
                }
            });
        }
        
        const cashReceivedInput = document.getElementById('cashReceived');
        if (cashReceivedInput) {
            cashReceivedInput.addEventListener('input', function() {
                const total = calculateTotal();
                const received = parseFloat(this.value) || 0;
                const change = received - total;
                const cashChangeElement = document.getElementById('cashChange');
                if (cashChangeElement) {
                    cashChangeElement.textContent = change >= 0 
                        ? `Cambio: $${change.toFixed(2)}` 
                        : 'Faltante: $' + Math.abs(change).toFixed(2);
                }
            });
        }
        
        const confirmPaymentButton = document.getElementById('confirmPayment');
        if (confirmPaymentButton) {
            confirmPaymentButton.addEventListener('click', async function() {
                try {
                    const paymentMethodChecked = document.querySelector('input[name="paymentMethod"]:checked');
                    if (!paymentMethodChecked) {
                        mostrarNotificacion('Error', 'Por favor, seleccione un método de pago.', 'error');
                        return;
                    }
                    const saleData = {
                        ID_Usuario: localStorage.getItem('userId') || 1, // Tomar de localStorage o default
                        Total: calculateTotal(),
                        Metodo_Pago: paymentMethodChecked.value,
                        detalles: cart.map(item => ({
                            ID_Producto: item.ID_Producto,
                            Cantidad: item.quantity,
                            Subtotal: parseFloat(item.Precio_Venta) * item.quantity
                        }))
                    };

                    const response = await fetch('/api/caja/venta', { // URL Relativa
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` // Añadir token
                        },
                        body: JSON.stringify(saleData)
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        cart = [];
                        updateCartDisplay();
                        if (paymentModalInstance) paymentModalInstance.hide();
                        
                        // Mostrar notificación de éxito
                        mostrarNotificacion('Éxito', 'Venta registrada correctamente', 'success');
                    } else {
                        mostrarNotificacion('Error', result.error || 'Error desconocido', 'error');
                    }
                } catch (error) {
                    console.error('Error en confirmPayment:', error);
                    mostrarNotificacion('Error', 'Error al procesar la venta. Verifique la consola.', 'error');
                }
            });
        }
    }
    
    // ... (Funciones auxiliares: addToCart, removeFromCart, updateCartItem, calculateTotal, updateCartDisplay)
    // Estas funciones deben estar definidas aquí dentro de la IIFE
    function addToCart(product) {
        const existingItem = cart.find(item => item.ID_Producto === product.ID_Producto);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartDisplay();
    }
    
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    }
    
    function updateCartItem(index, quantity) {
        if (cart[index]) {
            cart[index].quantity = quantity;
            updateCartDisplay();
        }
    }
    
    function calculateTotal() {
        return cart.reduce((total, item) => total + (parseFloat(item.Precio_Venta) * item.quantity), 0);
    }
    
    function updateCartDisplay() {
        const tbody = document.getElementById('saleItems');
        const totalElement = document.getElementById('totalAmount');
        if (!tbody || !totalElement) {
            console.warn('Elementos del carrito no encontrados para actualizar display');
            return;
        }
        const total = calculateTotal();
        tbody.innerHTML = '';
        cart.forEach((item, index) => {
            const precio = parseFloat(item.Precio_Venta) || 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.Nombre}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 100px;">
                        <button class="btn btn-outline-secondary quantity-btn minus-btn" type="button">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1">
                        <button class="btn btn-outline-secondary quantity-btn plus-btn" type="button">+</button>
                    </div>
                </td>
                <td>$${precio.toFixed(2)}</td>
                <td>$${(precio * item.quantity).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger remove-item">Eliminar</button></td>
            `;
            tbody.appendChild(row);
        });
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Exportar la función de inicialización
    window.initCaja = initCaja; // Cambiado de initCajaSimulacion a initCaja
    console.log('caja.js: window.initCaja ASIGNADO.', typeof window.initCaja);

})(); // Fin de la IIFE 