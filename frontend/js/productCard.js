/**
 * Clase común para renderizar tarjetas de productos
 * Permite configurar diferentes opciones según el módulo donde se use
 */
class ProductCard {
    constructor(product, options = {}) {
        this.product = product;
        this.options = {
            showPrice: false,
            showIngredients: false,
            showCategory: true,
            showButton: false,
            buttonText: '',
            buttonClass: 'btn-primary',
            buttonIcon: '',
            onClick: null,
            onButtonClick: null,
            cardClass: 'product-card',
            ingredientCount: null, // Para pasar el conteo de ingredientes desde fuera
            ...options
        };
    }

    /**
     * Renderiza la tarjeta del producto
     * @returns {string} HTML de la tarjeta
     */
    render() {
        const {
            showPrice,
            showIngredients,
            showCategory,
            showButton,
            buttonText,
            buttonClass,
            buttonIcon,
            cardClass,
            ingredientCount
        } = this.options;

        const precio = parseFloat(this.product.Precio_Venta) || 0;
        const categoria = this.product.categoria_nombre || this.product.Categoria || 'Sin categoría';
        const ingredientes = ingredientCount !== null ? ingredientCount : (this.product.ingredientCount || 0);

        let cardContent = `
            <div class="card ${cardClass} h-100" data-product-id="${this.product.ID_Producto}">
                <div class="card-body text-center">
                    <h5 class="card-title fw-bold mb-3">${this.product.Nombre}</h5>
        `;

        // Mostrar precio si está habilitado
        if (showPrice) {
            cardContent += `<p class="card-text text-success mb-2">$${precio.toFixed(2)}</p>`;
        }

        // Mostrar categoría si está habilitada
        if (showCategory) {
            cardContent += `<p class="card-text text-muted mb-2">${categoria}</p>`;
        }

        // Mostrar ingredientes si está habilitado
        if (showIngredients) {
            const ingredientText = ingredientCount !== null ? ingredientes : `Cargando...`;
            cardContent += `
                <p class="card-text mb-3">
                    <small class="text-muted">
                        <i class="bi bi-journal-text me-1"></i>
                        <span id="ingredientCount-${this.product.ID_Producto}">${ingredientText}</span> ingredientes
                    </small>
                </p>
            `;
        }

        // Mostrar botón si está habilitado
        if (showButton && buttonText) {
            cardContent += `
                <button class="btn ${buttonClass} btn-sm px-3 py-1" 
                        onclick="ProductCard.handleButtonClick(${this.product.ID_Producto}, '${this.product.Nombre}')">
                    <i class="bi ${buttonIcon} me-1"></i>${buttonText}
                </button>
            `;
        }

        cardContent += `
                </div>
            </div>
        `;

        return cardContent;
    }

    /**
     * Renderiza la tarjeta dentro de una columna Bootstrap
     * @returns {string} HTML de la columna con la tarjeta
     */
    renderColumn() {
        return `<div class="col">${this.render()}</div>`;
    }

    /**
     * Manejador estático para clicks en botones
     * @param {number} productId - ID del producto
     * @param {string} productName - Nombre del producto
     */
    static handleButtonClick(productId, productName) {
        // Este método será sobrescrito por cada módulo según sus necesidades
        console.log('Button clicked for product:', productId, productName);
    }

    /**
     * Configura el manejador de clicks para botones
     * @param {Function} handler - Función manejadora
     */
    static setButtonClickHandler(handler) {
        ProductCard.handleButtonClick = handler;
    }

    /**
     * Actualiza el conteo de ingredientes en una tarjeta existente
     * @param {number} productId - ID del producto
     * @param {number} count - Nuevo conteo de ingredientes
     */
    static updateIngredientCount(productId, count) {
        const countElement = document.getElementById(`ingredientCount-${productId}`);
        if (countElement) {
            countElement.textContent = count;
        }
    }
}

// Exportar la clase para uso global
window.ProductCard = ProductCard; 