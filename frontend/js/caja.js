// Función que se llamará al cargar la vista Caja
async function initCajaSimulacion() {
    console.log('initCajaSimulacion ejecutándose...');
    // Variables globales para esta vista
    let cart = [];
    let products = []; // Mover products al ámbito global de la función
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    
    // Simular carga de productos
    try {
        console.log('Intentando cargar productos...');
        const response = await fetch('/api/caja/productos');
        console.log('Respuesta recibida:', response);
        products = await response.json(); // Asignar a la variable global
        console.log('Productos cargados:', products);
        
        // Mostrar productos disponibles
        const productList = document.getElementById('productList');
        if (!products || products.length === 0) {
            productList.innerHTML = '<div class="col-12 text-center">No hay productos disponibles</div>';
            return;
        }

        products.forEach(product => {
            console.log('Procesando producto:', product);
            // Asegurarnos de que Precio_Venta sea un número
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
            productList.innerHTML += productCard;
        });

        // Configurar eventos después de cargar los productos
        setupEventListeners();
    } catch (error) {
        console.error('Error loading products:', error);
        const productList = document.getElementById('productList');
        productList.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar los productos</div>';
    }

    // Función para configurar todos los event listeners
    function setupEventListeners() {
        // Eventos de productos
        document.addEventListener('click', function(e) {
            // Agregar producto al carrito
            if (e.target.closest('.product-card')) {
                const productCard = e.target.closest('.product-card');
                const productId = parseInt(productCard.dataset.productId);
                const product = products.find(p => p.ID_Producto === productId);
                
                if (product) {
                    addToCart(product);
                }
            }
            
            // Eliminar producto del carrito
            if (e.target.classList.contains('remove-item')) {
                const row = e.target.closest('tr');
                const index = Array.from(row.parentNode.children).indexOf(row);
                removeFromCart(index);
            }
            
            // Actualizar cantidad
            if (e.target.classList.contains('quantity-btn')) {
                const input = e.target.closest('.input-group').querySelector('input');
                const row = e.target.closest('tr');
                const index = Array.from(row.parentNode.children).indexOf(row);
                
                if (e.target.classList.contains('minus-btn')) {
                    input.value = Math.max(1, parseInt(input.value) - 1);
                } else {
                    input.value = parseInt(input.value) + 1;
                }
                
                updateCartItem(index, parseInt(input.value));
            }
        });
        
        // Evento para procesar pago
        document.getElementById('processPayment').addEventListener('click', function() {
            const total = calculateTotal();
            document.getElementById('modalTotalAmount').textContent = `$${total.toFixed(2)}`;
            
            // Mostrar/ocultar sección de efectivo según método de pago
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            document.getElementById('cashPaymentSection').style.display = paymentMethod === 'Efectivo' ? 'block' : 'none';
        });
        
        // Calcular cambio cuando se ingresa efectivo
        document.getElementById('cashReceived').addEventListener('input', function() {
            const total = calculateTotal();
            const received = parseFloat(this.value) || 0;
            const change = received - total;
            
            document.getElementById('cashChange').textContent = change >= 0 
                ? `Cambio: $${change.toFixed(2)}` 
                : 'Faltante: $' + Math.abs(change).toFixed(2);
        });
        
        // Confirmar pago
        document.getElementById('confirmPayment').addEventListener('click', async function() {
            try {
                const saleData = {
                    ID_Usuario: 1, // Esto debería venir del login
                    Total: calculateTotal(),
                    Metodo_Pago: document.querySelector('input[name="paymentMethod"]:checked').value,
                    detalles: cart.map(item => ({
                        ID_Producto: item.ID_Producto,
                        Cantidad: item.quantity,
                        Subtotal: parseFloat(item.Precio_Venta) * item.quantity
                    }))
                };

                const response = await fetch('/api/caja/venta', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(saleData)
                });

                const result = await response.json();
                
                if (result.success) {
                    alert('Venta registrada correctamente');
                    cart = [];
                    updateCartDisplay();
                    paymentModal.hide();
                } else {
                    alert('Error al procesar la venta: ' + result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al procesar la venta');
            }
        });
    }
    
    // Funciones auxiliares
    function addToCart(product) {
        const existingItem = cart.find(item => item.ID_Producto === product.ID_Producto);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
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
        const total = calculateTotal();
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        // Llenar con items del carrito
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
        
        // Actualizar total
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
} 