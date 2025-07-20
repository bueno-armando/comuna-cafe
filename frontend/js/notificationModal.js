/**
 * Clase para manejar modales de notificación de manera consistente
 * en todo el sistema Comuna Café
 */
class NotificationModal {
    constructor() {
        this.modal = null;
        this.modalElement = null;
        this.titleElement = null;
        this.messageElement = null;
        this.iconElement = null;
        this.init();
    }

    /**
     * Inicializa el modal de notificación
     */
    init() {
        // Crear el modal si no existe
        if (!document.getElementById('notificacionModal')) {
            this.createModal();
        }
        
        this.modalElement = document.getElementById('notificacionModal');
        this.titleElement = document.getElementById('notificacionTitulo');
        this.messageElement = document.getElementById('notificacionMensaje');
        this.iconElement = this.titleElement.querySelector('i');
        
        // Inicializar el modal de Bootstrap
        this.modal = new bootstrap.Modal(this.modalElement);
    }

    /**
     * Crea el modal HTML si no existe
     */
    createModal() {
        const modalHTML = `
            <div class="modal fade" id="notificacionModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-sm modal-dialog-centered">
                    <div class="modal-content shadow">
                        <div class="modal-header border-0">
                            <h5 class="modal-title" id="notificacionTitulo">
                                <i class="bi bi-check-circle me-2"></i>Éxito
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <p id="notificacionMensaje" class="mb-0">Operación completada exitosamente.</p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-cafe" data-bs-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Configura el icono según el tipo de notificación
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     */
    setIcon(type) {
        const iconMap = {
            'success': 'bi-check-circle',
            'error': 'bi-exclamation-triangle',
            'warning': 'bi-exclamation-circle',
            'info': 'bi-info-circle'
        };
        
        const iconClass = iconMap[type] || 'bi-check-circle';
        this.iconElement.className = `bi ${iconClass} me-2`;
    }

    /**
     * Configura el color del botón según el tipo de notificación
     * @param {string} type - Tipo de notificación
     */
    setButtonColor(type) {
        const button = this.modalElement.querySelector('.modal-footer .btn');
        const colorMap = {
            'success': 'btn-cafe',
            'error': 'btn-danger',
            'warning': 'btn-warning',
            'info': 'btn-info'
        };
        
        // Remover clases de color anteriores
        button.classList.remove('btn-cafe', 'btn-danger', 'btn-warning', 'btn-info');
        
        // Agregar nueva clase de color
        const colorClass = colorMap[type] || 'btn-cafe';
        button.classList.add(colorClass);
    }

    /**
     * Muestra una notificación
     * @param {string} title - Título de la notificación
     * @param {string} message - Mensaje de la notificación
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     */
    show(title, message, type = 'success') {
        // Configurar título y mensaje
        this.titleElement.innerHTML = `<i class="bi bi-check-circle me-2"></i>${title}`;
        this.messageElement.textContent = message;
        
        // Configurar icono y color según el tipo
        this.setIcon(type);
        this.setButtonColor(type);
        
        // Mostrar el modal
        this.modal.show();
    }

    /**
     * Muestra una notificación de éxito
     * @param {string} message - Mensaje de éxito
     */
    showSuccess(message) {
        this.show('Éxito', message, 'success');
    }

    /**
     * Muestra una notificación de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.show('Error', message, 'error');
    }

    /**
     * Muestra una notificación de advertencia
     * @param {string} message - Mensaje de advertencia
     */
    showWarning(message) {
        this.show('Advertencia', message, 'warning');
    }

    /**
     * Muestra una notificación informativa
     * @param {string} message - Mensaje informativo
     */
    showInfo(message) {
        this.show('Información', message, 'info');
    }

    /**
     * Oculta el modal
     */
    hide() {
        this.modal.hide();
    }
}

// Crear instancia global para uso en todo el sistema
const notificationModal = new NotificationModal(); 