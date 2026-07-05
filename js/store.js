/**
 * Storage Helper - Capa de persistencia para localStorage
 * Gestiona plantillas y sesiones de producción
 */

const STORAGE_KEYS = {
    TEMPLATES: 'prodcalc_templates',
    SESSIONS: 'prodcalc_sessions'
};

/**
 * Genera un ID único basado en timestamp y random
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Formatea fecha a ISO string
 */
function toISODate(date = new Date()) {
    return date.toISOString();
}

/**
 * Storage namespace for ProdCalc
 * Exportado como 'store' para compatibilidad con el código existente
 */
export const store = {
    // ==================== TEMPLATES ====================
    
    /**
     * Guarda una plantilla (crea o actualiza)
     * @param {Object} template - Plantilla a guardar
     * @returns {string} ID de la plantilla
     */
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
    
    /**
     * Obtiene todas las plantillas
     * @returns {Array} Array de plantillas
     */
    getTemplates() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading templates:', e);
            return [];
        }
    },
    
    /**
     * Obtiene una plantilla por ID
     * @param {string} id 
     * @returns {Object|null}
     */
    getTemplate(id) {
        const templates = this.getTemplates();
        return templates.find(t => t.id === id) || null;
    },
    
    /**
     * Elimina una plantilla por ID
     * @param {string} id 
     * @returns {boolean}
     */
    deleteTemplate(id) {
        const templates = this.getTemplates().filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        return true;
    },
    
    // ==================== SESSIONS ====================
    
    /**
     * Guarda una sesión de producción
     * @param {Object} session 
     * @returns {string} ID de la sesión
     */
    saveSession(session) {
        const sessions = this.getSessions();
        
        const sess = {
            id: session.id || generateId(),
            templateId: session.templateId || '',
            templateName: session.templateName || '',
            date: session.date || toISODate(),
            shiftHours: Number(session.shiftHours) || 0,
            entries: session.entries || [],
            coilChangeMinutes: session.coilChangeMinutes || [],
            totalMeters: Number(session.totalMeters) || 0,
            totalPieces: Number(session.totalPieces) || 0,
            theoreticalTime: Number(session.theoreticalTime) || 0,
            efficiency: Number(session.efficiency) || 0,
            createdAt: toISODate()
        };
        
        sessions.push(sess);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        return sess.id;
    },
    
    /**
     * Obtiene todas las sesiones
     * @returns {Array}
     */
    getSessions() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading sessions:', e);
            return [];
        }
    },
    
    /**
     * Elimina una sesión por ID
     * @param {string} id 
     */
    deleteSession(id) {
        const sessions = this.getSessions().filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    },
    
    // ==================== EXPORT/IMPORT ====================
    
    /**
     * Exporta datos como archivo JSON
     * @param {string} key - 'templates' o 'sessions' o 'all'
     */
    exportToJson(key = 'all') {
        let data = {};
        
        if (key === 'templates') {
            data = { templates: this.getTemplates() };
        } else if (key === 'sessions') {
            data = { sessions: this.getSessions() };
        } else {
            data = {
                templates: this.getTemplates(),
                sessions: this.getSessions()
            };
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prodcalc-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    /**
     * Importa datos desde archivo JSON
     * @param {File} file 
     * @returns {Promise<Object>}
     */
    importFromJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.templates) {
                        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
                    }
                    if (data.sessions) {
                        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
                    }
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },
    
    /**
     * Limpia toda la base de datos
     */
    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
        localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    }
};
