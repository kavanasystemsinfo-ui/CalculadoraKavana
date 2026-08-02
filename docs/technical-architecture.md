# Documentación Técnica — Calculadora Kavana

> **Versión del Documento:** 2.5.0  
> **Última Actualización:** 2026-07-05  
> **Clasificación:** Interna / Desarrollo

---

## 1. Visión General del Sistema

Calculadora Kavana es una Progressive Web Application (PWA) construida con arquitectura **client-side pura** que opera sin servidor backend. La aplicación utiliza ES Modules nativos del navegador, localStorage para persistencia y Service Worker para funcionalidad offline.

### 1.1 Principios de Diseño

| Principio | Implementación |
|-----------|----------------|
| **Zero Backend** | Toda la lógica ejecuta en el cliente |
| **Offline-First** | Service Worker cachea todos los assets estáticos |
| **Modularidad** | ES Modules con separación de responsabilidades |
| **TDD** | Tests escritos antes que la implementación |
| **Progressive Enhancement** | Funciona sin JS (fallback), mejor con él |

---

## 2. Arquitectura de Capas

### 2.1 Presentation Layer

Responsable de la renderización del DOM y manejo de eventos del usuario.

**Módulos:**
- `ui-production.js` — Controlador de la pestaña de producción
- `ui-templates.js` — Controlador CRUD de plantillas
- `ui-history.js` — Controlador del historial de sesiones

**Patrón de Renderizado:**
```javascript
// Renderizado unidireccional con Template Literals
container.innerHTML = `
    <div class="list-item">
        <h3>${this.escapeHtml(item.name)}</h3>
    </div>
`;

// Delegación de eventos directa
container.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', (e) => this.handleAction(e));
});
```

**Comunicación Inter-Módulo:**
```javascript
// Emisor
window.dispatchEvent(new CustomEvent('template-selected', { 
    detail: { id: templateId } 
}));

// Receptor
window.addEventListener('template-selected', (e) => {
    this.activeTemplateId = e.detail.id;
    this.render();
});
```

### 2.2 Business Logic Layer

Contiene la lógica de cálculo pura, sin dependencias del DOM.

**Calculator Engine (`calculator.js`):**

```javascript
export class Calculator {
    /**
     * Calcula metros lineales
     * @param {number} lengthMm - Longitud en milímetros
     * @param {number} pieces - Cantidad de piezas
     * @returns {number} Metros lineales totales
     */
    static calcMeters(lengthMm, pieces) {
        if (!lengthMm || !pieces || lengthMm < 0 || pieces < 0) return 0;
        return (lengthMm / 1000) * pieces;
    }

    /**
     * Calcula eficiencia del turno
     * @param {number} totalProduced - Total producido (piezas o metros)
     * @param {number} expectedEfficiency - Velocidad esperada (por hora)
     * @param {number} shiftHours - Horas del turno
     * @returns {Object} { theoreticalTime, efficiency }
     */
    static calcEfficiency(totalProduced, expectedEfficiency, shiftHours) {
        if (!totalProduced || !expectedEfficiency || !shiftHours) {
            return { theoreticalTime: 0, efficiency: 0 };
        }
        const theoreticalTime = totalProduced / expectedEfficiency;
        const efficiencyPct = (theoreticalTime / shiftHours) * 100;
        return {
            theoreticalTime: Number(theoreticalTime.toFixed(2)),
            efficiency: Number(efficiencyPct.toFixed(2))
        };
    }

    /**
     * Ejecuta sesión completa de cálculo
     * @param {Object} template - Plantilla activa
     * @param {Array} entries - Entradas de producción
     * @param {number} shiftHours - Horas del turno
     * @returns {Object} Resultados agregados
     */
    static runSession(template, entries, shiftHours) {
        let totalPieces = 0;
        let totalMeters = 0;

        entries.forEach(e => {
            const pieces = e.pieces || 0;
            totalPieces += pieces;
            totalMeters += this.calcMeters(e.lengthMm, pieces);
        });

        const isMeters = template.efficiencyType === 'meters_per_hour';
        const totalProduced = isMeters ? totalMeters : totalPieces;
        const expected = template.expectedEfficiency;

        const calc = this.calcEfficiency(totalProduced, expected, shiftHours);

        return {
            totalPieces,
            totalMeters,
            theoreticalTime: calc.theoreticalTime,
            efficiency: calc.efficiency
        };
    }
}
```

**Store Helper (`store.js`):**

```javascript
export const store = {
    // Templates CRUD
    saveTemplate(template) { ... },
    getTemplates() { ... },
    getTemplate(id) { ... },
    deleteTemplate(id) { ... },

    // Sessions CRUD
    saveSession(session) { ... },
    getSessions() { ... },
    deleteSession(id) { ... },

    // Import/Export
    exportToJson(key) { ... },
    importFromJson(file) { ... },
    clearAll() { ... }
};
```

### 2.3 Persistence Layer

**localStorage Schema:**

| Key | Tipo | Descripción |
|-----|------|-------------|
| `prodcalc_templates` | `Template[]` | Array de plantillas JSON |
| `prodcalc_sessions` | `ProductionSession[]` | Array de sesiones JSON |
| `themeProduction` | `string` | Tema activo ('blue', 'green', etc.) |
| `themeLayout` | `string` | Layout ('compact', 'expanded') |

**Límites:**
- Almacenamiento total: ~5-10MB (varía por navegador)
- Datos por defecto: localStorage por-origin, por-perfil
- Sin expiración automática

### 2.4 Infrastructure Layer

**Service Worker (`sw.js`):**
```javascript
const CACHE_NAME = 'prod-calc-v15';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css?v=10',
    './js/app.js?v=13',
    './js/store.js?v=9',
    './js/theme.js?v=12',
    './js/calculator.js',
    './js/export.js',
    './js/ui-templates.js?v=9',
    './js/ui-production.js?v=11',
    './js/ui-history.js?v=9'
];

// Estrategia: Cache First, Network Fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
```

**Anti-FOUC Script (`index.html` inline):**
```javascript
(function() {
    var theme = localStorage.getItem('themeProduction') || 'blue';
    var layout = localStorage.getItem('themeLayout') || 'compact';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-layout', layout);
})();
```

---

## 3. API Interna del Módulo Calculator

### 3.1 `Calculator.calcMeters(lengthMm, pieces)`

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `lengthMm` | `number` | Longitud en milímetros |
| `pieces` | `number` | Cantidad de piezas |
| **Retorno** | `number` | Metros lineales totales |

**Fórmula:** `(lengthMm / 1000) * pieces`

### 3.2 `Calculator.calcEfficiency(totalProduced, expectedEfficiency, shiftHours)`

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `totalProduced` | `number` | Total producido (piezas o metros) |
| `expectedEfficiency` | `number` | Eficiencia esperada por hora |
| `shiftHours` | `number` | Horas del turno |
| **Retorno** | `Object` | `{ theoreticalTime, efficiency }` |

**Fórmulas:**
- `theoreticalTime = totalProduced / expectedEfficiency`
- `efficiency = (theoreticalTime / shiftHours) * 100`

### 3.3 `Calculator.runSession(template, entries, shiftHours)`

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `template` | `Template` | Plantilla activa |
| `entries` | `ProductionEntry[]` | Entradas de producción |
| `shiftHours` | `number` | Horas del turno |
| **Retorno** | `Object` | `{ totalPieces, totalMeters, theoreticalTime, efficiency }` |

---

## 4. Eventos del Sistema

| Evento | Emisor | Payload | Descripción |
|--------|--------|---------|-------------|
| `template-selected` | ui-templates.js | `{ id: string }` | Plantilla seleccionada |
| `switch-tab` | ui-templates.js, ui-history.js | `{ tab: string }` | Cambio de pestaña |

---

## 5. Seguridad

### 5.1 Controles Implementados

| Control | Implementación | Verificación |
|---------|----------------|--------------|
| **XSS Prevention** | `escapeHtml()` en todos los renderizados | Code review |
| **Input Validation** | `required` en forms, `parseFloat/parseInt` con fallback | Tests unitarios |
| **Data Isolation** | localStorage por-origin | Browser sandbox |
| **No Secrets** | Solo client-side, sin API keys | Architecture review |
| **CSP Compatible** | Sin `eval()`, sin inline scripts (excepto anti-FOUC) | Lighthouse audit |

### 5.2 Función `escapeHtml()`

```javascript
escapeHtml(unsafe) {
    return (unsafe || '').replace(/[&<"']/g, m => {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '"': return '&quot;';
            default: return '&#039;';
        }
    });
}
```

---

## 6. Rendimiento

### 6.1 Métricas

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| First Contentful Paint | <1.5s | <500ms |
| Largest Contentful Paint | <2.5s | <800ms |
| Time to Interactive | <3s | <1s |
| Total Blocking Time | <200ms | <50ms |
| Cumulative Layout Shift | <0.1 | 0 |

### 6.2 Optimizaciones

- **Zero Framework:** Sin overhead de Virtual DOM o reconciliación
- **Cache First:** Service Worker sirve assets desde caché
- **Lazy Events:** Eventos binded solo cuando es necesario
- **Minimal DOM:** innerHTML directo, sin diffing algorithms
- **Preload Fonts:** Google Fonts con `display=swap`

---

## 7. Compatibilidad

### 7.1 Navegadores Soportados

| Navegador | Versión Mínima | Notas |
|-----------|----------------|-------|
| Chrome | 80+ | Soporte completo |
| Firefox | 78+ | Soporte completo |
| Safari | 14+ | Service Worker requiere HTTPS |
| Edge | 80+ | Basado en Chromium |
| Samsung Internet | 13+ | Dispositivos móviles |

### 7.2 Requisitos

- ES Modules nativos (`<script type="module">`)
- localStorage habilitado
- Service Worker habilitado (para PWA)
- JavaScript habilitado

---

## 8. Dependencias

### 8.1 Dependencias Runtime

| Dependencia | Versión | CDN | Uso |
|-------------|---------|-----|-----|
| SheetJS (xlsx) | 0.20.2 | cdn.sheetjs.com | Exportación Excel |

### 8.2 Dependencias de Desarrollo

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| Node.js | 18+ | Testing runner |
| npm | 8+ | Gestión de paquetes de tests |

### 8.3 Dependencias Eliminadas

| Dependencia | Motivo de Eliminación |
|-------------|----------------------|
| Dexie.js | Migrado a localStorage (síncrono) |
| Tesseract.js | Funcionalidad OCR eliminada (fuera de alcance) |
| React/Vue/Angular | Arquitectura vanilla JS deliberada |

---

## 9. Estrategia de Testing

### 9.1 Enfoque TDD

```
1. Escribir test que falle (RED)
2. Implementar mínimo para que pase (GREEN)
3. Refactorizar sin romper tests (REFACTOR)
```

### 9.2 Archivos de Test

| Archivo | Módulo | Tests | Cobertura |
|---------|--------|-------|-----------|
| `engine.test.js` | Calculator | 10 | 100% |
| `storage.test.js` | Store | 6 | 100% |
| `theme.test.js` | ThemeManager | 11 | 100% |

### 9.3 Ejecución

```bash
# Todos los tests
cd tests && npm test

# Test específico
node --test tests/engine.test.js
```

---

## 10. Gestión de Versiones

### 10.1 Esquema de Versiones

Se sigue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios breaking en la API o modelo de datos
- **MINOR**: Nuevas funcionalidades compatibles
- **PATCH**: Bug fixes y mejoras menores

### 10.2 Versionado de Assets

Los assets estáticos usan query strings para bustear caché:
```html
<link rel="stylesheet" href="./css/styles.css?v=10">
<script type="module" src="./js/app.js?v=13"></script>
```

### 10.3 Service Worker Cache

El Service Worker usa un nombre de caché con versión:
```javascript
const CACHE_NAME = 'prod-calc-v15';
```

---

*Documento mantenido por el equipo de Arquitectura de Sistemas.*
