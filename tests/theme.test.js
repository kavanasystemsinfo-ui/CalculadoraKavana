// Tests for ThemeManager
// Tests theme logic without DOM

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const localStorageStore = new Map();
global.localStorage = {
    getItem: (key) => localStorageStore.get(key) || null,
    setItem: (key, value) => localStorageStore.set(key, value),
    removeItem: (key) => localStorageStore.delete(key),
    clear: () => localStorageStore.clear()
};

// Mock DOM elements
const mockDocumentElement = {
    attributes: {},
    setAttribute(name, value) {
        this.attributes[name] = value;
    },
    removeAttribute(name) {
        delete this.attributes[name];
    },
    getAttribute(name) {
        return this.attributes[name] || null;
    }
};

global.document = {
    documentElement: mockDocumentElement,
    getElementById: () => null,
    querySelector: () => null
};

// ThemeManager logic (replicated for testing)
class ThemeManager {
    constructor() {
        this.colorSelect = null;
        this.layoutSelect = null;
        this.productionSelect = null;
    }
    
    setThemeColor(color) {
        document.documentElement.setAttribute('data-theme', color);
        localStorage.setItem('themeColor', color);
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            let colorHex = '#0f172a';
            if (color === 'light') colorHex = '#f8fafc';
            if (color === 'industrial') colorHex = '#000000';
            metaThemeColor.setAttribute('content', colorHex);
        }
    }
    
    setLayout(layout) {
        document.documentElement.setAttribute('data-layout', layout);
        localStorage.setItem('themeLayout', layout);
    }
    
    setProductionTheme(theme) {
        localStorage.setItem('themeProduction', theme);
        this.applyProductionTheme();
    }
    
    applyProductionTheme() {
        const globalTheme = localStorage.getItem('themeColor') || 'dark';
        const productionTheme = localStorage.getItem('themeProduction') || 'blue';
        
        document.documentElement.setAttribute('data-theme', globalTheme);
        document.documentElement.setAttribute('data-production-theme', productionTheme);
    }
    
    clearProductionTheme() {
        document.documentElement.removeAttribute('data-production-theme');
    }
}

describe('ThemeManager - Theme Colors', () => {
    let themeManager;
    
    beforeEach(() => {
        localStorage.clear();
        mockDocumentElement.attributes = {};
        themeManager = new ThemeManager();
    });
    
    it('sets dark theme and saves to localStorage', () => {
        themeManager.setThemeColor('dark');
        
        assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'dark');
        assert.strictEqual(localStorage.getItem('themeColor'), 'dark');
    });
    
    it('sets light theme and saves to localStorage', () => {
        themeManager.setThemeColor('light');
        
        assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'light');
        assert.strictEqual(localStorage.getItem('themeColor'), 'light');
    });
    
    it('sets industrial theme and saves to localStorage', () => {
        themeManager.setThemeColor('industrial');
        
        assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'industrial');
        assert.strictEqual(localStorage.getItem('themeColor'), 'industrial');
    });
});

describe('ThemeManager - Layout', () => {
    let themeManager;
    
    beforeEach(() => {
        localStorage.clear();
        mockDocumentElement.attributes = {};
        themeManager = new ThemeManager();
    });
    
    it('sets compact layout', () => {
        themeManager.setLayout('compact');
        
        assert.strictEqual(document.documentElement.getAttribute('data-layout'), 'compact');
        assert.strictEqual(localStorage.getItem('themeLayout'), 'compact');
    });
    
    it('sets expanded layout', () => {
        themeManager.setLayout('expanded');
        
        assert.strictEqual(document.documentElement.getAttribute('data-layout'), 'expanded');
        assert.strictEqual(localStorage.getItem('themeLayout'), 'expanded');
    });
});

describe('ThemeManager - Production Themes', () => {
    let themeManager;
    
    beforeEach(() => {
        localStorage.clear();
        mockDocumentElement.attributes = {};
        themeManager = new ThemeManager();
    });
    
    it('sets blue production theme', () => {
        themeManager.setProductionTheme('blue');
        
        assert.strictEqual(localStorage.getItem('themeProduction'), 'blue');
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'blue');
    });
    
    it('sets green production theme', () => {
        themeManager.setProductionTheme('green');
        
        assert.strictEqual(localStorage.getItem('themeProduction'), 'green');
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'green');
    });
    
    it('sets orange production theme', () => {
        themeManager.setProductionTheme('orange');
        
        assert.strictEqual(localStorage.getItem('themeProduction'), 'orange');
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'orange');
    });
    
    it('sets purple production theme', () => {
        themeManager.setProductionTheme('purple');
        
        assert.strictEqual(localStorage.getItem('themeProduction'), 'purple');
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'purple');
    });
    
    it('sets red production theme', () => {
        themeManager.setProductionTheme('red');
        
        assert.strictEqual(localStorage.getItem('themeProduction'), 'red');
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'red');
    });
    
    it('sets teal production theme', () => {
        themeManager.setProductionTheme('teal');
        
        assert.strictEqual(localStorage.getItem('themeProduction'), 'teal');
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'teal');
    });
    
    it('applies production theme with current global theme', () => {
        localStorage.setItem('themeColor', 'light');
        themeManager.setProductionTheme('green');
        
        // Global theme should remain
        assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'light');
        // Production theme should be set
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'green');
    });
    
    it('clears production theme', () => {
        themeManager.setProductionTheme('blue');
        themeManager.clearProductionTheme();
        
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), null);
    });
});