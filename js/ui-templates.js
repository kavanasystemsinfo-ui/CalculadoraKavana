import { store } from './store.js';
import { formatNumber } from './format.js';

export class TemplatesUI {
    constructor() {
        this.listContainer = document.getElementById('lista-plantillas');
        this.btnNueva = document.getElementById('btn-nueva-plantilla');
        this.modal = document.getElementById('modal-plantilla');
        this.form = document.getElementById('form-plantilla');
        this.btnCancel = document.getElementById('btn-cancel-tpl');
        this.btnClose = document.getElementById('btn-close-tpl');
        this.btnAddModel = document.getElementById('btn-add-model');
        this.modelsContainer = document.getElementById('modelos-container');

        this.init();
    }

    init() {
        if (!this.listContainer) return;

        this.btnNueva.addEventListener('click', () => this.openModal());
        this.btnCancel.addEventListener('click', () => this.closeModal());
        if (this.btnClose) this.btnClose.addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.btnAddModel.addEventListener('click', () => this.addModelBlock());

        // Cerrar al tocar el fondo y con Escape
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') this.closeModal();
        });

        this.renderList();
    }

    renderList() {
        const templates = store.getTemplates();

        if (templates.length === 0) {
            this.listContainer.innerHTML = `
                <div class="card">
                    <div class="empty">
                        Todavía no tienes ninguna línea.<br>
                        Crea la primera con <b>+ Nueva línea</b>: nombre, objetivo de la hora y modelos que hace.
                    </div>
                </div>`;
            return;
        }

        this.listContainer.innerHTML = `<div class="templates-grid">${templates.map(tpl => {
            const totalMeasures = tpl.models.reduce((sum, m) => sum + (m.measures ? m.measures.length : 1), 0);
            const measureLabel = tpl.efficiencyType === 'pieces_per_hour' ? 'Piezas/h' : 'Metros/h';
            const effLabel = tpl.enableEfficiency === false
                ? 'Solo recuento'
                : `${measureLabel} · ${this.fmt(tpl.expectedEfficiency, 0)} al 100%`;

            return `
            <div class="list-item" data-id="${tpl.id}">
                <div style="min-width:0;">
                    <h3 class="item-title tpl-title-btn" title="Abrir el turno de esta línea">${this.escapeHtml(tpl.name)}</h3>
                    <div class="item-meta">
                        <span>${effLabel}</span>
                        <span>·</span>
                        <span><b>${tpl.models.length}</b> modelo${tpl.models.length === 1 ? '' : 's'}</span>
                        <span>·</span>
                        <span><b>${totalMeasures}</b> medida${totalMeasures === 1 ? '' : 's'}</span>
                    </div>
                </div>
                <div class="list-actions">
                    <button class="btn-icon btn-edit" data-id="${tpl.id}" title="Editar línea" aria-label="Editar ${this.escapeHtml(tpl.name)}">✎</button>
                    <button class="btn-icon btn-delete" data-id="${tpl.id}" title="Eliminar línea" aria-label="Eliminar ${this.escapeHtml(tpl.name)}">✕</button>
                </div>
            </div>`;
        }).join('')}</div>`;

        this.listContainer.querySelectorAll('.tpl-title-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.closest('.list-item').dataset.id;
                window.dispatchEvent(new CustomEvent('template-selected', { detail: { id } }));
                window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'tab-produccion' } }));
            });
        });

        this.listContainer.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.openModal(e.currentTarget.dataset.id));
        });

        this.listContainer.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteTemplate(e.currentTarget.dataset.id));
        });
    }

    /**
     * Añade un bloque de modelo completo (nombre + pz/palet + lista de medidas).
     */
    addModelBlock(model = null) {
        if (!model) {
            model = {
                id: crypto.randomUUID(),
                name: '',
                piecesPerPallet: null,
                piecesPerPackage: null,
                piecesPerRow: null,
                measures: [{ id: crypto.randomUUID(), lengthMm: '' }]
            };
        }
        // Migración: si el modelo viene del formato antiguo (lengthMm directo), convertir
        if (!model.measures) {
            model.measures = [{ id: crypto.randomUUID(), lengthMm: model.lengthMm || '' }];
        }

        const block = document.createElement('div');
        block.className = 'model-block';
        block.dataset.id = model.id;

        block.innerHTML = `
            <div class="model-header">
                <div class="model-field" style="flex:1;">
                    <label>Modelo</label>
                    <input type="text" class="model-name" placeholder="Perfil C 200" value="${this.escapeAttr(model.name)}" required aria-label="Nombre del modelo">
                </div>
                <div class="model-field pallet">
                    <label>Pz/palet</label>
                    <input type="number" class="model-pallet" placeholder="60" value="${this.escapeAttr(model.piecesPerPallet || '')}" required min="1" aria-label="Piezas por palet">
                </div>
                <button type="button" class="btn-icon remove-model" title="Eliminar modelo" aria-label="Eliminar modelo">✕</button>
            </div>
            <div class="model-subgrid">
                <div class="subfield">
                    <label>Pz/paquete</label>
                    <input type="number" class="model-package" placeholder="Pz/paq" value="${this.escapeAttr(model.piecesPerPackage || '')}" min="1">
                </div>
                <div class="subfield">
                    <label>Paq/fila</label>
                    <input type="number" class="model-row" placeholder="Paq/fila" value="${this.escapeAttr(model.piecesPerRow || '')}" min="1">
                </div>
            </div>
            <div class="measure-legend">Medidas (largo en mm)</div>
            <div class="measures-list"></div>
            <button type="button" class="btn-add-measure">+ Añadir medida</button>
        `;

        block.querySelector('.remove-model').addEventListener('click', () => block.remove());
        block.querySelector('.btn-add-measure').addEventListener('click', () => {
            this.addMeasureRow(block.querySelector('.measures-list'));
        });

        const measuresList = block.querySelector('.measures-list');
        model.measures.forEach(m => this.addMeasureRow(measuresList, m));

        this.modelsContainer.appendChild(block);
    }

    /**
     * Añade una fila de medida dentro de un bloque de modelo.
     */
    addMeasureRow(container, measure = null) {
        if (!measure) {
            measure = { id: crypto.randomUUID(), lengthMm: '' };
        }

        const row = document.createElement('div');
        row.className = 'measure-row';
        row.dataset.id = measure.id;

        row.innerHTML = `
            <span class="measure-bullet">▸</span>
            <input type="number" class="measure-length" placeholder="Largo en mm" value="${this.escapeAttr(measure.lengthMm)}" required min="1" step="any" aria-label="Largo en milímetros">
            <span class="unit">mm</span>
            <button type="button" class="btn-icon remove-measure" aria-label="Quitar medida">✕</button>
        `;

        row.querySelector('.remove-measure').addEventListener('click', () => {
            // No permitir eliminar si es la única medida del modelo
            if (container.querySelectorAll('.measure-row').length > 1) {
                row.remove();
            } else {
                alert('Un modelo debe tener al menos una medida.');
            }
        });

        container.appendChild(row);
    }

    openModal(id = null) {
        this.form.reset();
        this.modelsContainer.innerHTML = '';

        if (id) {
            const tpl = store.getTemplate(id);
            if (tpl) {
                document.getElementById('tpl-id').value = tpl.id;
                document.getElementById('tpl-name').value = tpl.name;
                document.getElementById('tpl-enable-eff').checked = tpl.enableEfficiency !== false;
                document.getElementById('tpl-eff-type').value = tpl.efficiencyType || 'pieces_per_hour';
                document.getElementById('tpl-eff-val').value = tpl.expectedEfficiency || '';
                if (document.getElementById('tpl-theme')) {
                    document.getElementById('tpl-theme').value = tpl.theme || 'blue';
                }

                tpl.models.forEach(m => {
                    // Convertir piecesPerRow a paquetes/fila para la UI
                    const m2 = {...m, piecesPerRow: m.piecesPerPackage ? Math.round(m.piecesPerRow / m.piecesPerPackage) : 0};
                    this.addModelBlock(m2);
                });
            }
        } else {
            document.getElementById('tpl-id').value = '';
            document.getElementById('tpl-enable-eff').checked = true;
            this.addModelBlock();
        }

        this.syncEffFields();
        document.getElementById('tpl-enable-eff').onchange = () => this.syncEffFields();

        this.modal.style.display = 'flex';
        setTimeout(() => document.getElementById('tpl-name').focus(), 60);
    }

    syncEffFields() {
        const effFields = document.getElementById('eff-fields');
        const enableEff = document.getElementById('tpl-enable-eff');
        if (effFields && enableEff) {
            effFields.style.display = enableEff.checked ? 'block' : 'none';
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    handleSubmit(e) {
        e.preventDefault();

        const modelBlocks = this.modelsContainer.querySelectorAll('.model-block');
        const models = Array.from(modelBlocks).map(block => {
            const measureRows = block.querySelectorAll('.measure-row');
            const measures = Array.from(measureRows).map(row => ({
                id: row.dataset.id,
                lengthMm: parseFloat(row.querySelector('.measure-length').value)
            })).filter(m => m.lengthMm > 0);

            const piecesPerPackage = parseInt(block.querySelector('.model-package').value, 10) || 1;
            const paquetesPorFila = parseInt(block.querySelector('.model-row').value, 10) || 0;
            return {
                id: block.dataset.id,
                name: block.querySelector('.model-name').value,
                piecesPerPallet: parseInt(block.querySelector('.model-pallet').value, 10) || null,
                piecesPerPackage: piecesPerPackage,
                piecesPerRow: paquetesPorFila * piecesPerPackage,
                measures: measures
            };
        }).filter(m => m.name && m.measures.length > 0);

        if (models.length === 0) {
            alert('Debes añadir al menos un modelo con al menos una medida.');
            return;
        }

        const enableEff = document.getElementById('tpl-enable-eff').checked;
        const template = {
            id: document.getElementById('tpl-id').value || undefined,
            name: document.getElementById('tpl-name').value,
            enableEfficiency: enableEff,
            efficiencyType: enableEff ? document.getElementById('tpl-eff-type').value : null,
            expectedEfficiency: enableEff ? parseFloat(document.getElementById('tpl-eff-val').value) : null,
            theme: document.getElementById('tpl-theme') ? document.getElementById('tpl-theme').value : 'blue',
            models: models
        };

        store.saveTemplate(template);
        this.closeModal();
        this.renderList();
    }

    deleteTemplate(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta línea?')) {
            store.deleteTemplate(id);
            this.renderList();
        }
    }

    /* ---------------------------- utilidades ---------------------------- */

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

    /** Para interpolar dentro de un atributo value="..." */
    escapeAttr(v) {
        return String(v ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }
}
