# Guía de Desarrollo — Calculadora Kavana

> **Versión:** 2.5.0  
> **Última Actualización:** 2026-07-05  
> **Público Objetivo:** Desarrolladores, Contribuidores

---

## 1. Configuración del Entorno

### 1.1 Requisitos

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Node.js | 18+ | Testing runner |
| npm | 8+ | Gestión de paquetes |
| Git | 2.x | Control de versiones |
| Editor | VS Code (recomendado) | Desarrollo |

### 1.2 Instalación

```bash
# Clonar repositorio
git clone https://github.com/kavanasystemsinfo-ui/CalculadoraKavana.git
cd CalculadoraKavana

# Instalar dependencias de tests (opcional)
cd tests && npm install && cd ..

# Iniciar servidor de desarrollo
npx serve .
# O:
python -m http.server 8000
```

### 1.3 Configuración de VS Code

Recomendar extensiones:
- **Live Server** — Para desarrollo con hot reload
- **ESLint** — Para linting (configuración pendiente)
- **Prettier** — Para formateo de código

---

## 2. Arquitectura del Código

### 2.1 Princípios de Diseño

1. **Zero Dependencies**: No se usan frameworks externos (React, Vue, Angular)
2. **ES Modules**: Todo el código usa `import`/`export` nativos
3. **TDD**: Tests escritos antes que la implementación
4. **Separation of Concerns**: Cada módulo tiene una responsabilidad clara
5. **CustomEvent Bus**: Comunicación entre módulos sin acoplamiento

### 2.2 Mapa de Módulos

```
app.js (Orquestador)
├── theme.js          → ThemeManager
├── store.js          → store (localStorage)
├── ui-templates.js   → TemplatesUI
├── ui-production.js  → ProductionUI
└── ui-history.js     → HistoryUI

calculator.js → Calculator (sin dependencias DOM)
export.js     → Exporter (dependencia SheetJS)
```

### 2.3 Flujo de Datos

```
Usuario → UI Module → Store → localStorage
                ↓
          Calculator
                ↓
          UI Update
```

---

## 3. Guía de Estilo

### 3.1 Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Variables | camelCase | `totalPieces` |
| Funciones | camelCase | `calcEfficiency()` |
| Clases | PascalCase | `Calculator` |
| Constantes | UPPER_SNAKE | `STORAGE_KEYS` |
| IDs HTML | kebab-case | `btn-calc-prod` |
| Eventos | kebab-case | `template-selected` |

### 3.2 Estructura de Archivos JS

```javascript
/**
 * Descripción del módulo
 */

// Imports
import { store } from './store.js';

// Constantes (si aplica)
const CONSTANTS = { ... };

// Clase o función principal
export class ModuleName {
    constructor() {
        // Inicialización
    }

    // Métodos públicos
    methodName() { ... }

    // Métodos privados (convención: underscore)
    _privateMethod() { ... }
}
```

### 3.3 CSS Variables

Todos los colores y dimensiones usan CSS variables para soporte de temas:

```css
:root {
    --bg-main: #0b1020;
    --card-bg: #121c2f;
    --accent-primary: #4f46e5;
    --text-main: #f8fafc;
    --text-dim: #9aa7c0;
    /* ... */
}
```

Nunca usar colores hardcodeados en reglas CSS.

---

## 4. Desarrollo de Nuevas Funcionalidades

### 4.1 Flujo de Trabajo TDD

```
1. Crear test que falle (RED)
   node --test tests/nuevo-test.test.js

2. Implementar mínimo para que pase (GREEN)
   Editar js/modulo.js

3. Refactorizar sin romper tests (REFACTOR)
   Mejorar código

4. Verificar todos los tests
   cd tests && npm test
```

### 4.2 Añadir Nuevo Módulo UI

1. Crear `js/ui-nombre.js`:
```javascript
import { store } from './store.js';

export class NombreUI {
    constructor() {
        this.container = document.getElementById('target-id');
        this.init();
    }

    init() {
        if (!this.container) return;
        // Escuchar eventos
        window.addEventListener('evento', (e) => this.handleEvento(e));
        this.render();
    }

    render() {
        this.container.innerHTML = `...`;
        this.bindEvents();
    }

    bindEvents() {
        // Event listeners
    }
}
```

2. Importar en `app.js`:
```javascript
import { NombreUI } from './ui-nombre.js?v=1';

// En App.init()
this.nombreUI = new NombreUI();
```

3. Añadir assets al Service Worker (`sw.js`):
```javascript
const ASSETS = [
    // ...existentes...
    './js/ui-nombre.js?v=1'
];
```

4. Escribir tests en `tests/nombre.test.js`

### 4.3 Añadir Nuevo Evento

1. Documentar en `docs/technical-architecture.md`:
```
| event-name | emitter | payload | description |
```

2. Emisor:
```javascript
window.dispatchEvent(new CustomEvent('event-name', { 
    detail: { key: value } 
}));
```

3. Receptor:
```javascript
window.addEventListener('event-name', (e) => {
    const { key } = e.detail;
    // ...
});
```

### 4.4 Añadir Nuevo Campo al Modelo de Datos

1. Actualizar interfaz TypeScript en `docs/technical-architecture.md`
2. Actualizar `store.js` — método `saveTemplate()` con valor por defecto
3. Actualizar UI de creación/edición (`ui-templates.js`)
4. Actualizar UI de visualización (`ui-production.js`)
5. Actualizar exportación (`export.js`) si aplica
6. Tests de regresión

---

## 5. Sistema de Temas

### 5.1 Estructura de un Tema

```css
[data-theme="nombre"] {
    --bg-main: #color-fondo;
    --card-bg: #color-tarjeta;
    --accent-primary: #color-primario;
    --accent-secondary: #color-secundario;
    --accent-tertiary: rgba(r, g, b, 0.16);
    --text-main: #color-texto;
    --text-dim: #color-texto-secundario;
    --danger: #color-peligro;
    --success: #color-exito;
    --border-subtle: rgba(r, g, b, 0.08);
    --input-bg: #color-fondo-input;
    --input-border: #color-borde-input;
    --shadow-base: 0 25px 50px -12px rgba(0, 0, 0, 0.55), ...;
}
```

### 5.2 Añadir Nuevo Tema

1. Agregar regla CSS en `css/styles.css`:
```css
[data-theme="nuevo"] {
    /* Variables del tema */
}

[data-production-theme="nuevo"] {
    /* Variables de producción */
}
```

2. Actualizar `theme.js`:
```javascript
const APP_THEME_META_COLORS = {
    // ...existentes...
    nuevo: '#hex-color'
};
```

3. Actualizar select en `index.html`:
```html
<option value="nuevo">Nombre (Descripción)</option>
```

---

## 6. Testing

### 6.1 Estructura de Tests

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Module } from '../js/module.js';

describe('Module', () => {
    it('debería hacer X cuando Y', () => {
        const result = Module.method(input);
        assert.equal(result, expected);
    });
});
```

### 6.2 Convenciones

- **Naming**: `debería [acción] cuando [condición]`
- ** AAA Pattern**: Arrange, Act, Assert
- **Un test por comportamiento**
- **Tests independientes** (sin estado entre tests)

### 6.3 Ejecutar Tests

```bash
# Todos
cd tests && npm test

# Uno específico
node --test tests/engine.test.js

# Watch mode (requiere nodemon)
npx nodemon --watch ../js --exec "node --test tests/engine.test.js"
```

---

## 7. Git y Control de Versiones

### 7.1 Branching Strategy

```
main (producción)
├── feature/nueva-funcionalidad
├── bugfix/correccion-bug
└── docs/actualizar-documentacion
```

### 7.2 Convenciones de Commit

```
tipo(alcance): descripción corta

Ejemplos:
feat(ui): añadir botón Meta 100%
fix(calculator): corregir cálculo de eficiencia con 0 horas
docs(readme): actualizar sección de instalación
refactor(store): simplificar método exportToJson
test(engine): añadir tests para calcMeters con edge cases
chore(sw): actualizar versión de caché a v15
```

### 7.3 Versionado de Assets

Al modificar un archivo JS o CSS, incrementar la versión:

```html
<!-- Antes -->
<script src="./js/ui-production.js?v=10"></script>

<!-- Después -->
<script src="./js/ui-production.js?v=11"></script>
```

Y actualizar `sw.js`:
```javascript
const ASSETS = [
    './js/ui-production.js?v=11',  // Actualizado
    // ...
];
```

---

## 8. Deployment

### 8.1 Checklist Pre-Deploy

- [ ] Todos los tests pasan (`npm test`)
- [ ] No hay errores en consola del navegador
- [ ] Service Worker actualizado con nuevas versiones
- [ ] CHANGELOG.md actualizado
- [ ] README.md actualizado (si aplica)
- [ ] Versiones de assets incrementadas

### 8.2 Proceso de Deploy

```bash
# 1. Verificar estado
git status
git diff

# 2. Commit
git add .
git commit -m "feat: descripción"

# 3. Push
git push origin main

# 4. Verificar en producción
# Abrir la app y verificar funcionamiento
```

---

## 9. Troubleshooting para Desarrolladores

### 9.1 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Failed to resolve module` | CORS en `file://` | Usar `npx serve .` |
| `localStorage quota exceeded` | Límite de almacenamiento | Implementar limpieza automática |
| `Service Worker registration failed` | HTTPS requerido | Usar localhost o HTTPS |
| `Unexpected token '<'` | Archivo no encontrado | Verificar rutas y versiones |

### 9.2 Debugging

```javascript
// En consola del navegador

// Ver plantillas guardadas
JSON.parse(localStorage.getItem('prodcalc_templates'))

// Ver sesiones guardadas
JSON.parse(localStorage.getItem('prodcalc_sessions'))

// Verificar Service Worker
navigator.serviceWorker.getRegistrations()

// Verificar caché
caches.keys().then(console.log)

// Forzar recarga sin caché
location.reload(true)
```

---

## 10. Roadmap de Desarrollo

Ver `docs/roadmap.md` para el roadmap técnico completo.

### Próximas Funcionalidades Potenciales

| Feature | Prioridad | Esfuerzo |
|---------|-----------|----------|
| Modo oscuro/claro | Media | 2 días |
| Gráficos de eficiencia | Media | 3 días |
| Múltiples idiomas | Baja | 2 días |
| Sincronización cloud | Alta | 1 semana |
| Modo offline avanzado | Media | 2 días |

---

*Documento mantenido por el equipo de Desarrollo.*
