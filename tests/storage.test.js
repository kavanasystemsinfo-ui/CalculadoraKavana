// Tests for Storage (templates and sessions)
// Tests pure storage logic without DOM

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage for Node.js environment
const localStorageStore = new Map();
global.localStorage = {
    getItem: (key) => localStorageStore.get(key) || null,
    setItem: (key, value) => localStorageStore.set(key, value),
    removeItem: (key) => localStorageStore.delete(key),
    clear: () => localStorageStore.clear()
};

// Import the store module logic (replicated for testing)
const STORAGE_KEYS = {
    TEMPLATES: 'prodcalc_templates',
    SESSIONS: 'prodcalc_sessions'
};

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function toISODate(date = new Date()) {
    return date.toISOString();
}

const store = {
    saveTemplate(template) {
        const templates = this.getTemplates();
        const existingIndex = templates.findIndex(t => t.id === template.id);
        
        const tpl = {
            id: template.id || generateId(),
            name: template.name || 'Sin nombre',
            description: template.description || '',
            factoryName: template.factoryName || '',
            efficiencyType: template.efficiencyType || 'meters_per_hour',
            expectedEfficiency: Number(template.expectedEfficiency) || 0,
            theme: template.theme || 'blue',
            models: template.models || [],
            createdAt: template.createdAt || toISODate(),
            updatedAt: toISODate()
        };
        
        if (existingIndex >= 0) {
            templates[existingIndex] = tpl;
        } else {
            templates.push(tpl);
        }
        
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        return tpl.id;
    },
    
    getTemplates() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    
    getTemplate(id) {
        const templates = this.getTemplates();
        return templates.find(t => t.id === id) || null;
    },
    
    deleteTemplate(id) {
        const templates = this.getTemplates().filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        return true;
    }
};

describe('Storage - Templates', () => {
    beforeEach(() => {
        localStorage.clear();
    });
    
    it('creates a new template with default values', () => {
        const id = store.saveTemplate({ name: 'Test Template' });
        const template = store.getTemplate(id);
        
        assert.strictEqual(template.name, 'Test Template');
        assert.strictEqual(template.description, '');
        assert.strictEqual(template.efficiencyType, 'meters_per_hour');
        assert.strictEqual(template.expectedEfficiency, 0);
        assert.ok(template.id);
        assert.ok(template.createdAt);
        assert.ok(template.updatedAt);
    });
    
    it('saves multiple templates and retrieves them all', () => {
        store.saveTemplate({ name: 'Template 1', expectedEfficiency: 1000 });
        store.saveTemplate({ name: 'Template 2', expectedEfficiency: 2000 });
        store.saveTemplate({ name: 'Template 3', expectedEfficiency: 3000 });
        
        const templates = store.getTemplates();
        assert.strictEqual(templates.length, 3);
    });
    
    it('updates an existing template', () => {
        const id = store.saveTemplate({ name: 'Original' });
        store.saveTemplate({ id, name: 'Updated' });
        
        const template = store.getTemplate(id);
        assert.strictEqual(template.name, 'Updated');
    });
    
    it('deletes a template by ID', () => {
        const id1 = store.saveTemplate({ name: 'Template 1' });
        const id2 = store.saveTemplate({ name: 'Template 2' });
        
        store.deleteTemplate(id1);
        
        const templates = store.getTemplates();
        assert.strictEqual(templates.length, 1);
        assert.strictEqual(templates[0].id, id2);
    });
    
    it('handles template with models', () => {
        const models = [
            { id: 'm1', name: 'Model A', lengthMm: 2500, piecesPerPallet: 480 },
            { id: 'm2', name: 'Model B', lengthMm: 3000, piecesPerPallet: 480 }
        ];
        
        const id = store.saveTemplate({ name: 'Template with Models', models });
        const template = store.getTemplate(id);
        
        assert.strictEqual(template.models.length, 2);
        assert.strictEqual(template.models[0].name, 'Model A');
        assert.strictEqual(template.models[1].lengthMm, 3000);
    });
    
    it('generates unique IDs for each template', () => {
        const id1 = store.saveTemplate({ name: 'Template 1' });
        const id2 = store.saveTemplate({ name: 'Template 2' });
        
        assert.notStrictEqual(id1, id2);
    });
});