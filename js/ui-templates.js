import { store } from './store.js';

export class TemplatesUI {
    constructor() {
        this.listContainer = document.getElementById('lista-plantillas');
        this.btnNueva = document.getElementById('btn-nueva-plantilla');
        this.modal = document.getElementById('modal-plantilla');
        this.form = document.getElementById('form-plantilla');
        this.btnCancel = document.getElementById('btn-cancel-tpl');
        this.btnAddModel = document.getElementById('btn-add-model');
        this.modelsContainer = document.getElementById('modelos-container');
        
        this.init();
    }

    init() {
        if (!this.listContainer) return;

        this.btnNueva.addEventListener('click', () => this.openModal());
        this.btnCancel.addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.btnAddModel.addEventListener('click', () => this.addModelBlock());

        this.renderList();
    }

    renderList() {
        const templates = store.getTemplates();
        
        if (templates.length === 0) {
            this.listContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 32px; color: var(--text-dim);">
                    <p>No tienes ninguna plantilla configurada.</p>
                </div>`;
            return;
        }

        this.listContainer.innerHTML = templates.map(tpl => {
            const totalMeasures = tpl.models.reduce((sum, m) => sum + (m.measures ? m.measures.length : 1), 0);
            return `
            <div class="list-item" data-id="${tpl.id}">
                <div>
                    <h3 class="tpl-title-btn" style="margin-bottom: 4px; font-size: 16px; cursor: pointer; color: var(--accent-primary);">🚀 ${tpl.name}</h3>
                    <p style="font-size: 12px; color: var(--text-dim);">
                        ${tpl.efficiencyType === 'pieces_per_hour' ? '📦 Piezas/h' : '📏 Metros/h'} 
                        · ${tpl.expectedEfficiency} esperado
                        · ${tpl.models.length} modelos · ${totalMeasures} medidas
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-icon btn-edit" data-id="${tpl.id}" style="color: var(--accent-primary);" title="Editar">✏️</button>
                    <button class="btn-icon btn-delete" data-id="${tpl.id}" title="Eliminar">🗑️</button>
                </div>
            </div>
        `}).join('');

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
     * Añade un bloque de modelo completo (nombre + pz/palet + lista de medidas con botón ➕).
     */
    addModelBlock(model = null) {
        if (!model) {
            model = {
                id: crypto.randomUUID(),
                name: '',
                piecesPerPallet: 480,
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
                <div style="flex:2;">
                    <input type="text" class="model-name" placeholder="Nombre del modelo" value="${model.name}" required>
                </div>
                <div style="flex:1;">
                    <input type="number" class="model-pallet" placeholder="Pz/Palet" value="${model.piecesPerPallet}" required min="1">
                </div>
                <button type="button" class="btn-icon remove-model" title="Eliminar modelo">✖</button>
            </div>
            <div class="measures-list">
                <!-- Medidas dinámicas -->
            </div>
            <button type="button" class="btn-add-measure">➕ Añadir Medida</button>
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
            <span class="measure-bullet">📏</span>
            <input type="number" class="measure-length" placeholder="Largo (mm)" value="${measure.lengthMm}" required min="1" step="any">
            <span style="font-size:11px; color:var(--text-dim); white-space:nowrap;">mm</span>
            <button type="button" class="btn-icon remove-measure" style="font-size:14px;">✕</button>
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
                    
                    tpl.models.forEach(m => this.addModelBlock(m));
                }
            } else {
                document.getElementById('tpl-id').value = '';
                document.getElementById('tpl-enable-eff').checked = true;
                this.addModelBlock();
            }
    
            // Toggle efficiency fields
            const effFields = document.getElementById('eff-fields');
            const enableEff = document.getElementById('tpl-enable-eff');
            if (effFields && enableEff) {
                effFields.style.display = enableEff.checked ? 'block' : 'none';
            }
    
            this.modal.style.display = 'flex';
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

            return {
                id: block.dataset.id,
                name: block.querySelector('.model-name').value,
                piecesPerPallet: parseInt(block.querySelector('.model-pallet').value, 10) || 480,
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
                    models: models
                };

        store.saveTemplate(template);
        this.closeModal();
        this.renderList();
    }

    deleteTemplate(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
            store.deleteTemplate(id);
            this.renderList();
        }
    }
}
