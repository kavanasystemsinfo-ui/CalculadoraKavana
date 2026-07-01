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
const APP_THEME_META_COLORS = {
    blue: '#172554',
    green: '#052e16',
    orange: '#431407',
    purple: '#3b0764',
    red: '#450a0a',
    teal: '#042f2e'
};

const APP_THEME_ALIASES = {
    dark: 'blue',
    light: 'blue',
    industrial: 'blue'
};

class ThemeManager {
    constructor() {
        this.layoutSelect = null;
        this.productionSelect = null;
        this.init();
    }

    init() {
        const currentColor = this.normalizeThemeColor(localStorage.getItem('themeColor'));
        const currentLayout = localStorage.getItem('themeLayout') || 'compact';
        const currentProduction = localStorage.getItem('themeProduction') || 'blue';

        localStorage.setItem('themeColor', currentColor);
        document.documentElement.setAttribute('data-theme', currentColor);
        this.updateMetaThemeColor(currentColor);
    }
    
    normalizeThemeColor(color) {
        if (!color) return 'blue';
        if (APP_THEME_ALIASES[color]) return APP_THEME_ALIASES[color];
        if (APP_THEME_META_COLORS[color]) return color;
        return 'blue';
    }

    updateMetaThemeColor(color) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', APP_THEME_META_COLORS[color] || APP_THEME_META_COLORS.blue);
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
        const globalTheme = this.normalizeThemeColor(localStorage.getItem('themeColor'));
        const productionTheme = localStorage.getItem('themeProduction') || 'blue';
        
        document.documentElement.setAttribute('data-theme', globalTheme);
        document.documentElement.setAttribute('data-production-theme', productionTheme);
    }
    
    clearProductionTheme() {
        document.documentElement.removeAttribute('data-production-theme');
    }
}

describe('ThemeManager - Theme Normalization', () => {
    let themeManager;
    
    beforeEach(() => {
        localStorage.clear();
        mockDocumentElement.attributes = {};
        themeManager = new ThemeManager();
    });
    
    it('keeps supported themes', () => {
        assert.strictEqual(themeManager.normalizeThemeColor('blue'), 'blue');
        assert.strictEqual(themeManager.normalizeThemeColor('green'), 'green');
        assert.strictEqual(themeManager.normalizeThemeColor('red'), 'red');
    });
    
    it('normalizes legacy themes to blue', () => {
        assert.strictEqual(themeManager.normalizeThemeColor('dark'), 'blue');
        assert.strictEqual(themeManager.normalizeThemeColor('light'), 'blue');
        assert.strictEqual(themeManager.normalizeThemeColor('industrial'), 'blue');
    });
});

describe('ThemeManager - Initialization', () => {
    let themeManager;
    
    beforeEach(() => {
        localStorage.clear();
        mockDocumentElement.attributes = {};
    });

    it('defaults to blue when there is no saved theme', () => {
        themeManager = new ThemeManager();

        assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'blue');
        assert.strictEqual(localStorage.getItem('themeColor'), 'blue');
    });

    it('migrates legacy saved theme to blue on init', () => {
        localStorage.setItem('themeColor', 'dark');
        themeManager = new ThemeManager();

        assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'blue');
        assert.strictEqual(localStorage.getItem('themeColor'), 'blue');
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
        localStorage.setItem('themeColor', 'green');
        themeManager.setProductionTheme('green');
        
        // Global theme should remain
        assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'green');
        // Production theme should be set
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), 'green');
    });
    
    it('clears production theme', () => {
        themeManager.setProductionTheme('blue');
        themeManager.clearProductionTheme();
        
        assert.strictEqual(document.documentElement.getAttribute('data-production-theme'), null);
    });
});
