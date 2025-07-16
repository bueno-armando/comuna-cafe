(function() {
    const API_URL_USUARIOS = '/api/usuarios'; 
    let usuarios = [];
    let editUsuarioId = null;

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

    async function fetchUsuarios() {
        try {
            const data = await fetchAPI(API_URL_USUARIOS);
            // El backend devuelve un array de usuarios con campos: ID_Usuario, Nombre, Apellido, Usuario, Contraseña, ID_Rol, Estado, Rol_Nombre
            usuarios = Array.isArray(data) ? data : (data.usuarios || []);
            renderTableUsuarios(usuarios);
        } catch (error) {
            alert('No se pudieron cargar los usuarios: ' + error.message);
        }
    }

    function renderTableUsuarios(usersToRender) {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return console.warn('Usuarios: usersTableBody no encontrado.');
        tableBody.innerHTML = '';
        (usersToRender || []).forEach(user => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${user.Usuario || ''}</td>
                <td>${user.Nombre || ''}</td>
                <td>${user.Apellido || ''}</td>
                <td>${user.Rol_Nombre || ''}</td>
                <td>${user.Estado || ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-user-btn" data-id="${user.ID_Usuario}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.ID_Usuario}">Eliminar</button>
                </td>
            `;
        });
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
            return alert('Todos los campos son requeridos.');
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
        } catch (error) {
            alert('No se pudo agregar el usuario: ' + error.message);
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
            return alert('Todos los campos son requeridos.');
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
        } catch (error) {
            alert('No se pudo actualizar el usuario: ' + error.message);
        }
    }

    async function deleteUsuario(id) {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;
        try {
            await fetchAPI(`${API_URL_USUARIOS}/${id}`, { method: 'DELETE' });
            fetchUsuarios();
        } catch (error) {
            alert('No se pudo eliminar el usuario: ' + error.message);
        }
    }

    function initUsuarios() {
        console.log('=== Inicializando módulo Usuarios ===');
        fetchUsuarios();

        const addForm = document.getElementById('addUserForm');
        if (addForm) addForm.addEventListener('submit', addUsuario);
        else console.warn('Usuarios: addUserForm no encontrado');

        const editForm = document.getElementById('editUserForm');
        if (editForm) editForm.addEventListener('submit', saveEditUsuario);
        else console.warn('Usuarios: editUserForm no encontrado');

        const tableBody = document.getElementById('usersTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', function(e) {
                const editBtn = e.target.closest('.edit-user-btn');
                if (editBtn && editBtn.dataset.id) {
                    editUsuario(editBtn.dataset.id);
                }
                const deleteBtn = e.target.closest('.delete-user-btn');
                if (deleteBtn && deleteBtn.dataset.id) {
                    deleteUsuario(deleteBtn.dataset.id);
                }
            });
        } else console.warn('Usuarios: usersTableBody no encontrado para delegación de eventos.');
    }

    window.initUsuarios = initUsuarios;
    console.log('usuarios.js: window.initUsuarios ASIGNADO.', typeof window.initUsuarios);

})(); // Fin de la IIFE