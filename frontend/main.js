// main.js - Lógica de navegación y control de vistas para la SPA

// Verificar si el usuario está autenticado
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Verificando autenticación:', { token, userRole });
    
    // Si no hay token o rol, redirigir al login
    if (!token || !userRole) {
        console.log('No hay sesión activa, redirigiendo al login...');
        window.location.href = 'Inicio%20Sesion.html';
        return false;
    }
    
    // Verificar si el token ha expirado
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convertir a milisegundos
        if (Date.now() >= exp) {
            console.log('Token expirado, redirigiendo al login...');
            localStorage.clear();
            window.location.href = 'Inicio%20Sesion.html';
            return false;
        }
    } catch (error) {
        console.error('Error al verificar token:', error);
        localStorage.clear();
        window.location.href = 'Inicio%20Sesion.html';
        return false;
    }
    
    return true;
}

// Verificar autenticación antes de cargar la página
if (!verificarAutenticacion()) {
    throw new Error('Redirigiendo al login...');
}

// Obtener el rol del usuario desde localStorage
console.log('Estado inicial del localStorage:', {
    userRole: localStorage.getItem('userRole'),
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId')
});

const userRole = localStorage.getItem('userRole') || 'Cajero';
console.log('Rol obtenido:', userRole);

// Cargar la barra lateral desde sidebar.html y configurar eventos
fetch('sidebar.html')
    .then(res => res.text())
    .then(html => {
        console.log('Sidebar HTML cargado');
        document.getElementById('sidebar-container').innerHTML = html;
        setupSidebarLinks();
        filtrarSidebarPorRol();
    });

// Oculta o muestra las opciones del menú según el rol del usuario
function filtrarSidebarPorRol() {
    console.log('Filtrando sidebar por rol:', userRole);
    console.log('Estado actual del localStorage:', {
        userRole: localStorage.getItem('userRole'),
        token: localStorage.getItem('token'),
        userId: localStorage.getItem('userId')
    });
    
    document.querySelectorAll('#sidebar .nav-item').forEach(item => {
        const roles = item.getAttribute('data-role');
        console.log('Roles permitidos para item:', roles);
        console.log('¿El rol actual está incluido?', roles.includes(userRole));
        if (!roles || !roles.includes(userRole)) {
            item.style.display = 'none';
        } else {
            item.style.display = '';
        }
    });
}

// Carga el contenido de la vista seleccionada en el contenedor principal
async function loadView(view) {
    console.log('=== Iniciando carga de vista ===');
    console.log('Vista solicitada:', view);
    console.log('Estado actual de los módulos:', {
        initCaja: typeof window.initCaja,
        initRecetas: typeof window.initRecetas,
        initUsuarios: typeof window.initUsuarios,
        initVentas: typeof window.initVentas,
        initInventario: typeof window.initInventario,
        initProductos: typeof window.initProductos,
        initBitacora: typeof window.initBitacora
    });

    try {
        const res = await fetch(view + '.html');
        const html = await res.text();
        console.log('HTML cargado para vista:', view);
        document.getElementById('main-content').innerHTML = html;
                
        // Si la vista es Caja, inicializa la simulación de productos y carrito
        if (view === 'Caja') {
            console.log('=== Inicializando módulo Caja ===');
            // Esperar a que el script de Caja se cargue
            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/caja.js';
                script.onload = () => {
                    console.log('Script de Caja cargado');
                    resolve();
                };
                document.head.appendChild(script);
            });

            if (typeof window.initCaja === 'function') {
                console.log('Llamando a initCaja...');
                requestAnimationFrame(() => {
                    window.initCaja();
                });
            } else {
                console.error('initCaja no está definida!');
            }
        }
        // Si la vista es Recetas, inicializa los eventos de Recetas
        else if (view === 'Recetas') {
            console.log('=== Inicializando módulo Recetas ===');
            // Remover script anterior si existe
            const oldScript = document.querySelector('script[src="js/recetas.js"]');
            if (oldScript) {
                console.log('main.js: Removiendo script anterior de Recetas');
                oldScript.remove();
            }
            // Esperar a que el modulo de recetas se cargue
            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/recetas.js';
                script.onload = () => {
                    console.log('main.js: Script de Recetas onload DISPARADO.');
                    console.log('main.js: Dentro de onload, typeof window.initRecetas:', typeof window.initRecetas);
                    resolve();
                }
                script.onerror = () => {
                    console.error('main.js: ERROR al cargar script de Recetas.');
                    resolve(); // Resolvemos igual para no bloquear, pero el error ya se registró
                }
                document.head.appendChild(script);
            });

            // Verificar si la función existe ANTES de llamarla
            if (typeof window.initRecetas === 'function') {
                console.log('main.js: Llamando a window.initRecetas...');
                requestAnimationFrame(() => {
                    window.initRecetas();
                });
            } else {
                console.error('main.js: window.initRecetas NO ESTÁ DEFINIDA después de cargar el script.');
                console.log('main.js: Estado actual de window.initRecetas:', window.initRecetas);
            }
        }
        // Si la vista es Usuarios, inicializa el módulo de usuarios
        else if (view === 'Usuarios') {
            console.log('=== Inicializando módulo Usuarios ===');
            // Remover script anterior si existe
            const oldScript = document.querySelector('script[src="js/usuarios.js"]');
            if (oldScript) {
                console.log('Removiendo script anterior de usuarios');
                oldScript.remove();
            }

            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/usuarios.js';
                script.onload = () => {
                    console.log('Script de Usuarios cargado');
                    resolve();
                };
                document.head.appendChild(script);
            });
            
            if (typeof window.initUsuarios === 'function') {
                console.log('Llamando a initUsuarios...');
                requestAnimationFrame(() => {
                    window.initUsuarios();
                });
            } else {
                console.error('initUsuarios no está definida!');
            }
        }
        // Si la vista es Ventas, inicializa el módulo de ventas
        else if (view === 'Ventas') {
            console.log('=== Inicializando módulo Ventas ===');
            // Remover script anterior si existe
            const oldScript = document.querySelector('script[src="js/ventas.js"]');
            if (oldScript) {
                console.log('Removiendo script anterior de ventas');
                oldScript.remove();
            }

            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/ventas.js';
                script.onload = () => {
                    console.log('Script de Ventas cargado');
                    resolve();
                };
                document.head.appendChild(script);
            });
            
            if (typeof window.initVentas === 'function') {
                console.log('Llamando a initVentas...');
                requestAnimationFrame(() => {
                    window.initVentas();
                });
            } else {
                console.error('initVentas no está definida!');
            }
        }
        // Si la vista es Inventario, inicializa el módulo de inventario
        else if (view === 'Inventario') {
            console.log('=== Inicializando módulo Inventario ===');
            // Remover script anterior si existe
            const oldScript = document.querySelector('script[src="js/inventario.js"]');
            if (oldScript) {
                console.log('Removiendo script anterior de inventario');
                oldScript.remove();
            }

            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/inventario.js';
                script.onload = () => {
                    console.log('Script de Inventario cargado');
                    resolve();
                };
                document.head.appendChild(script);
            });
            
            if (typeof window.initInventario === 'function') {
                console.log('Llamando a initInventario...');
                requestAnimationFrame(() => {
                    window.initInventario();
                });
            } else {
                console.error('initInventario no está definida!');
            }
        }
        // Si la vista es Productos, inicializa el módulo de productos
        else if (view === 'Productos') {
            console.log('=== Inicializando módulo Productos ===');
            // Remover script anterior si existe
            const oldScript = document.querySelector('script[src="js/productos.js"]');
            if (oldScript) {
                console.log('Removiendo script anterior de productos');
                oldScript.remove();
            }

            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/productos.js';
                script.onload = () => {
                    console.log('Script de Productos cargado');
                    resolve();
                };
                document.head.appendChild(script);
            });
            
            if (typeof window.initProductos === 'function') {
                console.log('Llamando a initProductos...');
                requestAnimationFrame(() => {
                    window.initProductos();
                });
            } else {
                console.error('initProductos no está definida!');
            }
        }
        // Si la vista es Bitacora, inicializa el módulo de bitácora
        else if (view === 'Bitacora') {
            console.log('=== Inicializando módulo Bitácora ===');
            // Remover script anterior si existe
            const oldScript = document.querySelector('script[src="js/bitacora.js"]');
            if (oldScript) {
                console.log('Removiendo script anterior de bitácora');
                oldScript.remove();
            }

            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/bitacora.js';
                script.onload = () => {
                    console.log('Script de Bitácora cargado');
                    resolve();
                };
                document.head.appendChild(script);
            });
            
            if (typeof window.initBitacora === 'function') {
                console.log('Llamando a initBitacora...');
                requestAnimationFrame(() => {
                    window.initBitacora();
                });
            } else {
                console.error('initBitacora no está definida!');
            }
        }
        // Si la vista es Insumos, inicializa el módulo de insumos
        else if (view === 'Insumos') {
            console.log('=== Inicializando módulo Insumos ===');
            // Remover script anterior si existe
            const oldScript = document.querySelector('script[src="js/insumos.js"]');
            if (oldScript) {
                console.log('Removiendo script anterior de insumos');
                oldScript.remove();
            }

            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'js/insumos.js';
                script.onload = () => {
                    console.log('Script de Insumos cargado');
                    resolve();
                };
                document.head.appendChild(script);
            });
            
            // Si Insumos tuviera una función initInsumos y necesitara el DOM:
            if (typeof window.initInsumos === 'function') {
                console.log('Llamando a initInsumos...');
                requestAnimationFrame(() => {
                    window.initInsumos();
                });
            } else {
                console.log('Módulo de Insumos cargado (o no tiene init explícita).');
            }
        }

        console.log('=== Finalización de carga de vista ===');
        console.log('Estado final de los módulos:', {
            initCaja: typeof window.initCaja,
            initRecetas: typeof window.initRecetas,
            initUsuarios: typeof window.initUsuarios,
            initVentas: typeof window.initVentas,
            initInventario: typeof window.initInventario,
            initProductos: typeof window.initProductos,
            initBitacora: typeof window.initBitacora
        });
    } catch (error) {
        console.error('Error cargando vista:', error);
    }
}

// Configura los eventos de la barra lateral (cambio de vista y cerrar sesión)
function setupSidebarLinks() {
    const links = document.querySelectorAll('#sidebar .menu-item');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
                loadView(view);
                links.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
        });
    });
    // Cargar vista por defecto al iniciar
    loadView('Caja');
    // Evento para cerrar sesión
    const logout = document.getElementById('dropdownUser');
    if (logout) {
        logout.addEventListener('click', function(e) {
            e.preventDefault();
            // Limpiar toda la información de sesión
            localStorage.clear();
            window.location.href = 'Inicio%20Sesion.html';
        });
    }
} 