# Registro de Decisiones Estratégicas (ADR)

Este documento registra las decisiones arquitectónicas clave tomadas durante el desarrollo de ProdCalc, asegurando que el "por qué" detrás de la ingeniería se preserve para futuros desarrollos o auditorías.

---

## ADR 001: Arquitectura de Persistencia Offline
**Fecha:** 25 de Junio de 2026
**Estado:** Aceptado

### Contexto
La aplicación PYL23 original almacenaba los datos de forma síncrona o efímera. Para convertirla en una herramienta de nivel industrial ("Suelo de fábrica"), necesitamos garantizar que funcione 100% offline y pueda almacenar grandes cantidades de datos históricos y plantillas sin bloquear la interfaz de usuario.

### Decisión
Se ha decidido utilizar **Dexie.js** (un wrapper sobre IndexedDB) en lugar de `localStorage` para los datos transaccionales (Plantillas y Sesiones de Producción). 
Adicionalmente, se inyecta un campo `tenantId` con valor `local_default` en todos los registros.

### Consecuencias (Trade-offs)
- **Positivas:** 
  - La UI no se congela al guardar datos (asíncrono).
  - El límite de almacenamiento pasa de ~5MB (localStorage) a Gigabytes.
  - El modelo de datos con `tenantId` permite una futura sincronización transparente con un backend en la nube (MERN/Supabase) en modo multi-tenant.
- **Negativas:** 
  - Añade una pequeña dependencia de librería (Dexie).
  - Las operaciones de base de datos requieren `async/await` en lugar del acceso síncrono de `localStorage`.

---

## ADR 002: Modularidad sin Bundlers (Vanilla JS Modules)
**Fecha:** 25 de Junio de 2026
**Estado:** Aceptado

### Contexto
El código original residía en un único archivo `index.html` de más de 1500 líneas. Esto iba en contra de los principios de código limpio y Anti-Espagueti.

### Decisión
Refactorizar el código en múltiples archivos Javascript (`app.js`, `store.js`, `theme.js`, etc.) utilizando **ES Modules** nativos del navegador (`<script type="module">`).

### Consecuencias
- **Positivas:** Código altamente legible, mantenible y escalable. Demuestra capacidades de arquitectura sin depender de "magia" de frameworks.
- **Negativas:** Obliga a servir la aplicación mediante un servidor web (aunque sea local) para evitar problemas de CORS con la importación de módulos (`file://` protocol no permite ES Modules).

---

## ADR 003: Motor de Temas y Prevención de FOUC
**Fecha:** 25 de Junio de 2026
**Estado:** Aceptado

### Contexto
Se solicitó la capacidad de tener varios temas visuales (colores) y layouts (compacto/expandido). Si estas preferencias se cargan asíncronamente o tarde, la pantalla parpadea (Flash of Unstyled Content).

### Decisión
Mantener las preferencias visuales estrictamente en `localStorage` (síncrono) y ejecutar un script inline bloqueante en el `<head>` del HTML antes de renderizar el `<body>`.

### Consecuencias
- **Positivas:** Carga visual inmediata y perfectamente suave, vital para una percepción "Premium" (regla CAVANNA UX).
- **Negativas:** Divide el almacenamiento de la app en dos motores: Dexie (Negocio) y localStorage (UI/UX).

---

## ADR 004: Gestión Reactiva del DOM sin Virtual DOM
**Fecha:** 25 de Junio de 2026
**Estado:** Aceptado

### Contexto
Al desarrollar el gestor de plantillas (CRUD), surgió la necesidad de renderizar listas dinámicas de modelos y plantillas. Se descartó usar React/Vue por las reglas impuestas.

### Decisión
Utilizar `innerHTML` con Template Literals (`` `...` ``) para renderizado unidireccional y delegación de eventos directa, reconstruyendo el árbol local de la lista en cada mutación (re-render de listas pequeñas).

### Consecuencias
- **Positivas:** 0 bytes extra de librerías. Extremadamente rápido para listas pequeñas/medianas (menos de 50 elementos).
- **Negativas:** Si un usuario llega a tener cientos de plantillas, el re-render de la lista completa vía `innerHTML` causará pérdida de estado de scroll o foco. Dada la naturaleza de la app (una fábrica no tiene 500 líneas distintas), se asume el riesgo.

---

## ADR 005: Comunicación Inter-Módulo vía CustomEvent
**Fecha:** 25 de Junio de 2026
**Estado:** Aceptado

### Contexto
Al separar la UI en módulos independientes (`ui-templates.js`, `ui-production.js`), surge la necesidad de que un módulo notifique a otro (ej: "el usuario ha seleccionado la plantilla X, cambia a la pestaña de Producción").

### Decisión
Utilizar `window.dispatchEvent(new CustomEvent(...))` como bus de eventos ligero. Cada módulo escucha los eventos que le interesan y reacciona de forma autónoma.

### Consecuencias
- **Positivas:** Desacoplamiento total entre módulos. No hay imports circulares ni referencias cruzadas. Es el mismo patrón que usa el DOM nativo.
- **Negativas:** No hay tipado estático ni autocompletado para los nombres de eventos. Se mitiga documentando los eventos en este ADR: `template-selected` (payload: `{ id }`), `switch-tab` (payload: `{ tab }`).

// ponytail: Si la app crece a >10 eventos, considerar un EventBus con registro tipado.

---

## ADR 006: Medidas Múltiples por Modelo y Picklist Buscable
**Fecha:** 25 de Junio de 2026
**Estado:** Aceptado

### Contexto
En un entorno real de fabricación, un mismo modelo (ej. "T-12B") puede fabricarse en diferentes longitudes (1038mm, 1200mm, 1500mm). El diseño original asumía una sola medida por modelo, lo que limitaba la flexibilidad. Además, cuando una plantilla tiene muchos modelos con muchas medidas, mostrar TODOS los inputs a la vez en la pantalla de Producción resulta abrumador.

### Decisión
1. **Modelo de datos**: Cada modelo pasa a tener un array `measures: [{ id, lengthMm }]` en lugar de un campo único `lengthMm`. Se mantiene retrocompatibilidad migrando automáticamente datos antiguos.
2. **Producción**: Reemplazar la lista estática por un **picklist con barra de búsqueda** donde el usuario escribe y filtra dinámicamente las combinaciones modelo+medida disponibles. Al seleccionar una opción, se añade como una tarjeta de entrada donde introducir los palets.

### Consecuencias
- **Positivas:** UX mucho más limpia cuando hay decenas de combinaciones. El usuario encuentra rápidamente lo que necesita escribiendo (ej. "T-12"). Demuestra dominio de componentes de UI complejos sin librerías.
- **Negativas:** Mayor complejidad en el código de la UI de Producción. El usuario debe "añadir" cada modelo manualmente en lugar de ver todos de golpe (trade-off deliberado de claridad vs. velocidad).

---

## ADR 007: Eliminación de Cambios de Bobina y OCR
**Fecha:** 26 de Junio de 2026
**Estado:** Aceptado

### Contexto
La funcionalidad de escanear tiempos de cambio de bobina vía cámara (Tesseract.js OCR) era un remanente de la calculadora original PYL23, específica para líneas de acero. Al generalizar la app para cualquier tipo de producción, esta funcionalidad deja de tener sentido universal.

### Decisión
Eliminar por completo: el módulo `ocr.js`, la sección de cambios de bobina de la UI de Producción, la dependencia CDN de Tesseract.js, y los campos `coilMinutes`/`coilEfficiency` del motor de cálculos y exportación.

### Consecuencias
- **Positivas:** ~300KB menos en carga inicial (Tesseract.js es pesado). UI más limpia y enfocada. Código más sencillo de mantener.
- **Negativas:** Si un usuario de acero necesita esta funcionalidad en el futuro, habrá que reimplementarla. El código original se conserva en `index.legacy.html` como referencia.
