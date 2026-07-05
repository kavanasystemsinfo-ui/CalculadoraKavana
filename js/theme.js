/**
 * ThemeManager - Gestión de temas globales y de producción
 */
const APP_THEME_META_COLORS = {
    blue: '#172554',
    green: '#052e16',
    orange: '#431407',
    purple: '#3b0764',
    red: '#450a0a',
    teal: '#042f2e'
};

export class ThemeManager {
    constructor() {
        this.layoutSelect = document.getElementById('theme-layout-select');
        this.productionSelect = document.getElementById('theme-production-select');
        
        this.init();
    }

    init() {
        // Los valores por defecto se aplican en el <head> de index.html para evitar FOOC.
        // Aquí solo sincronizamos los <select> con el estado actual.
        const currentLayout = localStorage.getItem('themeLayout') || 'compact';
        const currentProduction = localStorage.getItem('themeProduction') || 'blue';

        if(this.layoutSelect) {
            this.layoutSelect.value = currentLayout;
            this.layoutSelect.addEventListener('change', (e) => this.setLayout(e.target.value));
        }

        if(this.productionSelect) {
            this.productionSelect.value = currentProduction;
            this.productionSelect.addEventListener('change', (e) => this.setProductionTheme(e.target.value));
        }
        
        // Ensure the layout and theme are correctly applied
        this.setLayout(currentLayout);
        this.applyProductionTheme(currentProduction);
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
        this.applyProductionTheme(theme);
    }

    /**
     * Aplica el tema de producción global
     */
    applyProductionTheme(theme) {
        const productionTheme = theme || localStorage.getItem('themeProduction') || 'blue';
        const validTheme = this.normalizeThemeColor(productionTheme);

        // Aplicar tema global y de producción como atributos
        document.documentElement.setAttribute('data-theme', validTheme);
        document.documentElement.setAttribute('data-production-theme', validTheme);
        this.updateMetaThemeColor(validTheme);
    }

    /**
     * Limpia el tema de producción global (not used when themeProduction is global)
     */
    clearProductionTheme() {
        // Obsolete as production theme is now the main theme
        // kept for interface compatibility
    }

    /**
     * Aplica un tema temporal de una plantilla
     */
    applyTemplateTheme(theme) {
        const validTheme = this.normalizeThemeColor(theme);
        document.documentElement.setAttribute('data-production-theme', validTheme);
        // We can optionally set data-theme here if we want the whole app to change color with templates
        // document.documentElement.setAttribute('data-theme', validTheme);
    }

    /**
     * Limpia el tema de plantilla y vuelve al preferido global
     */
    clearTemplateTheme() {
        this.applyProductionTheme();
    }

    normalizeThemeColor(color) {
        if (!color) return 'blue';
        if (APP_THEME_META_COLORS[color]) return color;
        return 'blue';
    }

    updateMetaThemeColor(color) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', APP_THEME_META_COLORS[color] || APP_THEME_META_COLORS.blue);
        }
    }
}
