export class ThemeManager {
    constructor() {
        this.colorSelect = document.getElementById('theme-color-select');
        this.layoutSelect = document.getElementById('theme-layout-select');
        
        this.init();
    }

    init() {
        // Los valores por defecto se aplican en el <head> de index.html para evitar FOUC.
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

    setThemeColor(color) {
        document.documentElement.setAttribute('data-theme', color);
        localStorage.setItem('themeColor', color);
        
        // Opcional: Actualizar color de la barra de estado de PWA
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            let colorHex = '#0f172a'; // dark
            if (color === 'light') colorHex = '#f8fafc';
            if (color === 'industrial') colorHex = '#000000';
            metaThemeColor.setAttribute('content', colorHex);
        }
    }

    setLayout(layout) {
        document.documentElement.setAttribute('data-layout', layout);
        localStorage.setItem('themeLayout', layout);
    }
}
