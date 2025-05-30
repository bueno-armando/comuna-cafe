// Namespace para el módulo de ventas
const VentasModule = {
    // Configuración de la API
    API_URL: 'http://localhost:3000/api',

    // Funciones de utilidad
    getToken() {
        return localStorage.getItem('token');
    },

    checkAuth() {
        const token = this.getToken();
        if (!token) {
            alert('Por favor, inicie sesión para acceder a esta página');
            window.location.href = 'Inicio Sesion.html';
            return false;
        }
        return true;
    },

    apiRequest(endpoint, options = {}) {
        if (!this.checkAuth()) {
            return Promise.reject('No hay token');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            }
        };

        return fetch(`${this.API_URL}${endpoint}`, { ...defaultOptions, ...options })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    localStorage.clear();
                    alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
                    window.location.href = 'Inicio Sesion.html';
                    throw new Error('Sesión expirada');
                }
                return response.json();
            });
    },

    // Funciones para manejar ventas
    async cargarVentas() {
        try {
            const ventas = await this.apiRequest('/ventas');
            const tbody = document.getElementById('ventasTableBody');
            tbody.innerHTML = '';

            if (ventas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay ventas registradas.</td></tr>';
                return;
            }

            ventas.forEach(venta => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${venta.ID_Venta}</td>
                    <td>${new Date(venta.Fecha).toLocaleDateString()}</td>
                    <td>$${parseFloat(venta.Total).toFixed(2)}</td>
                    <td>${venta.Metodo_Pago}</td>
                    <td>${venta.Nombre_Usuario}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-success ver-detalle-btn" 
                                data-bs-toggle="modal" 
                                data-bs-target="#detalleVentaModal" 
                                data-venta-id="${venta.ID_Venta}">
                            Ver detalles
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            alert('Error al cargar ventas');
        }
    },

    async cargarVentasPorFecha() {
        try {
            const fechaInicio = document.getElementById('fechaInicio').value;
            const fechaFin = document.getElementById('fechaFin').value;

            // Si no hay fechas seleccionadas, cargar todas las ventas
            if (!fechaInicio && !fechaFin) {
                return this.cargarVentas();
            }

            // Validar que la fecha de inicio no sea posterior a la de fin
            if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
                alert('La fecha de inicio no puede ser posterior a la fecha final');
                return;
            }

            // Construir la URL con los parámetros de fecha
            // Si falta alguna fecha, usar fechas por defecto muy distantes
            const fechaInicioParam = fechaInicio || '1970-01-01'; // Fecha muy antigua
            const fechaFinParam = fechaFin || '2099-12-31'; // Fecha muy futura

            const ventas = await this.apiRequest(`/ventas/filtro?fechaInicio=${fechaInicioParam}&fechaFin=${fechaFinParam}`);
            const tbody = document.getElementById('ventasTableBody');
            tbody.innerHTML = '';

            if (ventas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay ventas en el rango de fechas seleccionado.</td></tr>';
                return;
            }

            ventas.forEach(venta => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${venta.ID_Venta}</td>
                    <td>${new Date(venta.Fecha).toLocaleDateString()}</td>
                    <td>$${parseFloat(venta.Total).toFixed(2)}</td>
                    <td>${venta.Metodo_Pago}</td>
                    <td>${venta.Nombre_Usuario}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-success ver-detalle-btn" 
                                data-bs-toggle="modal" 
                                data-bs-target="#detalleVentaModal" 
                                data-venta-id="${venta.ID_Venta}">
                            Ver detalles
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar ventas por fecha:', error);
            alert('Error al cargar ventas por fecha');
        }
    },

    async cargarDetalleVenta(id) {
        try {
            const detalle = await this.apiRequest(`/ventas/${id}`);
            const venta = detalle.venta;
            const detalles = detalle.detalles;

            // Actualizar información general
            document.getElementById('detalleVentaId').value = venta.ID_Venta;
            document.getElementById('detalleVentaUsuario').value = venta.Nombre_Usuario;
            document.getElementById('detalleVentaFecha').value = new Date(venta.Fecha).toLocaleDateString();
            document.getElementById('detalleVentaMetodo').value = venta.Metodo_Pago;
            document.getElementById('detalleVentaTotal').value = `$${parseFloat(venta.Total).toFixed(2)}`;

            // Actualizar tabla de productos
            const tbody = document.getElementById('detalleVentaProductos');
            tbody.innerHTML = '';

            if (detalles.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay productos en esta venta.</td></tr>';
                return;
            }

            detalles.forEach(detalle => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${detalle.Producto}</td>
                    <td>${detalle.Cantidad}</td>
                    <td>$${parseFloat(detalle.Precio_Unitario).toFixed(2)}</td>
                    <td>$${parseFloat(detalle.Subtotal).toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar detalle de venta:', error);
            alert('Error al cargar detalle de venta');
        }
    },

    async exportarPDF() {
        try {
            const fechaInicio = document.getElementById('fechaInicio').value;
            const fechaFin = document.getElementById('fechaFin').value;

            if (!fechaInicio || !fechaFin) {
                alert('Por favor, seleccione ambas fechas para exportar');
                return;
            }

            const response = await this.apiRequest(`/ventas/exportar/pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            alert('Función de exportación a PDF pendiente de implementar');
        } catch (error) {
            console.error('Error al exportar a PDF:', error);
            alert('Error al exportar a PDF');
        }
    },

    async exportarExcel() {
        try {
            const fechaInicio = document.getElementById('fechaInicio').value;
            const fechaFin = document.getElementById('fechaFin').value;

            if (!fechaInicio || !fechaFin) {
                alert('Por favor, seleccione ambas fechas para exportar');
                return;
            }

            const response = await this.apiRequest(`/ventas/exportar/excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            alert('Función de exportación a Excel pendiente de implementar');
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            alert('Error al exportar a Excel');
        }
    },

    // Función de inicialización
    init() {
        console.log('Inicializando módulo de ventas...');
        if (this.checkAuth()) {
            // Cargar ventas al iniciar
            this.cargarVentas();

            // Configurar eventos
            document.getElementById('buscarVentasBtn').addEventListener('click', () => this.cargarVentasPorFecha());
            
            // Configurar eventos de exportación
            document.querySelector('#detalleVentaModal .btn-success').addEventListener('click', () => this.exportarPDF());
            document.querySelector('#detalleVentaModal .btn-cafe').addEventListener('click', () => this.exportarExcel());

            // Configurar evento para cargar detalles de venta
            document.getElementById('detalleVentaModal').addEventListener('show.bs.modal', (event) => {
                const button = event.relatedTarget;
                const ventaId = button.getAttribute('data-venta-id');
                this.cargarDetalleVenta(ventaId);
            });
        }
    }
};

// Exportar la función de inicialización
window.initVentas = () => VentasModule.init(); 