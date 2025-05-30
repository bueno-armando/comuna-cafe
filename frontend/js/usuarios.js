// Namespace para el módulo de usuarios
const UsuariosModule = {
    // Configuración de la API
    API_URL: 'http://localhost:3000/api',

    // Funciones de utilidad
    getToken() {
        return localStorage.getItem('token');
    },

    getCurrentUserId() {
        return localStorage.getItem('userId');
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

    // Funciones para manejar usuarios
    async cargarUsuarios() {
        try {
            const usuarios = await this.apiRequest('/usuarios');
            const tbody = document.querySelector('#usuariosTable tbody');
            tbody.innerHTML = '';
            const currentUserId = this.getCurrentUserId();

            if (usuarios.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay usuarios registrados.</td></tr>';
                return;
            }

            usuarios.forEach(usuario => {
                const tr = document.createElement('tr');
                const isCurrentUser = usuario.ID_Usuario.toString() === currentUserId;
                
                tr.innerHTML = `
                    <td>${usuario.Usuario}</td>
                    <td>${usuario.Nombre}</td>
                    <td>${usuario.Apellido}</td>
                    <td>${usuario.Rol_Nombre}</td>
                    <td>${usuario.Estado}</td>
                    <td>
                        ${isCurrentUser ? 
                            `<button class="btn btn-sm btn-info" onclick="editarMiPerfil(${usuario.ID_Usuario})">
                                <i class="fas fa-user-edit"></i> Mi Perfil
                            </button>` :
                            `<button class="btn btn-sm btn-warning" onclick="editarUsuario(${usuario.ID_Usuario})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.ID_Usuario})">
                                <i class="fas fa-trash"></i>
                            </button>`
                        }
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios');
        }
    },

    async editarMiPerfil(id) {
        try {
            const usuario = await this.apiRequest(`/usuarios/${id}`);
            const form = document.getElementById('editUserForm');
            
            // Llenar el formulario con los datos del usuario
            form.elements.nombre.value = usuario.Nombre;
            form.elements.apellido.value = usuario.Apellido;
            
            // Deshabilitar campos que no puede modificar
            form.elements.rol.disabled = true;
            form.elements.estado.disabled = true;
            
            // Ocultar campos que no debe ver
            form.elements.rol.parentElement.style.display = 'none';
            form.elements.estado.parentElement.style.display = 'none';
            
            // Cambiar el título del modal
            document.querySelector('#editUserModal .modal-title').textContent = 'Editar Mi Perfil';
            
            // Guardar el ID para usarlo en la actualización
            form.dataset.userId = id;
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            alert('Error al cargar datos del usuario');
        }
    },

    async editarUsuario(id) {
        try {
            const usuario = await this.apiRequest(`/usuarios/${id}`);
            const form = document.getElementById('editUserForm');
            
            // Llenar el formulario con los datos del usuario
            form.elements.nombre.value = usuario.Nombre;
            form.elements.apellido.value = usuario.Apellido;
            form.elements.rol.value = usuario.ID_Rol;
            form.elements.estado.value = usuario.Estado;
            
            // Habilitar todos los campos
            form.elements.rol.disabled = false;
            form.elements.estado.disabled = false;
            
            // Mostrar todos los campos
            form.elements.rol.parentElement.style.display = '';
            form.elements.estado.parentElement.style.display = '';
            
            // Restaurar el título del modal
            document.querySelector('#editUserModal .modal-title').textContent = 'Editar Usuario';
            
            // Guardar el ID para usarlo en la actualización
            form.dataset.userId = id;
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            alert('Error al cargar datos del usuario');
        }
    },

    async actualizarUsuario(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const userId = form.dataset.userId;
        const isCurrentUser = userId === this.getCurrentUserId();

        try {
            const data = {
                Nombre: formData.get('nombre'),
                Apellido: formData.get('apellido')
            };

            // Solo incluir campos adicionales si no es el usuario actual
            if (!isCurrentUser) {
                data.ID_Rol = parseInt(formData.get('rol'));
                data.Estado = formData.get('estado');
            }

            // Solo incluir contraseña si se proporcionó una nueva
            const contraseña = formData.get('contraseña');
            if (contraseña) {
                data.Contraseña = contraseña;
            }

            await this.apiRequest(`/usuarios/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            // Cerrar modal y recargar usuarios
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();
            form.reset();
            this.cargarUsuarios();
            alert(isCurrentUser ? 'Perfil actualizado exitosamente' : 'Usuario actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            alert('Error al actualizar usuario');
        }
    },

    async eliminarUsuario(id) {
        const currentUserId = this.getCurrentUserId();
        
        if (id.toString() === currentUserId) {
            alert('No puedes eliminar tu propia cuenta. Por favor, contacta a un administrador si necesitas eliminar tu cuenta.');
            return;
        }

        if (!confirm('¿Está seguro de eliminar este usuario?')) {
            return;
        }

        try {
            await this.apiRequest(`/usuarios/${id}`, {
                method: 'DELETE'
            });

            this.cargarUsuarios();
            alert('Usuario eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar usuario');
        }
    },

    // Función de inicialización
    init() {
        console.log('Inicializando módulo de usuarios...');
        if (this.checkAuth()) {
            // Cargar usuarios al iniciar
            this.cargarUsuarios();

            // Configurar eventos de formularios
            const addUserForm = document.getElementById('addUserForm');
            const editUserForm = document.getElementById('editUserForm');

            if (addUserForm) {
                addUserForm.addEventListener('submit', this.crearUsuario);
            }
            if (editUserForm) {
                editUserForm.addEventListener('submit', this.actualizarUsuario);
            }

            // Hacer las funciones disponibles globalmente
            window.editarUsuario = this.editarUsuario;
            window.eliminarUsuario = this.eliminarUsuario;
        }
    }
};

// Exportar la función de inicialización
window.initUsuarios = () => UsuariosModule.init(); 