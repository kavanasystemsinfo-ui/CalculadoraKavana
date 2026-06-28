# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [2.4.0] - 2026-06-28

### Added
- **Integrated Template Themes**: Temas de plantilla combinados con temas globales
- **Theme Combinations**: 18 combinaciones únicas (3 globales × 6 de plantilla)
- **Template Theme Selector**: Selector actualizado con nuevas opciones

### Changed
- **Theme Application**: `applyTemplateTheme()` ahora combina tema global + plantilla
- **CSS Variables**: Nuevas reglas combinadas para cada combinación
- **ThemeManager**: Método actualizado para soportar combinaciones

### Technical Details
- **Combinations**: dark-blue, dark-green, dark-orange, dark-purple, dark-red, dark-teal
- **Combinations**: light-blue, light-green, light-orange, light-purple, light-red, light-teal
- **Combinations**: industrial-blue, industrial-green, industrial-orange, industrial-purple, industrial-red, industrial-teal
- **Backward Compatibility**: Plantillas existentes usan 'blue' por defecto

---

## [2.3.0] - 2026-06-28

### Added
- **Template Themes**: Sistema de temas visuales para plantillas con 6 paletas de colores
- **Theme Selector**: Selector de tema en el modal de creación/edición de plantillas
- **Template Theme CSS**: Nuevas variables CSS con `[data-template-theme="..."]`
- **ThemeManager Methods**: `applyTemplateTheme()` y `clearTemplateTheme()` para gestión de temas

### Changed
- **Template Model**: Agregado campo `theme` a la estructura de plantilla (default: 'blue')
- **Production UI**: Aplicación automática del tema al seleccionar una plantilla
- **UI Templates**: Carga del tema al editar una plantilla existente

### Technical Details
- **Theme Colors**: blue, green, orange, purple, red, teal
- **CSS Variables**: `--accent-primary`, `--accent-secondary`, `--card-bg`, `--input-bg`
- **Backward Compatibility**: Plantillas existentes usan 'blue' por defecto

---

## [2.2.0] - 2026-06-26

### Added
- **Optional Efficiency Tracking**: Checkbox en creación de plantilla para habilitar/desabilitar seguimiento de eficiencia
- **Simple Production Mode**: Cuando eficiencia deshabilitada, solo muestra piezas y metros producidos
- **Conditional UI**: Campos de horas, tiempo teórico y eficiencia solo aparecen cuando están habilitados

### Changed
- **Template Modal**: Nuevo campo checkbox "Habilitar seguimiento de eficiencia" (por defecto activado)
- **Production UI**: Campos de eficiencia condicionales basados en configuración de plantilla
- **Backward Compatibility**: Plantillas existentes mantienen comportamiento completo

---

## [2.1.0] - 2026-06-26

### Added
- **Shift Time Dropdowns**: Dos selectores independientes para horas y minutos
- **Hours Dropdown**: Opciones del 1 al 8 horas (por defecto: 8 horas)
- **Minutes Dropdown**: Opciones 0, 15, 30, 45 minutos (valores: 0, 0.25, 0.5, 0.75 horas)

### Changed
- **UI Production**: Reemplazados botones por dos dropdowns para mayor claridad
- **Default Shift**: 8 horas por defecto (más común en producción)
- **Calculation Logic**: `shiftHours = hours + minutes` (ej: 8h + 0.5h = 8.5h)
- **Simplified UX**: Eliminado el sistema de botones para evitar problemas de eventos
- **Header Image**: Reemplazado texto "ProdCalc" por imagen HEADER.png
- **Project Name**: Renombrado a "Calculadora Kavana"

---

## [2.2.0] - 2026-06-26

### Added
- **Optional Efficiency Tracking**: Checkbox en creación de plantilla para habilitar/desabilitar seguimiento de eficiencia
- **Simple Production Mode**: Cuando eficiencia deshabilitada, solo muestra piezas y metros producidos
- **Conditional UI**: Campos de horas, tiempo teórico y eficiencia solo aparecen cuando están habilitados

### Changed
- **Template Modal**: Nuevo campo checkbox "Habilitar seguimiento de eficiencia" (por defecto activado)
- **Production UI**: Campos de eficiencia condicionales basados en configuración de plantilla
- **Backward Compatibility**: Plantillas existentes mantienen comportamiento completo

---

## [2.0.0] - 2026-06-26

### Added
- **Storage Helper (`store.js`)**: Nueva capa de abstracción para localStorage con métodos `getTemplates()`, `saveTemplate()`, `getSessions()`, `saveSession()`, `exportToJson()`, `importFromJson()`, `clearAll()`.
- **Template Management System**: UI completa para CRUD de plantillas con soporte para múltiples modelos y medidas.
- **Production Engine Integration**: Cálculo de eficiencia integrado con `Calculator.runSession()`.
- **History & Export**: Historial de sesiones con exportación a Excel (.xlsx) y backup JSON.
- **Data Migration**: Soporte para migración de datos del formato antiguo (`lengthMm` único) al nuevo (`measures[]`).

### Changed
- **Architecture**: Migrado de Dexie.js (IndexedDB) a localStorage para simplificación y portafolio.
- **App Entry Point**: `js/app.js` actualizado para usar localStorage en lugar de Dexie.
- **UI Modules**: Todos los módulos UI actualizados para usar la nueva capa de storage.
- **Manifest**: Branding actualizado a "Calculadora Kavana - Herramientas de Producción".

### Removed
- **Dexie.js Dependency**: Eliminada la dependencia de IndexedDB/Dexie.js.
- **Async Storage Calls**: Los métodos de storage ahora son síncronos (localStorage).
- **Phase 3 (Coil Tracking)**: Eliminada del roadmap por reducción de alcance.

### Technical Details
- **Test Coverage**: 19 unit tests passing (Calculator Engine + Storage logic).
- **Browser Compatibility**: ES Modules nativos, localStorage, SheetJS CDN.
- **PWA Status**: Service Worker funcional, manifest actualizado.

---

## [1.0.0] - 2024-XX-XX

### Added
- **Historial de Sesiones**: Pestaña de historial (`ui-history.js`) con lista de sesiones guardadas, exportación individual a Excel y borrado.
- **Exportación Excel (.xlsx)**: Módulo `export.js` usando SheetJS para generar archivos Excel reales con cabecera, detalle por modelo y cambios de bobina.
- **Backup JSON**: Exportación e importación completa de la base de datos (plantillas + sesiones) como archivo `.json`.
- **Service Worker v2**: Actualizado para cachear todos los módulos JS y CSS nuevos. Botón de borrado total de base de datos en Configuración.
- **Motor de Producción**: Pestaña de cálculo de eficiencia (`ui-production.js`) con carga dinámica de modelos desde la plantilla seleccionada.
- **Motor de Cálculos (TDD-ready)**: Clase `Calculator` en `calculator.js` con funciones puras (`calcMeters`, `calcEfficiency`, `runSession`).
- **OCR Modular**: Wrapper aislado de Tesseract.js en `ocr.js` para escanear tiempos de cambios desde fotos.
- **Navegación Cross-Module**: Sistema de eventos personalizados (`template-selected`, `switch-tab`) para comunicación entre pestañas sin acoplamiento.
- **Gestor de Plantillas (CRUD)**: Módulo de UI (`ui-templates.js`) para crear, editar y eliminar plantillas de producción. Soporta múltiples modelos por plantilla de forma dinámica.
- **Arquitectura Base**: Nueva estructura modular de archivos (`/js`, `/css`).
- **Motor de Temas**: Implementado selector de Paleta de Colores (Dark, Light, Industrial) y Formato/Layout (Compacto, Expandido).
- **Almacenamiento Offline**: Integración de Dexie.js (IndexedDB) en `js/store.js` preparado para multi-tenant (`tenantId: 'local_default'`).
- **Script Anti-FOOC**: Solución en cabecera para evitar parpadeos al cargar temas almacenados en `localStorage`.

### Changed
- **Modelo de Datos de Plantillas**: Cada modelo ahora soporta múltiples medidas (`measures[]`) en lugar de una única `lengthMm`. Retrocompatible con datos antiguos.
- **UI de Producción**: Reemplazada la lista estática de modelos por un **picklist con barra de búsqueda**. El usuario busca, selecciona modelo+medida, y lo añade a la lista del día.
- **UI de Plantillas**: Cada modelo muestra un bloque con botón ➕ para añadir medidas adicionales.
- **Tests unitarios (tests.html)**: Corregidas las aserciones de coma flotante en `calcMeters` y un error tipográfico en la expectativa de metros de `runSession`.
- Refactorización de la interfaz PYL23 a "ProdCalc" genérica.
- Movido `index.html` original a `index.legacy.html` como backup.

### Security
- Asegurado el modelo de datos con requerimiento de `tenantId` para todas las tablas.

### Removed
- **Cambios de Bobina / OCR**: Eliminada toda la funcionalidad de escaneo de tiempos de cambio de bobina (Tesseract.js, `ocr.js`). La app se centra exclusivamente en eficiencia de piezas producidas.
- **Dependencia Tesseract.js**: Ya no se carga desde CDN.
- **js/ocr.js**: Eliminado el archivo huérfano para limpiar por completo el código muerto.
