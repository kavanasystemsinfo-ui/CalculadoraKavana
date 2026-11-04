/**
 * Google Drive: conectar la cuenta del usuario y volcar el historial en un
 * Google Sheets que se va completando con cada turno guardado.
 *
 * Sin backend: OAuth con Google Identity Services (token en memoria) y
 * Sheets API v4 desde el navegador. Solo se pide el permiso `drive.file`,
 * que da acceso únicamente a los archivos creados por esta app.
 *
 * Si no hay conexión o falta el Client ID, la app sigue funcionando: el Excel
 * local y el backup JSON no dependen de esto.
 */

import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from './config.js';
import {
    sessionRow, entryRows, pendingSessions, chunkRows,
    spreadsheetTitle, SHEET_TURNOS, SHEET_DETALLE, HEADERS_TURNOS, HEADERS_DETALLE
} from './drive-model.js';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

const KEYS = {
    spreadsheetId: 'driveSpreadsheetId',
    spreadsheetUrl: 'driveSpreadsheetUrl',
    syncedIds: 'driveSyncedSessionIds',
    connectedAt: 'driveConnectedAt'
};

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

export class DriveSync {
    constructor() {
        this.token = null;          // { accessToken, expiresAt }
        this.tokenClient = null;
        this.gisLoading = null;
    }

    /* ----------------------------- estado ------------------------------ */

    isConfigured() {
        return Boolean(GOOGLE_CLIENT_ID);
    }

    isConnected() {
        return Boolean(localStorage.getItem(KEYS.spreadsheetId));
    }

    spreadsheetUrl() {
        return localStorage.getItem(KEYS.spreadsheetUrl) || '';
    }

    syncedIds() {
        return readJson(KEYS.syncedIds, []);
    }

    pendingCount(sessions) {
        return pendingSessions(sessions, this.syncedIds()).length;
    }

    /* --------------------------- OAuth / GIS --------------------------- */

    async loadGis() {
        if (window.google?.accounts?.oauth2) return;
        if (this.gisLoading) return this.gisLoading;

        this.gisLoading = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = GIS_SRC;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services. ¿Tienes conexión?'));
            document.head.appendChild(script);
        });

        return this.gisLoading;
    }

    /**
     * Pide un token a Google. Con `interactive: false` lo intenta sin mostrar
     * ventana (sirve si el usuario ya dio permiso antes en esta sesión);
     * con `interactive: true` abre el consentimiento.
     */
    async requestToken(interactive = true) {
        if (!this.isConfigured()) {
            throw new Error('Falta configurar el ID de cliente de Google (ver docs/drive-setup.md).');
        }
        if (!navigator.onLine) {
            throw new Error('Sin conexión: para guardar en Drive necesitas internet.');
        }

        await this.loadGis();

        if (this.token && this.token.expiresAt > Date.now() + 30000) {
            return this.token.accessToken;
        }

        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = (fn, value) => {
                if (settled) return;
                settled = true;
                fn(value);
            };

            try {
                this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: GOOGLE_SCOPES,
                    callback: (response) => {
                        if (response.error) {
                            finish(reject, new Error(this.describeAuthError(response.error)));
                            return;
                        }
                        this.token = {
                            accessToken: response.access_token,
                            expiresAt: Date.now() + (Number(response.expires_in || 3600) * 1000)
                        };
                        finish(resolve, this.token.accessToken);
                    },
                    error_callback: (err) => {
                        finish(reject, new Error(this.describeAuthError(err?.type || 'popup_error')));
                    }
                });

                this.tokenClient.requestAccessToken({ prompt: interactive ? '' : 'none' });
            } catch (e) {
                finish(reject, e);
            }
        });
    }

    describeAuthError(code) {
        const map = {
            popup_closed: 'Has cerrado la ventana de Google antes de dar permiso.',
            popup_failed_to_open: 'El navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes para este sitio.',
            access_denied: 'No has dado permiso para guardar en tu Drive.',
            invalid_client: 'El ID de cliente de Google no es válido. Revisa docs/drive-setup.md.'
        };
        return map[code] || `No se pudo conectar con Google (${code}).`;
    }

    async revoke() {
        const token = this.token?.accessToken;
        if (token && window.google?.accounts?.oauth2) {
            try {
                window.google.accounts.oauth2.revoke(token, () => {});
            } catch (e) { /* la revocación es best-effort */ }
        }
        this.token = null;
    }

    /* --------------------------- API de Sheets -------------------------- */

    async api(path, options = {}, retry = true) {
        const token = await this.requestToken(false).catch(async () => this.requestToken(true));

        const response = await fetch(`${SHEETS_API}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401 && retry) {
            this.token = null;                       // token caducado: reintenta una vez
            return this.api(path, options, false);
        }

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Drive respondió ${response.status}: ${body.slice(0, 200)}`);
        }

        return response.json();
    }

    /** Crea el libro con las dos hojas y sus cabeceras. */
    async createSpreadsheet() {
        const created = await this.api('', {
            method: 'POST',
            body: JSON.stringify({
                properties: { title: spreadsheetTitle() },
                sheets: [
                    { properties: { title: SHEET_TURNOS } },
                    { properties: { title: SHEET_DETALLE } }
                ]
            })
        });

        localStorage.setItem(KEYS.spreadsheetId, created.spreadsheetId);
        localStorage.setItem(KEYS.spreadsheetUrl, created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`);
        localStorage.setItem(KEYS.connectedAt, new Date().toISOString());

        await this.appendValues(SHEET_TURNOS, [HEADERS_TURNOS]);
        await this.appendValues(SHEET_DETALLE, [HEADERS_DETALLE]);

        return created.spreadsheetId;
    }

    /** Comprueba que el libro guardado sigue existiendo y es accesible. */
    async spreadsheetExists() {
        const id = localStorage.getItem(KEYS.spreadsheetId);
        if (!id) return false;
        try {
            await this.api(`/${id}?fields=spreadsheetId`, { method: 'GET' });
            return true;
        } catch (e) {
            return false;
        }
    }

    async ensureSpreadsheet() {
        if (this.isConnected() && await this.spreadsheetExists()) {
            return localStorage.getItem(KEYS.spreadsheetId);
        }

        // Libre borrado o cuenta distinta: se empieza de cero sin perder el historial local.
        localStorage.removeItem(KEYS.spreadsheetId);
        localStorage.removeItem(KEYS.spreadsheetUrl);
        return this.createSpreadsheet();
    }

    async appendValues(sheet, rows) {
        const id = localStorage.getItem(KEYS.spreadsheetId);
        const range = `'${sheet}'!A1`;
        const url = `/${id}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

        for (const chunk of chunkRows(rows)) {
            await this.api(url, {
                method: 'POST',
                body: JSON.stringify({ values: chunk })
            });
        }
    }

    /* ----------------------------- acciones ----------------------------- */

    /** Conecta con Google y prepara el libro. Devuelve la URL de la hoja. */
    async connect() {
        await this.requestToken(true);
        await this.ensureSpreadsheet();
        return this.spreadsheetUrl();
    }

    /**
     * Sube los turnos que aún no están en la hoja.
     * @param {Array} sessions Historias completas del dispositivo.
     * @returns {Promise<{appended:number, total:number, url:string, spreadsheetId:string}>}
     */
    async sync(sessions) {
        if (!this.isConfigured()) {
            throw new Error('Falta configurar el ID de cliente de Google (ver docs/drive-setup.md).');
        }

        await this.requestToken(true);
        const spreadsheetId = await this.ensureSpreadsheet();

        const pending = pendingSessions(sessions, this.syncedIds());
        if (pending.length > 0) {
            await this.appendValues(SHEET_TURNOS, pending.map(sessionRow));
            await this.appendValues(SHEET_DETALLE, pending.flatMap(entryRows));

            const synced = new Set(this.syncedIds());
            pending.forEach(s => synced.add(s.id));
            localStorage.setItem(KEYS.syncedIds, JSON.stringify([...synced]));
        }

        return {
            appended: pending.length,
            total: (sessions || []).length,
            url: this.spreadsheetUrl(),
            spreadsheetId
        };
    }

    /** Desvincula la cuenta en este dispositivo (no borra el archivo de Drive). */
    async disconnect() {
        await this.revoke();
        localStorage.removeItem(KEYS.spreadsheetId);
        localStorage.removeItem(KEYS.spreadsheetUrl);
        localStorage.removeItem(KEYS.syncedIds);
        localStorage.removeItem(KEYS.connectedAt);
    }
}

export const driveSync = new DriveSync();
