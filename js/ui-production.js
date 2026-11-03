import { store } from './store.js';
import { Calculator } from './calculator.js';
import { formatNumber } from './format.js';
import { ThemeManager } from './theme.js';

/**
 * Pantalla del turno: el operario cuenta palets, filas y paquetes y ve al
 * instante su eficiencia y lo que le falta para cerrar el turno al 100%.
 * Todo se recalcula en el dispositivo, sin botones intermedios.
 */
export class ProductionUI {
    constructor() {
        this.container = document.getElementById('tab-produccion');
        this.activeTemplateId = null;
        this.addedEntries = [];
        this.lastSessionState = null;
        this.allOptions = [];
        this.themeManager = new ThemeManager();

        this.init();
    }

    init() {
        if (!this.container) return;

        window.addEventListener('template-selected', (e) => {
            this.activeTemplateId = e.detail.id;
            this.addedEntries = [];
            this.lastSessionState = null;
            this.themeManager.applyProductionTheme();
            this.render();
        });
    }

    /* ------------------------------------------------------------------ */
    /* Render                                                              */
    /* ------------------------------------------------------------------ */

    render() {
        if (!this.activeTemplateId) {
            this.themeManager.clearTemplateTheme();
            this.renderEmptyState();
            return;
        }

        const tpl = store.getTemplate(this.activeTemplateId);
        if (!tpl) {
            this.activeTemplateId = null;
            this.themeManager.clearTemplateTheme();
            this.renderEmptyState();
            return;
        }

        // La línea puede tener su propio color
        if (tpl.theme) {
            this.themeManager.applyTemplateTheme(tpl.theme);
        }

        this.buildOptions(tpl);

        const isMeters = tpl.efficiencyType === 'meters_per_hour';
        const unitLabel = isMeters ? 'm/h' : 'pz/h';
        const effText = tpl.enableEfficiency === false
            ? 'Solo recuento de piezas'
            : `${this.fmt(tpl.expectedEfficiency, 0)} ${unitLabel} al 100%`;

        this.container.innerHTML = `
            <div class="prod-grid">
                <div class="prod-main">
                    <header class="page-head">
                        <div>
                            <h1>${this.escapeHtml(tpl.name)}</h1>
                            <div class="meta">
                                <span>${effText}</span>
                                <span class="sep">·</span>
                                <span>${tpl.models.length} modelo${tpl.models.length === 1 ? '' : 's'} en la línea</span>
                                <span class="sep">·</span>
                                <span>turno de <b id="shift-label">8 h</b></span>
                            </div>
                        </div>
                        <button class="btn btn-ghost" id="btn-change-tpl">Cambiar línea</button>
                    </header>

                    <section class="hero" id="hero" aria-live="polite">
                        <div class="hero-main">
                            <span class="hero-lab">Eficiencia</span>
                            <div class="hero-num"><span id="res-eff">0</span><em>%</em></div>
                            <p class="hero-sub" id="hero-sub">Aún no has contado nada de este turno.</p>
                            <div class="hero-bar"><span id="hero-bar-fill"></span><i></i></div>
                            <div class="hero-bar-l"><span>0%</span><span>100%</span></div>
                        </div>
                        <div class="hero-stats">
                            <div>
                                <span>Piezas</span>
                                <b id="res-pieces">0</b>
                            </div>
                            <div class="vsep"></div>
                            <div>
                                <span>Tiempo teórico</span>
                                <b id="res-theo">0,00<small>h</small></b>
                            </div>
                        </div>
                    </section>

                    <section class="card entries-card">
                        <div class="card-h">
                            <h2>Lo que llevas hecho</h2>
                            <span class="hint">Toca − / + al terminar cada palet</span>
                        </div>

                        <div class="search-picklist" id="picklist-container">
                            <input type="text" id="search-model" placeholder="Buscar modelo o medida..." autocomplete="off" aria-label="Buscar modelo o medida">
                            <div class="picklist-dropdown" id="picklist-dropdown"></div>
                        </div>

                        <div id="prod-entries-list"></div>
                    </section>

                    <div class="shiftbar" id="shift-time-section" ${tpl.enableEfficiency === false ? 'style="display:none"' : ''}>
                        <div>
                            <span class="label">Duración del turno</span>
                            <div class="value"><span id="shift-summary">8 h</span> · objetivo <span id="shift-target">—</span></div>
                        </div>
                        <div class="shift-selects">
                            <div>
                                <label for="prod-hours">Horas</label>
                                <select id="prod-hours">
                                    <option value="1">1 h</option>
                                    <option value="2">2 h</option>
                                    <option value="3">3 h</option>
                                    <option value="4">4 h</option>
                                    <option value="5">5 h</option>
                                    <option value="6">6 h</option>
                                    <option value="7">7 h</option>
                                    <option value="8" selected>8 h</option>
                                </select>
                            </div>
                            <div>
                                <label for="prod-minutes">Minutos</label>
                                <select id="prod-minutes">
                                    <option value="0">0 min</option>
                                    <option value="0.25">+15 min</option>
                                    <option value="0.5">+30 min</option>
                                    <option value="0.75">+45 min</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <aside class="rail">
                    <div class="card">
                        <div class="card-h">
                            <h2>Te falta para el 100%</h2>
                            <span class="hint" id="miss-target">—</span>
                        </div>
                        <div class="card-body" style="padding: 12px 16px 14px;">
                            <div id="miss-list"></div>
                            <details class="target-detail" style="border-top: none; padding: 0; margin-top: 6px;">
                                <summary class="helper" style="cursor: pointer; color: var(--accent-secondary);">Ver desglose de palets, filas y paquetes</summary>
                                <div id="target-breakdown" style="margin-top: 10px;"></div>
                            </details>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body" style="padding: 14px 16px 16px;">
                            <button class="btn btn-primary" id="btn-save-prod" disabled>Guardar turno</button>
                            <p class="helper" style="text-align: center; margin-top: 10px;">Se guarda en el historial de este dispositivo.</p>
                        </div>
                    </div>
                </aside>
            </div>
        `;

        this.bindEvents(tpl);
        this.renderEntries();
        this.calculate();
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <header class="page-head">
                <div>
                    <h1>Registro del turno</h1>
                    <div class="meta">Elige una línea en <b>Mis líneas</b> para empezar a contar.</div>
                </div>
            </header>
            <div class="card">
                <div class="empty">
                    Todavía no has elegido línea.<br>
                    <b>Mis líneas</b> → toca el nombre de tu perfiladora.
                </div>
                <div class="card-body" style="border-top: 1px solid var(--line);">
                    <button class="btn btn-secondary" id="btn-go-templates">Ir a Mis líneas</button>
                </div>
            </div>
        `;
        const btn = document.getElementById('btn-go-templates');
        if (btn) {
            btn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'tab-plantillas' } }));
            });
        }
    }

    buildOptions(tpl) {
        this.allOptions = [];
        tpl.models.forEach(m => {
            const measures = m.measures || [{ id: crypto.randomUUID(), lengthMm: m.lengthMm }];
            measures.forEach(ms => {
                this.allOptions.push({
                    modelId: m.id,
                    measureId: ms.id,
                    modelName: m.name,
                    lengthMm: ms.lengthMm,
                    piecesPerPallet: m.piecesPerPallet || 480,
                    piecesPerPackage: m.piecesPerPackage || 120,
                    piecesPerRow: m.piecesPerRow || 24
                });
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /* Eventos                                                             */
    /* ------------------------------------------------------------------ */

    bindEvents(tpl) {
        document.getElementById('btn-change-tpl').addEventListener('click', () => {
            this.activeTemplateId = null;
            this.addedEntries = [];
            this.render();
            window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'tab-plantillas' } }));
        });

        const searchInput = document.getElementById('search-model');
        const dropdown = document.getElementById('picklist-dropdown');

        searchInput.addEventListener('focus', () => this.filterPicklist(''));
        searchInput.addEventListener('input', (e) => this.filterPicklist(e.target.value));

        this._outsideClick = (e) => {
            if (!e.target.closest('#picklist-container')) {
                dropdown.classList.remove('visible');
            }
        };
        document.addEventListener('click', this._outsideClick);

        document.getElementById('prod-hours').addEventListener('change', () => this.calculate());
        document.getElementById('prod-minutes').addEventListener('change', () => this.calculate());

        const saveBtn = document.getElementById('btn-save-prod');
        saveBtn.addEventListener('click', () => this.saveSession(tpl));
    }

    filterPicklist(query) {
        const dropdown = document.getElementById('picklist-dropdown');
        const q = (query || '').toLowerCase().trim();

        const filtered = this.allOptions.filter(opt => {
            const text = `${opt.modelName} ${opt.lengthMm}`.toLowerCase();
            return text.includes(q);
        });

        if (filtered.length === 0) {
            dropdown.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:12.5px;">Sin resultados</div>`;
        } else {
            dropdown.innerHTML = filtered.map((opt, i) => `
                <div class="picklist-option" data-index="${i}">
                    <span class="opt-name">${this.escapeHtml(opt.modelName)}</span>
                    <span class="opt-measure">${this.fmt(opt.lengthMm, 0)} mm · ${this.fmt(opt.piecesPerPallet, 0)} pz/palet</span>
                </div>
            `).join('');

            dropdown.querySelectorAll('.picklist-option').forEach(el => {
                el.addEventListener('click', () => {
                    const opt = filtered[parseInt(el.dataset.index, 10)];
                    this.addEntry(opt);
                    dropdown.classList.remove('visible');
                    document.getElementById('search-model').value = '';
                });
            });
        }

        dropdown.classList.add('visible');
    }

    addEntry(opt) {
        this.addedEntries.push({
            uid: crypto.randomUUID(),
            modelId: opt.modelId,
            measureId: opt.measureId,
            modelName: opt.modelName,
            lengthMm: opt.lengthMm,
            piecesPerPallet: opt.piecesPerPallet,
            piecesPerPackage: opt.piecesPerPackage || 120,
            piecesPerRow: opt.piecesPerRow || 24,
            pallets: 0,
            pieces: 0,
            rows: 0
        });
        this.renderEntries();
        this.calculate();
    }

    /* ------------------------------------------------------------------ */
    /* Recuento en pantalla                                                */
    /* ------------------------------------------------------------------ */

    entryPieces(entry) {
        return (entry.pallets * entry.piecesPerPallet)
            + (entry.pieces * entry.piecesPerPackage)
            + (entry.rows * entry.piecesPerRow);
    }

    renderEntries() {
        const list = document.getElementById('prod-entries-list');
        if (!list) return;

        if (this.addedEntries.length === 0) {
            list.innerHTML = `
                <div class="empty" style="padding: 22px 18px;">
                    Busca arriba el modelo que estás pasando<br>y añádelo para empezar a contar.
                </div>`;
            return;
        }

        list.innerHTML = this.addedEntries.map((entry, i) => {
            const pieces = this.entryPieces(entry);
            const meters = (entry.lengthMm / 1000) * pieces;
            return `
            <div class="prod-entry-card" data-uid="${entry.uid}">
                <div class="entry-info">
                    <div class="entry-head">
                        <span class="entry-name">${this.escapeHtml(entry.modelName)}</span>
                        <span class="entry-measure">${this.fmt(entry.lengthMm, 0)} mm</span>
                    </div>
                    <div class="entry-meta">
                        <span><b data-entry-pieces>${this.fmt(pieces, 0)}</b> pz</span>
                        <span><b data-entry-meters>${this.fmt(meters, 2)}</b> m</span>
                        <span>${this.fmt(entry.piecesPerPallet, 0)} pz/palet · ${this.fmt(entry.piecesPerRow, 0)} pz/fila</span>
                    </div>
                </div>
                <div class="entry-controls">
                    <div class="entry-field">
                        <label>Palets</label>
                        <div class="stepper">
                            <button type="button" data-step="-1" data-field="pallets" data-index="${i}" aria-label="Un palet menos">−</button>
                            <input type="number" class="entry-pallets" data-index="${i}" value="${entry.pallets}" min="0" step="1" inputmode="numeric" aria-label="Palets">
                            <button type="button" data-step="1" data-field="pallets" data-index="${i}" aria-label="Un palet más">+</button>
                        </div>
                    </div>
                    <div class="entry-field">
                        <label>Filas</label>
                        <div class="stepper">
                            <button type="button" data-step="-1" data-field="rows" data-index="${i}" aria-label="Una fila menos">−</button>
                            <input type="number" class="entry-rows" data-index="${i}" value="${entry.rows || 0}" min="0" step="1" inputmode="numeric" aria-label="Filas">
                            <button type="button" data-step="1" data-field="rows" data-index="${i}" aria-label="Una fila más">+</button>
                        </div>
                    </div>
                    <div class="entry-field">
                        <label>Paquetes</label>
                        <div class="stepper">
                            <button type="button" data-step="-1" data-field="pieces" data-index="${i}" aria-label="Un paquete menos">−</button>
                            <input type="number" class="entry-pieces" data-index="${i}" value="${entry.pieces || 0}" min="0" step="1" inputmode="numeric" aria-label="Paquetes">
                            <button type="button" data-step="1" data-field="pieces" data-index="${i}" aria-label="Un paquete más">+</button>
                        </div>
                    </div>
                    <button type="button" class="btn-icon remove-entry" data-index="${i}" title="Quitar del turno" aria-label="Quitar ${this.escapeHtml(entry.modelName)} del turno">✕</button>
                </div>
            </div>`;
        }).join('');

        // Campos numéricos: escribir a mano también recalcula
        list.querySelectorAll('.entry-pallets, .entry-rows, .entry-pieces').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                const value = Math.max(0, parseFloat(e.target.value) || 0);
                const entry = this.addedEntries[idx];
                if (!entry) return;

                if (e.target.classList.contains('entry-pallets')) entry.pallets = value;
                if (e.target.classList.contains('entry-rows')) entry.rows = value;
                if (e.target.classList.contains('entry-pieces')) entry.pieces = value;

                this.refreshEntryNumbers(idx);
                this.calculate();
            });
        });

        // Botones − / +
        list.querySelectorAll('[data-step]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                const field = e.currentTarget.dataset.field;
                const delta = parseInt(e.currentTarget.dataset.step, 10);
                const entry = this.addedEntries[idx];
                if (!entry) return;

                entry[field] = Math.max(0, (entry[field] || 0) + delta);
                const input = e.currentTarget.parentElement.querySelector('input');
                if (input) input.value = entry[field];
                this.refreshEntryNumbers(idx);
                this.calculate();
            });
        });

        list.querySelectorAll('.remove-entry').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                this.addedEntries.splice(idx, 1);
                this.renderEntries();
                this.calculate();
            });
        });
    }

    /** Actualiza las cifras de una fila sin volver a pintar todo el listado. */
    refreshEntryNumbers(idx) {
        const entry = this.addedEntries[idx];
        const card = document.querySelector(`.prod-entry-card[data-uid="${entry.uid}"]`);
        if (!card) return;

        const pieces = this.entryPieces(entry);
        const piecesEl = card.querySelector('[data-entry-pieces]');
        const metersEl = card.querySelector('[data-entry-meters]');
        if (piecesEl) piecesEl.textContent = this.fmt(pieces, 0);
        if (metersEl) metersEl.textContent = this.fmt((entry.lengthMm / 1000) * pieces, 2);
    }

    /* ------------------------------------------------------------------ */
    /* Cálculo en vivo                                                     */
    /* ------------------------------------------------------------------ */

    shiftHours() {
        const hours = parseFloat(document.getElementById('prod-hours')?.value) || 0;
        const minutes = parseFloat(document.getElementById('prod-minutes')?.value) || 0;
        return hours + minutes;
    }

    calculate() {
        if (!this.activeTemplateId) return;
        const tpl = store.getTemplate(this.activeTemplateId);
        if (!tpl) return;

        const shiftHours = this.shiftHours();
        const entries = this.addedEntries
            .filter(e => e.pallets > 0 || e.pieces > 0 || e.rows > 0)
            .map(e => ({
                modelId: e.modelId,
                modelName: e.modelName,
                lengthMm: e.lengthMm,
                pallets: e.pallets,
                pieces: this.entryPieces(e)
            }));

        this.updateShiftLabels(tpl, shiftHours);

        // Hero + resumen
        const totalPieces = this.addedEntries.reduce((sum, e) => sum + this.entryPieces(e), 0);
        const totalMeters = this.addedEntries.reduce((sum, e) => sum + (e.lengthMm / 1000) * this.entryPieces(e), 0);
        const enableEff = tpl.enableEfficiency !== false;

        let eff = 0;
        let theoretical = 0;
        if (enableEff && entries.length > 0) {
            const result = Calculator.runSession(tpl, entries, shiftHours);
            eff = result.efficiency;
            theoretical = result.theoreticalTime;
        }

        const effEl = document.getElementById('res-eff');
        const piecesEl = document.getElementById('res-pieces');
        const theoEl = document.getElementById('res-theo');
        const subEl = document.getElementById('hero-sub');
        const barEl = document.getElementById('hero-bar-fill');

        if (effEl) effEl.textContent = this.fmt(eff, 1, 1);
        if (piecesEl) piecesEl.textContent = this.fmt(totalPieces, 0);
        if (theoEl) theoEl.innerHTML = `${this.fmt(theoretical, 2, 2)}<small>h</small>`;
        if (barEl) barEl.style.width = `${Math.min(100, Math.max(0, eff))}%`;

        if (subEl) {
            const target = Calculator.targetForShift(tpl, shiftHours);
            if (!enableEff) {
                subEl.innerHTML = `Llevas <b>${this.fmt(totalPieces, 0)} pz</b> · ${this.fmt(totalMeters, 2)} m`;
            } else if (entries.length === 0) {
                subEl.innerHTML = `Aún no has contado nada · objetivo del turno <b>${this.fmt(target.totalProduced, 0)} ${target.unit}</b>`;
            } else {
                const produced = tpl.efficiencyType === 'meters_per_hour' ? totalMeters : totalPieces;
                subEl.innerHTML = `Llevas <b>${this.fmt(produced, 0)} ${target.unit}</b> de ${this.fmt(target.totalProduced, 0)} ${target.unit} del turno`;
            }
        }

        // Columna derecha
        this.renderMissing(tpl, shiftHours);

        const saveBtn = document.getElementById('btn-save-prod');
        if (saveBtn) saveBtn.disabled = entries.length === 0;

        this.lastSessionState = {
            result: enableEff
                ? Calculator.runSession(tpl, entries, shiftHours)
                : { totalPieces, totalMeters, efficiency: null, theoreticalTime: null },
            entries,
            shiftHours
        };
    }

    updateShiftLabels(tpl, shiftHours) {
        const target = Calculator.targetForShift(tpl, shiftHours);
        const hours = Math.floor(shiftHours);
        const minutes = Math.round((shiftHours - hours) * 60);
        const text = minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;

        const summary = document.getElementById('shift-summary');
        const label = document.getElementById('shift-label');
        const targetEl = document.getElementById('shift-target');
        if (summary) summary.textContent = text;
        if (label) label.textContent = text;
        if (targetEl) targetEl.textContent = `${this.fmt(target.totalProduced, 0)} ${target.unit}`;

        const missTarget = document.getElementById('miss-target');
        if (missTarget) {
            const produced = tpl.efficiencyType === 'meters_per_hour'
                ? this.addedEntries.reduce((sum, e) => sum + (e.lengthMm / 1000) * this.entryPieces(e), 0)
                : this.addedEntries.reduce((sum, e) => sum + this.entryPieces(e), 0);
            const remaining = Math.max(0, target.totalProduced - produced);
            missTarget.innerHTML = `<b style="color: var(--text-main)">${this.fmt(remaining, 0)} ${target.unit}</b> restantes`;
        }
    }

    /** "Te falta para el 100%": palets, filas y paquetes que aún hay que contar. */
    renderMissing(tpl, shiftHours) {
        const listEl = document.getElementById('miss-list');
        const breakdownEl = document.getElementById('target-breakdown');
        if (!listEl) return;

        if (tpl.enableEfficiency === false) {
            listEl.innerHTML = `<p class="helper" style="margin:0;">Esta línea solo cuenta piezas: no hay objetivo que calcular.</p>`;
            if (breakdownEl) breakdownEl.innerHTML = '';
            return;
        }

        if (this.addedEntries.length === 0) {
            listEl.innerHTML = `<p class="helper" style="margin:0;">Añade un modelo y empieza a contar: aquí verás lo que te falta palet a palet.</p>`;
            if (breakdownEl) breakdownEl.innerHTML = '';
            return;
        }

        const target = Calculator.targetForShift(tpl, shiftHours);
        const isMeters = tpl.efficiencyType === 'meters_per_hour';

        const rows = [];
        const details = [];

        this.addedEntries.forEach(entry => {
            const lengthM = entry.lengthMm / 1000;
            const required = isMeters
                ? Math.round(target.totalProduced / lengthM)
                : Math.round(target.totalProduced);
            const produced = this.entryPieces(entry);
            const rem = Calculator.remainingForTarget(required, produced, entry);

            const zero = (n) => (n === 0 ? 'zero' : '');
            rows.push(`
                <div class="miss-row" title="Faltan ${this.fmt(rem.missingPieces, 0)} piezas">
                    <span class="name">${this.escapeHtml(entry.modelName)} · ${this.fmt(entry.lengthMm, 0)} mm</span>
                    <span class="qty">
                        <span class="${zero(rem.pallets)}">${this.fmt(rem.pallets, 0)}<i>pal</i></span>
                        <span class="${zero(rem.rows)}">${this.fmt(rem.rows, 0)}<i>fil</i></span>
                        <span class="${zero(rem.packages)}">${this.fmt(rem.packages, 0)}<i>paq</i></span>
                    </span>
                </div>`);

            details.push(`
                <div class="model-line">
                    <div class="m-name">${this.escapeHtml(entry.modelName)} · ${this.fmt(entry.lengthMm, 0)} mm</div>
                    <div class="m-math">
                        ${this.fmt(rem.pallets, 0)} × ${this.fmt(entry.piecesPerPallet, 0)} +
                        ${this.fmt(rem.rows, 0)} × ${this.fmt(entry.piecesPerRow, 0)} +
                        ${this.fmt(rem.packages, 0)} × ${this.fmt(entry.piecesPerPackage, 0)}
                        = ${this.fmt(rem.totalPieces, 0)} pz
                    </div>
                </div>`);
        });

        listEl.innerHTML = rows.join('') +
            `<p class="miss-note">Cada fila es lo que faltaría si el turno fuese solo de ese modelo. El reparto real lo marca el pedido.</p>`;

        if (breakdownEl) breakdownEl.innerHTML = details.join('');
    }

    /* ------------------------------------------------------------------ */
    /* Guardado                                                            */
    /* ------------------------------------------------------------------ */

    saveSession(tpl) {
        if (!this.lastSessionState || this.lastSessionState.entries.length === 0) {
            return;
        }

        const session = {
            templateId: tpl.id,
            templateName: tpl.name,
            efficiencyType: tpl.efficiencyType,
            expectedEfficiency: tpl.expectedEfficiency,
            date: new Date().toISOString(),
            shiftHours: this.lastSessionState.shiftHours,
            entries: this.lastSessionState.entries,
            efficiency: this.lastSessionState.result.efficiency,
            totalMeters: this.lastSessionState.result.totalMeters,
            totalPieces: this.lastSessionState.result.totalPieces,
            theoreticalTime: this.lastSessionState.result.theoreticalTime
        };

        store.saveSession(session);

        const btn = document.getElementById('btn-save-prod');
        if (btn) {
            btn.textContent = '✓ Turno guardado';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = 'Guardar turno';
                btn.disabled = false;
                window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'tab-historial' } }));
            }, 900);
        }
    }

    /* ------------------------------------------------------------------ */
    /* Utilidades                                                          */
    /* ------------------------------------------------------------------ */

    fmt(value, minDecimals = 0, maxDecimals = minDecimals) {
        return formatNumber(value, minDecimals, maxDecimals);
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
