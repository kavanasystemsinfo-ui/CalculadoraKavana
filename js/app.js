import { ThemeManager } from './theme.js?v=12';
import { store } from './store.js?v=9';
import { TemplatesUI } from './ui-templates.js?v=9';
import { ProductionUI } from './ui-production.js?v=9';
import { HistoryUI } from './ui-history.js?v=9';

class App {
    constructor() {
        this.themeManager = new ThemeManager();
        this.templatesUI = null;
        this.productionUI = null;
        this.historyUI = null;
        this.init();
    }

    async init() {
        this.setupTabs();
        
        // Inicializar controladores de UI que dependan del DOM cargado
        this.templatesUI = new TemplatesUI();
        this.productionUI = new ProductionUI();
        this.historyUI = new HistoryUI();

        // Registrar Service Worker (PWA)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js?v=12')
                .then(reg => console.log('[App] SW Registered', reg.scope))
                .catch(err => console.warn('[App] SW Error', err));
        }

        // Botón de borrado completo de la base de datos
        const btnClearDB = document.getElementById('btn-clear-db');
        if (btnClearDB) {
            btnClearDB.addEventListener('click', async () => {
                if (confirm('¿BORRAR TODA la base de datos? Plantillas, sesiones... Todo. ¿Estás seguro?')) {
                    store.clearAll();
                    location.reload();
                }
            });
        }

        // Carga inicial de datos para verificar que localStorage funciona
        try {
            const templates = store.getTemplates();
            console.log(`[App] Cargadas ${templates.length} plantillas desde localStorage.`);
        } catch (e) {
            console.error('[App] Error al inicializar Storage:', e);
        }
    }

    setupTabs() {
        const tabNav = document.querySelector('.tab-nav');
        const tabs = document.querySelectorAll('.tab-btn');

        tabs.forEach(tab => {
            tab.type = 'button';
        });

        if (tabNav) {
            tabNav.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn');
                if (!tab || !tabNav.contains(tab)) return;
                e.preventDefault();
                this.activateTab(tab.getAttribute('data-target'));
            });
        }

        // Permitir cambiar pestañas desde otros módulos
        window.addEventListener('switch-tab', (e) => {
            if (e.detail && e.detail.tab) {
                this.activateTab(e.detail.tab);
            }
        });

        const initialTab = document.querySelector('.tab-btn.active')?.getAttribute('data-target') || 'tab-produccion';
        this.activateTab(initialTab);
    }

    activateTab(targetId) {
        if (!targetId) return;

        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        const targetTabBtn = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
        if (targetTabBtn) targetTabBtn.classList.add('active');
        
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
    }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
