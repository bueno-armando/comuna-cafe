(function() {
    const API_URL_USUARIOS = '/api/usuarios'; 
    let usuarios = [];
    let editUsuarioId = null;
    let deleteUsuarioId = null;
    let currentFilters = {};
    let currentPage = 1;
    let totalPages = 1;
    let totalRegistros = 0;

    function getToken() {
        return localStorage.getItem('token');
    }

    async function fetchAPI(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            ...options.headers,
        };
        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Fetch API Error:', error.message, 'URL:', url, 'Options:', options);
            throw error; 
        }
    }

    // Función para mostrar modal de error
    function showErrorModal(message) {
        const errorModal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        if (errorModal) {
            const modal = bootstrap.Modal.getInstance(errorModal) || new bootstrap.Modal(errorModal);
            modal.show();
        }
    }

    // Función para mostrar modal de confirmación de eliminación
    function showDeleteConfirmModal(userId) {
        deleteUsuarioId = userId;
        const deleteModal = document.getElementById('deleteConfirmModal');
        if (deleteModal) {
            const modal = bootstrap.Modal.getInstance(deleteModal) || new bootstrap.Modal(deleteModal);
            modal.show();
        }
    }

    // Función para mostrar modal de confirmación de edición
    function showEditConfirmModal() {
        const editModal = document.getElementById('editConfirmModal');
        if (editModal) {
            const modal = bootstrap.Modal.getInstance(editModal) || new bootstrap.Modal(editModal);
            modal.show();
        }
    }

    // Función para mostrar modal de confirmación de creación
    function showCreateConfirmModal() {
        const createModal = document.getElementById('createConfirmModal');
        if (createModal) {
            const modal = bootstrap.Modal.getInstance(createModal) || new bootstrap.Modal(createModal);
            modal.show();
        }
    }

    async function fetchUsuarios() {
        try {
            // Construir query string con filtros y paginación
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 9,
                ...currentFilters
            }).toString();
            
            const url = `${API_URL_USUARIOS}?${queryParams}`;
            const data = await fetchAPI(url);
            
            usuarios = data.usuarios || [];
            totalRegistros = data.totalRegistros || 0;
            totalPages = data.totalPages || 1;
            currentPage = data.currentPage || 1;
            
            renderTableUsuarios(usuarios);
            renderPagination();
            updateRegistrosInfo();
        } catch (error) {
            showErrorModal('No se pudieron cargar los usuarios: ' + error.message);
        }
    }

    function renderTableUsuarios(usersToRender) {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return console.warn('Usuarios: usersTableBody no encontrado.');
        tableBody.innerHTML = '';
        
        if (usersToRender.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="bi bi-search me-2"></i>No se encontraron usuarios
                    </td>
                </tr>
            `;
            return;
        }
        
        usersToRender.forEach(user => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td><span class="badge bg-secondary">${user.ID_Usuario || ''}</span></td>
                <td>${user.Usuario || ''}</td>
                <td>${user.Nombre || ''}</td>
                <td>${user.Apellido || ''}</td>
                <td>${user.Rol_Nombre || ''}</td>
                <td>
                    <span class="badge ${user.Estado === 'Activo' ? 'bg-success' : 'bg-secondary'}">
                        ${user.Estado || ''}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning edit-user-btn" data-id="${user.ID_Usuario}">
                        <i class="bi bi-pencil me-1"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.ID_Usuario}">
                        <i class="bi bi-trash me-1"></i>Eliminar
                    </button>
                </td>
            `;
        });
    }

    function renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Botón anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <button class="page-link" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                <i class="bi bi-chevron-left"></i>
            </button>
        `;
        pagination.appendChild(prevLi);

        // Páginas numeradas
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `
                <button class="page-link" data-page="${i}">${i}</button>
            `;
            pagination.appendChild(li);
        }

        // Botón siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <button class="page-link" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                <i class="bi bi-chevron-right"></i>
            </button>
        `;
        pagination.appendChild(nextLi);
    }

    function updateRegistrosInfo() {
        const registrosMostrados = document.getElementById('registrosMostrados');
        const totalRegistrosSpan = document.getElementById('totalRegistros');
        
        if (registrosMostrados) {
            registrosMostrados.textContent = usuarios.length;
        }
        if (totalRegistrosSpan) {
            totalRegistrosSpan.textContent = totalRegistros;
        }
    }

    function setupQuickFilters() {
        const quickFilterButtons = document.querySelectorAll('[data-filter]');
        const aplicarFiltrosContainer = document.getElementById('aplicarFiltrosContainer');
        
        quickFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remover clase activa de todos los botones
                quickFilterButtons.forEach(btn => btn.classList.remove('active'));
                // Agregar clase activa al botón clickeado
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                switch(filter) {
                    case 'todos':
                        currentFilters = {};
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.add('d-none');
                        break;
                        
                    case 'activos':
                        currentFilters = { estado: 'Activo' };
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.add('d-none');
                        break;
                        
                    case 'inactivos':
                        currentFilters = { estado: 'Inactivo' };
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.add('d-none');
                        break;
                        
                    case 'personalizado':
                        currentFilters = {};
                        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.remove('d-none');
                        return; // No aplicar filtro automáticamente para personalizado
                }
                
                // Aplicar filtro automáticamente para filtros rápidos
                currentPage = 1; // Volver a la primera página
                fetchUsuarios();
                mostrarFiltrosAplicados();
            });
        });
    }

    function setupCustomFilters() {
        const buscarNombre = document.getElementById('buscarNombre');
        const buscarApellido = document.getElementById('buscarApellido');
        const buscarRol = document.getElementById('buscarRol');
        const buscarEstado = document.getElementById('buscarEstado');
        const aplicarFiltrosBtn = document.getElementById('aplicarFiltrosBtn');
        
        // Evento para aplicar filtros personalizados
        if (aplicarFiltrosBtn) {
            aplicarFiltrosBtn.addEventListener('click', aplicarFiltrosPersonalizados);
        }

        // Eventos para búsqueda en tiempo real (opcional)
        [buscarNombre, buscarApellido, buscarRol, buscarEstado].forEach(input => {
            if (input) {
                input.addEventListener('keyup', function(e) {
                    if (e.key === 'Enter') {
                        aplicarFiltrosPersonalizados();
                    }
                });
            }
        });
    }

    function aplicarFiltrosPersonalizados() {
        const buscarNombre = document.getElementById('buscarNombre');
        const buscarApellido = document.getElementById('buscarApellido');
        const buscarRol = document.getElementById('buscarRol');
        const buscarEstado = document.getElementById('buscarEstado');
        
        currentFilters = {};
        
        if (buscarNombre && buscarNombre.value.trim()) {
            currentFilters.nombre = buscarNombre.value.trim();
        }
        
        if (buscarApellido && buscarApellido.value.trim()) {
            currentFilters.apellido = buscarApellido.value.trim();
        }
        
        if (buscarRol && buscarRol.value) {
            currentFilters.rol = buscarRol.value;
        }
        
        if (buscarEstado && buscarEstado.value) {
            currentFilters.estado = buscarEstado.value;
        }
        
        currentPage = 1; // Volver a la primera página
        fetchUsuarios();
        mostrarFiltrosAplicados();
    }

    function mostrarFiltrosAplicados() {
        const filtrosAplicados = document.getElementById('filtrosAplicados');
        const textoFiltrosAplicados = document.getElementById('textoFiltrosAplicados');
        
        if (!filtrosAplicados || !textoFiltrosAplicados) return;
        
        const filtros = [];
        
        if (currentFilters.nombre) filtros.push(`Nombre: "${currentFilters.nombre}"`);
        if (currentFilters.apellido) filtros.push(`Apellido: "${currentFilters.apellido}"`);
        if (currentFilters.rol) {
            const rolNombres = { '1': 'Administrador', '2': 'Cajero', '3': 'Mesero' };
            filtros.push(`Rol: ${rolNombres[currentFilters.rol] || currentFilters.rol}`);
        }
        if (currentFilters.estado) filtros.push(`Estado: ${currentFilters.estado}`);
        
        if (filtros.length > 0) {
            textoFiltrosAplicados.textContent = `Filtros aplicados: ${filtros.join(', ')}`;
            filtrosAplicados.classList.remove('d-none');
        } else {
            filtrosAplicados.classList.add('d-none');
        }
    }

    function clearFilters() {
        // Limpiar campos de búsqueda
        const buscarNombre = document.getElementById('buscarNombre');
        const buscarApellido = document.getElementById('buscarApellido');
        const buscarRol = document.getElementById('buscarRol');
        const buscarEstado = document.getElementById('buscarEstado');
        
        if (buscarNombre) buscarNombre.value = '';
        if (buscarApellido) buscarApellido.value = '';
        if (buscarRol) buscarRol.value = '';
        if (buscarEstado) buscarEstado.value = '';
        
        // Remover clase activa de filtros rápidos
        const quickFilterButtons = document.querySelectorAll('[data-filter]');
        quickFilterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Limpiar filtros
        currentFilters = {};
        currentPage = 1;
        
        // Ocultar indicador de filtros
        const filtrosAplicados = document.getElementById('filtrosAplicados');
        if (filtrosAplicados) filtrosAplicados.classList.add('d-none');
        
        // Ocultar botón de aplicar filtros
        const aplicarFiltrosContainer = document.getElementById('aplicarFiltrosContainer');
        if (aplicarFiltrosContainer) aplicarFiltrosContainer.classList.add('d-none');
        
        fetchUsuarios();
    }

    async function addUsuario(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        // Concatenar apellidos si fuera necesario, aquí solo hay un campo 'apellido'
        const data = {
            Nombre: formData.get('nombre'),
            Apellido: formData.get('apellido'),
            Contraseña: formData.get('contraseña'),
            ID_Rol: parseInt(formData.get('rol'), 10),
            Estado: 'Activo'
        };
        if (!data.Nombre || !data.Apellido || !data.Contraseña || !data.ID_Rol) {
            return showErrorModal('Todos los campos son requeridos.');
        }
        try {
            await fetchAPI(API_URL_USUARIOS, { method: 'POST', body: JSON.stringify(data) });
            fetchUsuarios();
            const modalEl = document.getElementById('addUserModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                if (modal) modal.hide();
            }
            event.target.reset();
            showCreateConfirmModal();
        } catch (error) {
            showErrorModal('No se pudo agregar el usuario: ' + error.message);
        }
    }
    
    function editUsuario(id) {
        const usuario = usuarios.find(u => u.ID_Usuario == id);
        if (!usuario) return console.warn('Usuario no encontrado para editar:', id);
        editUsuarioId = id;
        const editForm = document.getElementById('editUserForm');
        if(editForm){
            editForm.querySelector('[name="nombre"]').value = usuario.Nombre || '';
            editForm.querySelector('[name="apellido"]').value = usuario.Apellido || '';
            editForm.querySelector('[name="rol"]').value = usuario.ID_Rol || '';
            editForm.querySelector('[name="estado"]').value = usuario.Estado || 'Activo';
            editForm.querySelector('[name="contraseña"]').value = '';
        }
        const modalEl = document.getElementById('editUserModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            if (modal) modal.show();
        }
    }

    async function saveEditUsuario(event) {
        event.preventDefault();
        if (!editUsuarioId) return;
        const formData = new FormData(event.target);
        const data = {
            Nombre: formData.get('nombre'),
            Apellido: formData.get('apellido'),
            ID_Rol: parseInt(formData.get('rol'), 10),
            Estado: formData.get('estado')
        };
        const contrasena = formData.get('contraseña');
        if (contrasena && contrasena.trim() !== '') { 
            data.Contraseña = contrasena;
        }
        if (!data.Nombre || !data.Apellido || !data.ID_Rol || !data.Estado) {
            return showErrorModal('Todos los campos son requeridos.');
        }
        try {
            await fetchAPI(`${API_URL_USUARIOS}/${editUsuarioId}`, { method: 'PUT', body: JSON.stringify(data) });
            fetchUsuarios();
            const modalEl = document.getElementById('editUserModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                if (modal) modal.hide();
            }
            editUsuarioId = null;
            showEditConfirmModal();
        } catch (error) {
            showErrorModal('No se pudo actualizar el usuario: ' + error.message);
        }
    }

    async function deleteUsuario(id) {
        try {
            await fetchAPI(`${API_URL_USUARIOS}/${id}`, { method: 'DELETE' });
            fetchUsuarios();
            // Cerrar modal de confirmación
            const deleteModal = document.getElementById('deleteConfirmModal');
            if (deleteModal) {
                const modal = bootstrap.Modal.getInstance(deleteModal);
                if (modal) modal.hide();
            }
            deleteUsuarioId = null;
        } catch (error) {
            showErrorModal('No se pudo eliminar el usuario: ' + error.message);
        }
    }

    function initUsuarios() {
        console.log('=== Inicializando módulo Usuarios ===');
        
        // Configurar filtros
        setupQuickFilters();
        setupCustomFilters();
        
        // Configurar paginación
        const pagination = document.getElementById('pagination');
        if (pagination) {
            pagination.addEventListener('click', function(e) {
                if (e.target.classList.contains('page-link')) {
                    e.preventDefault();
                    const page = parseInt(e.target.dataset.page);
                    if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                        currentPage = page;
        fetchUsuarios();
                    }
                }
            });
        }

        // Configurar cerrar filtros
        const cerrarFiltros = document.getElementById('cerrarFiltros');
        if (cerrarFiltros) {
            cerrarFiltros.addEventListener('click', clearFilters);
        }

        const addForm = document.getElementById('addUserForm');
        if (addForm) addForm.addEventListener('submit', addUsuario);
        else console.warn('Usuarios: addUserForm no encontrado');

        const editForm = document.getElementById('editUserForm');
        if (editForm) editForm.addEventListener('submit', saveEditUsuario);
        else console.warn('Usuarios: editUserForm no encontrado');

        // Evento para confirmar eliminación
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                if (deleteUsuarioId) {
                    deleteUsuario(deleteUsuarioId);
                }
            });
        }

        const tableBody = document.getElementById('usersTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', function(e) {
                const editBtn = e.target.closest('.edit-user-btn');
                if (editBtn && editBtn.dataset.id) {
                    editUsuario(editBtn.dataset.id);
                }
                const deleteBtn = e.target.closest('.delete-user-btn');
                if (deleteBtn && deleteBtn.dataset.id) {
                    showDeleteConfirmModal(deleteBtn.dataset.id);
                }
            });
        } else console.warn('Usuarios: usersTableBody no encontrado para delegación de eventos.');

        // Cargar usuarios iniciales
        fetchUsuarios();
    }

    window.initUsuarios = initUsuarios;
    console.log('usuarios.js: window.initUsuarios ASIGNADO.', typeof window.initUsuarios);

})(); // Fin de la IIFE