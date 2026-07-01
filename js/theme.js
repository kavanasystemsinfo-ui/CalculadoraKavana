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

const APP_THEME_ALIASES = {
    dark: 'blue',
    light: 'blue',
    industrial: 'blue'
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
        const currentColor = this.normalizeThemeColor(localStorage.getItem('themeColor'));
        const currentLayout = localStorage.getItem('themeLayout') || 'compact';
        const currentProduction = localStorage.getItem('themeProduction') || 'blue';

        localStorage.setItem('themeColor', currentColor);
        document.documentElement.setAttribute('data-theme', currentColor);
        this.updateMetaThemeColor(currentColor);

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
        const globalTheme = this.normalizeThemeColor(localStorage.getItem('themeColor'));
        const productionTheme = localStorage.getItem('themeProduction') || 'blue';

        localStorage.setItem('themeColor', globalTheme);
        
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

    normalizeThemeColor(color) {
        if (!color) return 'blue';
        if (APP_THEME_ALIASES[color]) return APP_THEME_ALIASES[color];
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
