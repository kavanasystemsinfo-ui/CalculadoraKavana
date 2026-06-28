/**
 * ThemeManager - Gestión de temas globales y de producción
 */
export class ThemeManager {
    constructor() {
        this.colorSelect = document.getElementById('theme-color-select');
        this.layoutSelect = document.getElementById('theme-layout-select');
        this.productionSelect = document.getElementById('theme-production-select');
        
        this.init();
    }

    init() {
        // Los valores por defecto se aplican en el <head> de index.html para evitar FOOC.
        // Aquí solo sincronizamos los <select> con el estado actual.
        const currentColor = localStorage.getItem('themeColor') || 'dark';
        const currentLayout = localStorage.getItem('themeLayout') || 'compact';
        const currentProduction = localStorage.getItem('themeProduction') || 'blue';

        if(this.colorSelect) {
            this.colorSelect.value = currentColor;
            this.colorSelect.addEventListener('change', (e) => this.setThemeColor(e.target.value));
        }

        if(this.layoutSelect) {
            this.layoutSelect.value = currentLayout;
            this.layoutSelect.addEventListener('change', (e) => this.setLayout(e.target.value));
        }

        if(this.productionSelect) {
            this.productionSelect.value = currentProduction;
            this.productionSelect.addEventListener('change', (e) => this.setProductionTheme(e.target.value));
        }
    }

    /**
     * Cambia el tema global (dark, light, industrial)
     */
    setThemeColor(color) {
        document.documentElement.setAttribute('data-theme', color);
        localStorage.setItem('themeColor', color);
        
        // Actualizar color de la barra de estado de PWA
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            let colorHex = '#0f172a'; // dark
            if (color === 'light') colorHex = '#f8fafc';
            if (color === 'industrial') colorHex = '#000000';
            metaThemeColor.setAttribute('content', colorHex);
        }
    }

    /**
     * Cambia el layout (compact, expanded)
     */
    setLayout(layout) {
        document.documentElement.setAttribute('data-layout', layout);
        localStorage.setItem('themeLayout', layout);
    }

    /**
     * Cambia el tema de producción (blue, green, orange, purple, red, teal)
     */
    setProductionTheme(theme) {
        localStorage.setItem('themeProduction', theme);
        this.applyProductionTheme();
    }

    /**
     * Aplica el tema de producción combinado con el tema global
     */
    applyProductionTheme() {
        const globalTheme = localStorage.getItem('themeColor') || 'dark';
        const productionTheme = localStorage.getItem('themeProduction') || 'blue';
        
        // Aplicar tema global
        document.documentElement.setAttribute('data-theme', globalTheme);
        
        // Aplicar tema de producción como atributo combinado
        document.documentElement.setAttribute('data-production-theme', productionTheme);
    }

    /**
     * Limpia el tema de producción global
     */
    clearProductionTheme() {
        document.documentElement.removeAttribute('data-production-theme');
    }

    /**
     * Aplica un tema temporal de una plantilla
     */
    applyTemplateTheme(theme) {
        document.documentElement.setAttribute('data-production-theme', theme);
    }

    /**
     * Limpia el tema de plantilla y vuelve al preferido global
     */
    clearTemplateTheme() {
        this.applyProductionTheme();
    }
}
