import { store } from './store.js';
import { Calculator } from './calculator.js';

export class ProductionUI {
    constructor() {
        this.container = document.getElementById('tab-produccion');
        this.activeTemplateId = null;
        this.addedEntries = [];
        this.lastSessionState = null;
        this.allOptions = [];
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        window.addEventListener('template-selected', (e) => {
            this.activeTemplateId = e.detail.id;
            this.addedEntries = [];
            this.render();
        });
    }

    render() {
        if (!this.activeTemplateId) {
            this.container.innerHTML = `
                <h2 class="subtitle" style="margin-bottom: 16px;">Registro Diario</h2>
                <div class="card" style="text-align: center; padding: 40px; color: var(--text-dim);">
                    <p>Ve a <strong>Plantillas</strong> y selecciona una para empezar.</p>
                </div>
            `;
            return;
        }

        const tpl = store.getTemplate(this.activeTemplateId);
        if (!tpl) {
            this.activeTemplateId = null;
            this.render();
            return;
        }

        this.allOptions = [];
        tpl.models.forEach(m => {
            const measures = m.measures || [{ id: crypto.randomUUID(), lengthMm: m.lengthMm }];
            measures.forEach(ms => {
                this.allOptions.push({
                    modelId: m.id,
                    measureId: ms.id,
                    modelName: m.name,
                    lengthMm: ms.lengthMm,
                    piecesPerPallet: m.piecesPerPallet || 480
                });
            });
        });

        const effTypeStr = tpl.efficiencyType === 'pieces_per_hour' ? 'Piezas/hora' : 'Metros/hora';

        this.container.innerHTML = `
            <div class="section">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border-subtle);">
                    <div>
                        <h2 class="subtitle" style="color:var(--text-main); font-size:16px; margin:0;">${this.escapeHtml(tpl.name)}</h2>
                        <div style="font-size:12px; color:var(--text-dim); margin-top:4px;">
                            ${effTypeStr} · Objetivo: ${tpl.expectedEfficiency}
                        </div>
                    </div>
                    <button class="btn-icon" id="btn-change-tpl" style="color:var(--accent-primary);" title="Cambiar Plantilla">🔄</button>
                </div>

                <span class="section-title">Añadir Modelo a Producción</span>
                <div class="search-picklist" id="picklist-container">
                    <input type="text" id="search-model" placeholder="Buscar modelo o medida..." autocomplete="off">
                    <div class="picklist-dropdown" id="picklist-dropdown"></div>
                </div>

                <span class="section-title">Producción del Turno (<span id="entries-count">0</span> entradas)</span>
                <div id="prod-entries-list" style="margin-bottom:24px;">
                    <div style="text-align:center; padding:16px; color:var(--text-dim); font-size:13px;">
                        Usa el buscador de arriba para añadir modelos.
                    </div>
                </div>

                <div id="shift-time-section" style="${tpl.enableEfficiency !== false ? '' : 'display: none;'}">
                    <div style="padding-top:16px; border-top:1px solid var(--border-subtle);">
                        <span class="section-title">Horas del Turno</span>
                        <div style="display:flex; gap:16px; margin-bottom:12px;">
                            <div style="flex:1;">
                                <label style="font-size:12px; color:var(--text-dim); margin-bottom:4px; display:block;">Horas</label>
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
                            <div style="flex:1;">
                                <label style="font-size:12px; color:var(--text-dim); margin-bottom:4px; display:block;">Minutos</label>
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
                
                <div style="margin-top:32px;">
                    <button class="btn btn-primary" id="btn-calc-prod" style="width:100%; margin-bottom:12px;">📐 Calcular Eficiencia</button>
                    <button class="btn btn-secondary" id="btn-save-prod" style="width:100%; display:none;">💾 Guardar Sesión</button>
                </div>
                
                <div id="prod-results" style="display:none; margin-top:32px; background:var(--input-bg); padding:20px; border-radius:var(--border-radius); border:1px solid var(--border-subtle);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <span style="color:var(--text-dim); font-weight:700;">Total Piezas:</span>
                        <span id="res-pieces" style="font-weight:900;">0</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <span style="color:var(--text-dim); font-weight:700;">Total Metros:</span>
                        <span id="res-meters" style="font-weight:900;">0.00</span>
                    </div>
                    <div id="res-theo-container" style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <span style="color:var(--text-dim); font-weight:700;">Tiempo Teórico:</span>
                        <span id="res-theo" style="font-weight:900;">0.00 h</span>
                    </div>
                    <div id="eff-card" style="margin-top:24px; text-align:center; padding:24px; border-radius:16px; background:var(--card-bg);">
                        <div style="font-size:14px; font-weight:700; text-transform:uppercase; margin-bottom:8px;">Eficiencia del Turno</div>
                        <div style="font-size:48px; font-weight:900;"><span id="res-eff">0</span>%</div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(tpl);
        this.renderEntries();
    }

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
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#picklist-container')) {
                dropdown.classList.remove('visible');
            }
        });

        document.getElementById('btn-calc-prod').addEventListener('click', () => this.calculate());
        document.getElementById('btn-save-prod').addEventListener('click', () => this.saveSession(tpl));
    }

    filterPicklist(query) {
        const dropdown = document.getElementById('picklist-dropdown');
        const q = query.toLowerCase().trim();

        const filtered = this.allOptions.filter(opt => {
            const text = `${opt.modelName} ${opt.lengthMm}`.toLowerCase();
            return text.includes(q);
        });

        if (filtered.length === 0) {
            dropdown.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:13px;">Sin resultados</div>`;
        } else {
            dropdown.innerHTML = filtered.map((opt, i) => `
                <div class="picklist-option" data-index="${i}">
                    <span class="opt-name">${this.escapeHtml(opt.modelName)}</span>
                    <span class="opt-measure">${opt.lengthMm} mm · ${opt.piecesPerPallet} pz/palet</span>
                </div>
            `).join('');

            dropdown.querySelectorAll('.picklist-option').forEach(el => {
                el.addEventListener('click', () => {
                    const opt = filtered[parseInt(el.dataset.index)];
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
            pallets: 0
        });
        this.renderEntries();
    }

    renderEntries() {
        const list = document.getElementById('prod-entries-list');
        const countEl = document.getElementById('entries-count');
        if (countEl) countEl.textContent = this.addedEntries.length;

        if (this.addedEntries.length === 0) {
            list.innerHTML = `
                <div style="text-align:center; padding:16px; color:var(--text-dim); font-size:13px;">
                    Usa el buscador de arriba para añadir modelos.
                </div>`;
            return;
        }

        list.innerHTML = this.addedEntries.map((entry, i) => `
            <div class="prod-entry-card" data-uid="${entry.uid}">
                <div class="entry-info">
                    <div style="font-weight:700; font-size:14px;">${this.escapeHtml(entry.modelName)}</div>
                    <div style="font-size:11px; color:var(--text-dim);">${entry.lengthMm} mm · ${entry.piecesPerPallet} pz/palet</div>
                </div>
                <div>
                    <label style="font-size:10px; display:block; text-align:center; margin-bottom:2px;">Palets</label>
                    <input type="number" class="entry-pallets" data-index="${i}" value="${entry.pallets}" min="0" step="1" inputmode="numeric">
                </div>
                <button class="btn-icon remove-entry" data-index="${i}" style="font-size:16px;">✕</button>
            </div>
        `).join('');

        list.querySelectorAll('.entry-pallets').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.addedEntries[idx].pallets = parseFloat(e.target.value) || 0;
            });
        });

        list.querySelectorAll('.remove-entry').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                this.addedEntries.splice(idx, 1);
                this.renderEntries();
            });
        });
    }

    calculate() {
        if (!this.activeTemplateId) return;
        const tpl = store.getTemplate(this.activeTemplateId);

        const entries = this.addedEntries
            .filter(e => e.pallets > 0)
            .map(e => ({
                modelId: e.modelId,
                modelName: e.modelName,
                lengthMm: e.lengthMm,
                pallets: e.pallets,
                pieces: e.pallets * e.piecesPerPallet
            }));

        if (entries.length === 0) {
            document.getElementById('prod-results').style.display = 'none';
            document.getElementById('btn-save-prod').style.display = 'none';
            return;
        }

        document.getElementById('prod-results').style.display = 'block';
        document.getElementById('btn-save-prod').style.display = 'block';

        document.getElementById('res-pieces').textContent = entries.reduce((sum, e) => sum + e.pieces, 0).toLocaleString();
        document.getElementById('res-meters').textContent = entries.reduce((sum, e) => sum + (e.lengthMm * e.pieces / 1000), 0).toFixed(2);

        // Show/hide efficiency fields based on template setting
        const enableEff = tpl.enableEfficiency !== false;
        document.getElementById('res-theo-container').style.display = enableEff ? 'flex' : 'none';
        document.getElementById('eff-card').style.display = enableEff ? 'block' : 'none';

        let shiftHours = 0;
        let result;
        
        if (enableEff) {
            const hours = parseFloat(document.getElementById('prod-hours').value) || 8;
            const minutes = parseFloat(document.getElementById('prod-minutes').value) || 0;
            shiftHours = hours + minutes;
            
            result = Calculator.runSession(tpl, entries, shiftHours);
            document.getElementById('res-theo').textContent = result.theoreticalTime + ' h';
            document.getElementById('res-eff').textContent = result.efficiency;

            const effCard = document.getElementById('eff-card');
            if (result.efficiency >= 100) {
                effCard.style.backgroundColor = 'var(--success)';
            } else if (result.efficiency >= 80) {
                effCard.style.backgroundColor = 'var(--accent-secondary)';
            } else {
                effCard.style.backgroundColor = 'var(--danger)';
            }
            effCard.style.color = '#fff';
        } else {
            result = { totalPieces: entries.reduce((sum, e) => sum + e.pieces, 0) };
        }

        this.lastSessionState = { result, entries, shiftHours };
    }

    saveSession(tpl) {
        if (!this.lastSessionState || this.lastSessionState.entries.length === 0) {
            alert('Calcula primero la producción antes de guardar.');
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
        btn.textContent = '✓ Sesión Guardada';
        btn.style.backgroundColor = 'var(--success)';
        setTimeout(() => {
            btn.textContent = '💾 Guardar Sesión';
            btn.style.backgroundColor = '';
            window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'tab-historial' } }));
        }, 1500);
    }

    escapeHtml(unsafe) {
        return (unsafe || '').replace(/[&<"']/g, m => {
            switch (m) {
                case '&': return '&';
                case '<': return '<';
                case '"': return '"';
                default: return '&#039;';
            }
        });
    }
}
