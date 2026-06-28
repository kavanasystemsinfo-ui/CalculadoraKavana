/**
 * ThemeManager - Gestión de temas globales y de plantillas
 */
export class ThemeManager {
    constructor() {
        this.colorSelect = document.getElementById('theme-color-select');
        this.layoutSelect = document.getElementById('theme-layout-select');
        
        this.init();
    }

    init() {
        // Los valores por defecto se aplican en el <head> de index.html para evitar FOOC.
        // Aquí solo sincronizamos los <select> con el estado actual.
        const currentColor = localStorage.getItem('themeColor') || 'dark';
        const currentLayout = localStorage.getItem('themeLayout') || 'compact';

        if(this.colorSelect) {
            this.colorSelect.value = currentColor;
            this.colorSelect.addEventListener('change', (e) => this.setThemeColor(e.target.value));
        }

        if(this.layoutSelect) {
            this.layoutSelect.value = currentLayout;
            this.layoutSelect.addEventListener('change', (e) => this.setLayout(e.target.value));
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
     * Aplica el tema de una plantilla combinado con el tema global
     * @param {string} templateTheme - Nombre del tema de plantilla (blue, green, etc.)
     */
    applyTemplateTheme(templateTheme) {
        // Obtener tema global actual
        const globalTheme = localStorage.getItem('themeColor') || 'dark';
        
        // Eliminar cualquier tema de plantilla anterior
        document.documentElement.removeAttribute('data-template-theme');
        
        // Aplicar nuevo tema combinado
        if (templateTheme && ['blue', 'green', 'orange', 'purple', 'red', 'teal'].includes(templateTheme)) {
            document.documentElement.setAttribute('data-theme', globalTheme);
            document.documentElement.setAttribute('data-template-theme', templateTheme);
        }
    }

    /**
     * Limpia el tema de plantilla y vuelve al tema global
     */
    clearTemplateTheme() {
        const globalTheme = localStorage.getItem('themeColor') || 'dark';
        document.documentElement.setAttribute('data-theme', globalTheme);
        document.documentElement.removeAttribute('data-template-theme');
    }
}
