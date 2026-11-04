import { driveSync } from './drive.js';

/**
 * Tarjeta de Google Drive en Ajustes: conectar, desconectar y ver el estado.
 */
export class DriveUI {
    constructor() {
        this.statusEl = document.getElementById('drive-status');
        this.actionsEl = document.getElementById('drive-actions');
        this.hintEl = document.getElementById('drive-hint');
        this.card = document.getElementById('card-drive');

        this.init();
    }

    init() {
        if (!this.card) return;

        window.addEventListener('tab-activated', (e) => {
            if (e.detail?.tab === 'tab-config') this.refresh();
        });
        window.addEventListener('drive-changed', () => this.refresh());

        this.refresh();
    }

    refresh() {
        if (!this.statusEl || !this.actionsEl) return;

        // Sin Client ID: no hay nada que conectar todavía
        if (!driveSync.isConfigured()) {
            this.statusEl.innerHTML = `<span class="badge-off">Sin configurar</span>`;
            this.actionsEl.innerHTML = `<button class="btn btn-secondary" disabled>Conectar Google Drive</button>`;
            this.hintEl.innerHTML = 'Falta el ID de cliente de Google. Los pasos están en <code>docs/drive-setup.md</code>; mientras tanto puedes descargar el Excel desde el historial.';
            return;
        }

        if (!driveSync.isConnected()) {
            this.statusEl.innerHTML = `<span class="badge-off">Sin conectar</span>`;
            this.actionsEl.innerHTML = `<button class="btn btn-primary" id="btn-drive-connect">Conectar Google Drive</button>`;
            this.hintEl.textContent = 'Al conectar se creará una hoja de cálculo en tu Drive. Solo la app puede verla.';
            document.getElementById('btn-drive-connect')?.addEventListener('click', (e) => this.connect(e.currentTarget));
            return;
        }

        const url = driveSync.spreadsheetUrl();
        this.statusEl.innerHTML = `<span class="badge-on">Conectado</span>`;
        this.actionsEl.innerHTML = `
            <a class="btn btn-secondary" href="${url}" target="_blank" rel="noopener">Abrir la hoja</a>
            <button class="btn btn-secondary" id="btn-drive-disconnect">Desconectar</button>
        `;
        this.hintEl.textContent = 'Cada vez que pulses «Guardar en Drive» se añaden a la hoja los turnos que aún no estaban.';

        document.getElementById('btn-drive-disconnect')?.addEventListener('click', async () => {
            if (!confirm('¿Desconectar Google Drive en este dispositivo? El archivo de tu Drive no se borra.')) return;
            await driveSync.disconnect();
            window.dispatchEvent(new CustomEvent('drive-changed'));
        });
    }

    async connect(button) {
        const original = button.textContent;
        button.disabled = true;
        button.textContent = 'Conectando…';
        this.hintEl.textContent = 'Esperando a Google…';

        try {
            const url = await driveSync.connect();
            this.refresh();
            this.hintEl.innerHTML = `Conectado. <a href="${url}" target="_blank" rel="noopener">Abrir la hoja</a>. Los turnos se suben al pulsar «Guardar en Drive» en el historial.`;
            window.dispatchEvent(new CustomEvent('drive-changed'));
        } catch (error) {
            button.disabled = false;
            button.textContent = original;
            this.hintEl.textContent = error.message;
        }
    }
}
