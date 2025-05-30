// Funciones para manejar la autenticación y tokens
function getAuthHeader() {
    const token = localStorage.getItem('token');
    console.log('Token obtenido:', token ? 'Token presente' : 'No hay token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Función para cargar todos los proveedores
async function loadProviders() {
    console.log('=== Iniciando carga de proveedores ===');
    try {
        console.log('Realizando petición a /api/insumos/proveedores');
        const response = await fetch('/api/insumos/proveedores', {
            headers: getAuthHeader()
        });
        
        console.log('Respuesta recibida:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });

        if (!response.ok) {
            throw new Error(`Error al cargar proveedores: ${response.status} ${response.statusText}`);
        }

        const proveedores = await response.json();
        console.log('Proveedores recibidos:', proveedores);

        const addProviderSelect = document.getElementById('addInsumoProveedor');
        const editProviderSelect = document.getElementById('editInsumoProveedor');
        
        console.log('Selects encontrados:', {
            addProviderSelect: addProviderSelect ? 'Sí' : 'No',
            editProviderSelect: editProviderSelect ? 'Sí' : 'No'
        });

        // Limpiar opciones existentes excepto la primera
        while (addProviderSelect.options.length > 1) {
            addProviderSelect.remove(1);
        }
        while (editProviderSelect.options.length > 1) {
            editProviderSelect.remove(1);
        }

        // Agregar nuevos proveedores
        proveedores.forEach(proveedor => {
            console.log('Agregando proveedor:', proveedor);
            const addOption = new Option(proveedor.Nombre, proveedor.ID_Proveedor);
            const editOption = new Option(proveedor.Nombre, proveedor.ID_Proveedor);
            addProviderSelect.add(addOption);
            editProviderSelect.add(editOption);
        });

        console.log('=== Finalización carga de proveedores ===');
    } catch (error) {
        console.error('Error en loadProviders:', error);
        alert('Error al cargar los proveedores');
    }
}

// Función para cargar todos los insumos
async function loadInsumos() {
    console.log('=== Iniciando carga de insumos ===');
    try {
        console.log('Realizando petición a /api/insumos');
        const response = await fetch('/api/insumos', {
            headers: getAuthHeader()
        });
        
        console.log('Respuesta recibida:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.log('Token no válido, redirigiendo a login');
                window.location.href = '/login.html';
                return;
            }
            throw new Error(`Error al cargar insumos: ${response.status} ${response.statusText}`);
        }

        const insumos = await response.json();
        console.log('Insumos recibidos:', insumos);

        const tableBody = document.getElementById('insumosTableBody');
        console.log('TableBody encontrado:', tableBody ? 'Sí' : 'No');
        
        tableBody.innerHTML = '';

        if (insumos.length === 0) {
            console.log('No hay insumos para mostrar');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">No hay insumos registrados.</td>
                </tr>
            `;
            return;
        }

        console.log('Agregando insumos a la tabla');
        insumos.forEach(insumo => {
            console.log('Procesando insumo:', insumo);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${insumo.ID_Insumo}.</td>
                <td>${insumo.Nombre}</td>
                <td>${insumo.Unidad}</td>
                <td>$${parseFloat(insumo.Costo).toFixed(2)}</td>
                <td>${insumo.Proveedor_Nombre || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-insumo-btn" 
                            data-bs-toggle="modal" 
                            data-bs-target="#editInsumoModal" 
                            data-insumo-id="${insumo.ID_Insumo}">
                        Editar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        console.log('=== Finalización carga de insumos ===');
    } catch (error) {
        console.error('Error en loadInsumos:', error);
        alert('Error al cargar los insumos');
    }
}

// Función para crear un nuevo insumo
async function createInsumo(insumoData) {
    try {
        const response = await fetch('/api/insumos', {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(insumoData)
        });

        if (!response.ok) {
            throw new Error('Error al crear el insumo');
        }

        await loadInsumos();
        return true;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para actualizar un insumo
async function updateInsumo(id, insumoData) {
    try {
        const response = await fetch(`/api/insumos/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(insumoData)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el insumo');
        }

        await loadInsumos();
        return true;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para eliminar un insumo
async function deleteInsumo(id) {
    try {
        const response = await fetch(`/api/insumos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el insumo');
        }

        await loadInsumos();
        return true;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para buscar insumos
async function searchInsumos(query) {
    try {
        const response = await fetch(`/api/insumos/buscar?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Error al buscar insumos');
        }

        const insumos = await response.json();
        const tableBody = document.getElementById('insumosTableBody');
        tableBody.innerHTML = '';

        if (insumos.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">No se encontraron insumos.</td>
                </tr>
            `;
            return;
        }

        insumos.forEach(insumo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${insumo.ID_Insumo}.</td>
                <td>${insumo.Nombre}</td>
                <td>${insumo.Unidad}</td>
                <td>$${parseFloat(insumo.Costo).toFixed(2)}</td>
                <td>${insumo.Proveedor_Nombre || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-insumo-btn" 
                            data-bs-toggle="modal" 
                            data-bs-target="#editInsumoModal" 
                            data-insumo-id="${insumo.ID_Insumo}">
                        Editar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error al buscar insumos');
    }
}

// Función para inicializar el módulo
function initInsumos() {
    console.log('=== Inicializando módulo de Insumos ===');
    console.log('Configurando eventos');
    
    // Cargar insumos y proveedores al iniciar
    console.log('Iniciando carga de datos');
    loadInsumos();
    loadProviders();

    // Evento para agregar insumo
    document.getElementById('addInsumoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const insumoData = {
                Nombre: document.getElementById('addInsumoNombre').value,
                ID_Proveedor: document.getElementById('addInsumoProveedor').value,
                Costo: parseFloat(document.getElementById('addInsumoCosto').value),
                Unidad: document.getElementById('addInsumoUnidad').value
            };

            await createInsumo(insumoData);
            bootstrap.Modal.getInstance(document.getElementById('addInsumoModal')).hide();
            this.reset();
        } catch (error) {
            alert('Error al crear el insumo');
        }
    });

    // Evento para editar insumo
    document.getElementById('editInsumoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const insumoId = document.getElementById('editInsumoId').value;
            const insumoData = {
                Nombre: document.getElementById('editInsumoNombre').value,
                ID_Proveedor: document.getElementById('editInsumoProveedor').value,
                Costo: parseFloat(document.getElementById('editInsumoCosto').value),
                Unidad: document.getElementById('editInsumoUnidad').value
            };

            await updateInsumo(insumoId, insumoData);
            bootstrap.Modal.getInstance(document.getElementById('editInsumoModal')).hide();
        } catch (error) {
            alert('Error al actualizar el insumo');
        }
    });

    // Evento para eliminar insumo
    document.getElementById('deleteInsumoBtn').addEventListener('click', async function() {
        if (confirm('¿Está seguro que desea eliminar este insumo?')) {
            try {
                const insumoId = document.getElementById('editInsumoId').value;
                await deleteInsumo(insumoId);
                bootstrap.Modal.getInstance(document.getElementById('editInsumoModal')).hide();
            } catch (error) {
                alert('Error al eliminar el insumo');
            }
        }
    });

    // Evento para buscar insumos
    document.getElementById('insumoSearch').addEventListener('input', function(e) {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            searchInsumos(query);
        } else if (query.length === 0) {
            loadInsumos();
        }
    });

    // Evento para cargar datos al modal de edición
    document.getElementById('editInsumoModal').addEventListener('show.bs.modal', async function(event) {
        const button = event.relatedTarget;
        const insumoId = button.getAttribute('data-insumo-id');
        
        try {
            const response = await fetch(`/api/insumos/${insumoId}`, {
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Error al cargar el insumo');
            }

            const insumo = await response.json();
            document.getElementById('editInsumoId').value = insumo.ID_Insumo;
            document.getElementById('editInsumoNombre').value = insumo.Nombre;
            document.getElementById('editInsumoUnidad').value = insumo.Unidad;
            document.getElementById('editInsumoCosto').value = insumo.Costo;
            document.getElementById('editInsumoProveedor').value = insumo.ID_Proveedor;
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los datos del insumo');
        }
    });
}

// Inicializar el módulo inmediatamente
initInsumos(); 