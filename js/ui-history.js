import { store } from './store.js';
import { Exporter } from './export.js';
import { formatNumber } from './format.js';

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

        this.render();
    }

    render() {
        const sessions = store.getSessions();

        if (!sessions || sessions.length === 0) {
            this.container.innerHTML = `
                <div class="empty">
                    Todavía no hay turnos guardados.<br>
                    Cuenta lo que lleves hecho y pulsa <b>Guardar turno</b>.
                </div>
                <div class="hist-foot">
                    <button class="btn btn-secondary" id="btn-import-json">Importar copia (JSON)</button>
                </div>
            `;
            this.container.querySelector('#btn-import-json')?.addEventListener('click', () => this.importBackup());
            return;
        }

        const rows = sessions.map(s => {
            const date = new Date(s.date);
            const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const eff = Number(s.efficiency);
            const level = !isFinite(eff) || eff === 0 ? 'low' : eff >= 100 ? 'good' : eff >= 80 ? 'mid' : 'low';
            const models = (s.entries || []).length;

            return `
                <div class="hist-row" data-id="${s.id}">
                    <div class="hist-main">
                        <div class="h-title">${this.escapeHtml(s.templateName || 'Línea')}</div>
                        <div class="h-date">${dateStr} · ${timeStr} · ${this.fmt(s.shiftHours, 1)} h · ${models} modelo${models === 1 ? '' : 's'}</div>
                    </div>
                    <div class="hist-num">
                        <span>Piezas</span>
                        <b>${this.fmt(s.totalPieces, 0)}</b>
                    </div>
                    <div class="hist-num">
                        <span>Metros</span>
                        <b>${this.fmt(s.totalMeters, 0)}</b>
                    </div>
                    ${isFinite(eff) && eff > 0
                        ? `<span class="eff-badge ${level}">${this.fmt(eff, 1)}%</span>`
                        : `<span class="eff-badge">—</span>`}
                    <button class="btn-icon btn-delete-session" data-id="${s.id}" title="Eliminar turno" aria-label="Eliminar turno">✕</button>
                </div>
            `;
        }).join('');

        this.container.innerHTML = `
            ${rows}
            <div class="hist-foot">
                <button class="btn btn-secondary" id="btn-export-all-xlsx">Exportar a Excel</button>
                <button class="btn btn-secondary" id="btn-export-all">Copia de seguridad (JSON)</button>
                <button class="btn btn-secondary" id="btn-import-json">Importar copia</button>
            </div>
        `;

        this.container.querySelector('#btn-export-all-xlsx')?.addEventListener('click', () => this.exportAllToExcel());
        this.container.querySelectorAll('.btn-delete-session').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteSession(e.currentTarget.dataset.id));
        });

        this.container.querySelector('#btn-export-all')?.addEventListener('click', () => this.exportFullBackup());
        this.container.querySelector('#btn-import-json')?.addEventListener('click', () => this.importBackup());
    }

    exportAllToExcel() {
        const sessions = store.getSessions();
        if (sessions.length === 0) {
            alert('No hay turnos para exportar.');
            return;
        }
        Exporter.exportAllSessionsToExcel(sessions);
    }

    deleteSession(id) {
        if (confirm('¿Eliminar este turno? Esta acción no se puede deshacer.')) {
            store.deleteSession(id);
            this.render();
        }
    }

    exportFullBackup() {
        const templates = store.getTemplates();
        const sessions = store.getSessions();
        const dateStr = new Date().toISOString().slice(0, 10);
        Exporter.exportToJSON({ templates, sessions }, `calc_kavana_backup_${dateStr}.json`);
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

    fmt(value, decimals = 0) {
        return formatNumber(value, 0, decimals);
    }

    escapeHtml(unsafe) {
        return String(unsafe ?? '').replace(/[&<>"']/g, (m) => {
            switch (m) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                default: return '&#039;';
            }
        });
    }
}
