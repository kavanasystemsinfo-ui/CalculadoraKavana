import { store } from './store.js';
import { Exporter } from './export.js';

export class HistoryUI {
    constructor() {
        this.container = document.getElementById('lista-historial');
        this.init();
    }

    init() {
        if (!this.container) return;

        // Re-renderizar cuando cambiamos a la pestaña de historial
        window.addEventListener('switch-tab', (e) => {
            if (e.detail.tab === 'tab-historial') {
                this.render();
            }
        });

        // Renderizar al inicio
        this.render();
    }

    render() {
        const sessions = store.getSessions();

        if (!sessions || sessions.length === 0) {
            this.container.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px; color: var(--text-dim);">
                    <p>No hay sesiones guardadas todavía.</p>
                    <p style="font-size:12px; margin-top:8px;">Registra producción y guárdala para verla aquí.</p>
                </div>
                <div style="margin-top:16px;">
                    <button class="btn btn-secondary" id="btn-import-json">📥 Importar Backup (JSON)</button>
                </div>
            `;
            this.container.querySelector('#btn-import-json')?.addEventListener('click', () => this.importBackup());
            return;
        }

        const itemsHtml = sessions.map(s => {
            const dateStr = new Date(s.date).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const effColor = s.efficiency >= 100 ? 'var(--success)' : s.efficiency >= 80 ? 'var(--accent-secondary)' : 'var(--danger)';

            return `
                <div class="list-item" data-id="${s.id}">
                    <div style="flex:1;">
                        <h3 style="margin-bottom:4px; font-size:14px;">${this.escapeHtml(s.templateName)}</h3>
                        <p style="font-size:12px; color:var(--text-dim);">
                            ${dateStr} · ${s.shiftHours}h · ${(s.entries || []).length} modelo(s)
                        </p>
                        <span style="font-weight:900; font-size:18px; color:${effColor};">${s.efficiency}%</span>
                        <span style="color:var(--text-dim); font-size:11px;"> eficiencia</span>
                    </div>
                    <div style="display:flex; gap:8px; flex-shrink:0;">
                        <button class="btn-icon btn-export-xlsx" data-id="${s.id}" style="color:var(--accent-primary);" title="Exportar Excel">📥</button>
                        <button class="btn-icon btn-delete-session" data-id="${s.id}" title="Eliminar">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        this.container.innerHTML = `
            ${itemsHtml}
            <div style="margin-top:24px; display:flex; gap:8px;">
                <button class="btn btn-secondary" id="btn-export-all" style="flex:1;">📤 Exportar Backup (JSON)</button>
                <button class="btn btn-secondary" id="btn-import-json" style="flex:1;">📥 Importar Backup</button>
            </div>
        `;

        // Bind eventos
        this.container.querySelectorAll('.btn-export-xlsx').forEach(btn => {
            btn.addEventListener('click', (e) => this.exportSession(e.currentTarget.dataset.id));
        });

        this.container.querySelectorAll('.btn-delete-session').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteSession(e.currentTarget.dataset.id));
        });

        this.container.querySelector('#btn-export-all')?.addEventListener('click', () => this.exportFullBackup());
        this.container.querySelector('#btn-import-json')?.addEventListener('click', () => this.importBackup());
    }

    exportSession(id) {
        const session = store.getSessions().find(s => s.id === id);
        if (session) {
            Exporter.exportSessionToExcel(session);
        }
    }

    deleteSession(id) {
        if (confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) {
            store.deleteSession(id);
            this.render();
        }
    }

    exportFullBackup() {
        const templates = store.getTemplates();
        const sessions = store.getSessions();
        const dateStr = new Date().toISOString().slice(0, 10);
        Exporter.exportToJSON({ templates, sessions }, `prodcalc_backup_${dateStr}.json`);
    }

    importBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            if (!e.target.files[0]) return;
            try {
                const data = await Exporter.importFromJSON(e.target.files[0]);

                let imported = 0;

                // Importar plantillas
                if (data.templates && Array.isArray(data.templates)) {
                    for (const tpl of data.templates) {
                        if (tpl.name && tpl.models && tpl.efficiencyType) {
                            const existing = store.getTemplate(tpl.id);
                            if (!existing) {
                                store.saveTemplate(tpl);
                                imported++;
                            }
                        }
                    }
                }

                // Importar sesiones
                if (data.sessions && Array.isArray(data.sessions)) {
                    for (const sess of data.sessions) {
                        if (sess.templateName && sess.entries) {
                            const existing = store.getSessions().find(s => s.id === sess.id);
                            if (!existing) {
                                store.saveSession(sess);
                                imported++;
                            }
                        }
                    }
                }

                alert(`${imported} registro(s) importados correctamente.`);
                this.render();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        };
        input.click();
    }

    escapeHtml(unsafe) {
        return (unsafe || '').replace(/[&<"']/g, function (m) {
            switch (m) {
                case '&': return '&';
                case '<': return '<';
                case '"': return '"';
                default: return '&#039;';
            }
        });
    }
}
