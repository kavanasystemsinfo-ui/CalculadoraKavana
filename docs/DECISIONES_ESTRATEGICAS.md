# Registro de Decisiones Arquitectónicas (ADR)

> **Proyecto:** Calculadora Kavana  
> **Versión:** 2.5.0  
> **Última Actualización:** 2026-07-05  
> **Formato:** Basado en [Michael Nygard's ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

---

## Resumen de Decisiones

| ID | Decisión | Estado | Fecha |
|----|----------|--------|-------|
| ADR-001 | Arquitectura de Persistencia Offline | 🔄 Superada (ADR-008) | 2026-06-25 |
| ADR-002 | Modularidad sin Bundlers (Vanilla JS Modules) | ✅ Aceptada | 2026-06-25 |
| ADR-003 | Motor de Temas y Prevención de FOUC | ✅ Aceptada | 2026-06-25 |
| ADR-004 | Gestión Reactiva del DOM sin Virtual DOM | ✅ Aceptada | 2026-06-25 |
| ADR-005 | Comunicación Inter-Módulo vía CustomEvent | ✅ Aceptada | 2026-06-25 |
| ADR-006 | Medidas Múltiples por Modelo y Picklist Buscable | ✅ Aceptada | 2026-06-25 |
| ADR-007 | Eliminación de Cambios de Bobina y OCR | ✅ Aceptada | 2026-06-26 |
| ADR-008 | Migración de IndexedDB a localStorage | ✅ Aceptada | 2026-06-26 |
| ADR-009 | Botón Meta 100% con Desglose Greedy | ✅ Aceptada | 2026-07-05 |

---

## ADR-001: Arquitectura de Persistencia Offline

**Fecha:** 25 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

La aplicación PYL23 original almacenaba los datos de forma síncrona o efímera. Para convertirla en una herramienta de nivel industrial ("Suelo de fábrica"), necesitamos garantizar que funcione 100% offline y pueda almacenar grandes cantidades de datos históricos y plantillas sin bloquear la interfaz de usuario.

### Decisión

Se ha decidido utilizar **Dexie.js** (un wrapper sobre IndexedDB) en lugar de `localStorage` para los datos transaccionales (Plantillas y Sesiones de Producción). Adicionalmente, se inyecta un campo `tenantId` con valor `local_default` en todos los registros.

### Consecuencias

**Positivas:**
- La UI no se congela al guardar datos (asíncrono)
- El límite de almacenamiento pasa de ~5MB (localStorage) a Gigabytes
- El modelo de datos con `tenantId` permite una futura sincronización transparente con un backend en la nube (MERN/Supabase) en modo multi-tenant

**Negativas:**
- Añade una pequeña dependencia de librería (Dexie)
- Las operaciones de base de datos requieren `async/await` en lugar del acceso síncrono de `localStorage`

### Nota de Evolución

> **UPDATE (2026-06-26):** Se revirtió esta decisión en ADR-008. Se migró de Dexie.js/IndexedDB a localStorage para simplificar la arquitectura y eliminar dependencias.

---

## ADR-002: Modularidad sin Bundlers (Vanilla JS Modules)

**Fecha:** 25 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

El código original residía en un único archivo `index.html` de más de 1500 líneas. Esto iba en contra de los principios de código limpio y Anti-Espagueti.

### Decisión

Refactorizar el código en múltiples archivos Javascript (`app.js`, `store.js`, `theme.js`, etc.) utilizando **ES Modules** nativos del navegador (`<script type="module">`).

### Consecuencias

**Positivas:**
- Código altamente legible, mantenible y escalable
- Demuestra capacidades de arquitectura sin depender de "magia" de frameworks
- Cada módulo tiene una responsabilidad clara (Single Responsibility Principle)

**Negativas:**
- Obliga a servir la aplicación mediante un servidor web (aunque sea local) para evitar problemas de CORS con la importación de módulos (`file://` protocol no permite ES Modules)

---

## ADR-003: Motor de Temas y Prevención de FOUC

**Fecha:** 25 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

Se solicitó la capacidad de tener varios temas visuales (colores) y layouts (compacto/expandido). Si estas preferencias se cargan asíncronamente o tarde, la pantalla parpadea (Flash of Unstyled Content).

### Decisión

Mantener las preferencias visuales estrictamente en `localStorage` (síncrono) y ejecutar un script inline bloqueante en el `<head>` del HTML antes de renderizar el `<body>`.

### Consecuencias

**Positivas:**
- Carga visual inmediata y perfectamente suave, vital para una percepción "Premium" (regla CAVANNA UX)
- Sin parpadeos al cargar la aplicación

**Negativas:**
- Divide el almacenamiento de la app en dos motores: Dexie (Negocio) y localStorage (UI/UX)

---

## ADR-004: Gestión Reactiva del DOM sin Virtual DOM

**Fecha:** 25 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

Al desarrollar el gestor de plantillas (CRUD), surgió la necesidad de renderizar listas dinámicas de modelos y plantillas. Se descartó usar React/Vue por las reglas impuestas.

### Decisión

Utilizar `innerHTML` con Template Literals (`` `...` ``) para renderizado unidireccional y delegación de eventos directa, reconstruyendo el árbol local de la lista en cada mutación (re-render de listas pequeñas).

### Consecuencias

**Positivas:**
- 0 bytes extra de librerías
- Extremadamente rápido para listas pequeñas/medianas (menos de 50 elementos)
- Código predecible sin reconciliación de Virtual DOM

**Negativas:**
- Si un usuario llega a tener cientos de plantillas, el re-render de la lista completa vía `innerHTML` causará pérdida de estado de scroll o foco
- Dada la naturaleza de la app (una fábrica no tiene 500 líneas distintas), se asume el riesgo

---

## ADR-005: Comunicación Inter-Módulo vía CustomEvent

**Fecha:** 25 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

Al separar la UI en módulos independientes (`ui-templates.js`, `ui-production.js`), surge la necesidad de que un módulo notifique a otro (ej: "el usuario ha seleccionado la plantilla X, cambia a la pestaña de Producción").

### Decisión

Utilizar `window.dispatchEvent(new CustomEvent(...))` como bus de eventos ligero. Cada módulo escucha los eventos que le interesan y reacciona de forma autónoma.

### Consecuencias

**Positivas:**
- Desacoplamiento total entre módulos
- No hay imports circulares ni referencias cruzadas
- Es el mismo patrón que usa el DOM nativo

**Negativas:**
- No hay tipado estático ni autocompletado para los nombres de eventos
- Se mitiga documentando los eventos en este ADR

### Eventos Registrados

| Evento | Emisor | Payload | Descripción |
|--------|--------|---------|-------------|
| `template-selected` | ui-templates.js | `{ id: string }` | Plantilla seleccionada |
| `switch-tab` | ui-templates.js, ui-history.js | `{ tab: string }` | Cambio de pestaña |

> **Nota:** Si la app crece a >10 eventos, considerar un EventBus con registro tipado.

---

## ADR-006: Medidas Múltiples por Modelo y Picklist Buscable

**Fecha:** 25 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

En un entorno real de fabricación, un mismo modelo (ej. "T-12B") puede fabricarse en diferentes longitudes (1038mm, 1200mm, 1500mm). El diseño original asumía una sola medida por modelo, lo que limitaba la flexibilidad. Además, cuando una plantilla tiene muchos modelos con muchas medidas, mostrar TODOS los inputs a la vez en la pantalla de Producción resulta abrumador.

### Decisión

1. **Modelo de datos**: Cada modelo pasa a tener un array `measures: [{ id, lengthMm }]` en lugar de un campo único `lengthMm`. Se mantiene retrocompatibilidad migrando automáticamente datos antiguos.
2. **Producción**: Reemplazar la lista estática por un **picklist con barra de búsqueda** donde el usuario escribe y filtra dinámicamente las combinaciones modelo+medida disponibles. Al seleccionar una opción, se añade como una tarjeta de entrada donde introducir los palets.

### Consecuencias

**Positivas:**
- UX mucho más limpia cuando hay decenas de combinaciones
- El usuario encuentra rápidamente lo que necesita escribiendo (ej. "T-12")
- Demuestra dominio de componentes de UI complejos sin librerías

**Negativas:**
- Mayor complejidad en el código de la UI de Producción
- El usuario debe "añadir" cada modelo manualmente en lugar de ver todos de golpe (trade-off deliberado de claridad vs. velocidad)

---

## ADR-007: Eliminación de Cambios de Bobina y OCR

**Fecha:** 26 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

La funcionalidad de escanear tiempos de cambio de bobina vía cámara (Tesseract.js OCR) era un remanente de la calculadora original PYL23, específica para líneas de acero. Al generalizar la app para cualquier tipo de producción, esta funcionalidad deja de tener sentido universal.

### Decisión

Eliminar por completo: el módulo `ocr.js`, la sección de cambios de bobina de la UI de Producción, la dependencia CDN de Tesseract.js, y los campos `coilMinutes`/`coilEfficiency` del motor de cálculos y exportación.

### Consecuencias

**Positivas:**
- ~300KB menos en carga inicial (Tesseract.js es pesado)
- UI más limpia y enfocada
- Código más sencillo de mantener

**Negativas:**
- Si un usuario de acero necesita esta funcionalidad en el futuro, habrá que reimplementarla
- El código original se conserva en `index.legacy.html` como referencia

---

## ADR-008: Migración de IndexedDB a localStorage

**Fecha:** 26 de Junio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

La implementación inicial usaba Dexie.js (IndexedDB) para persistencia. Sin embargo, para un portafolio y dada la naturaleza de la app (datos pequeños, uso individual), la complejidad de IndexedDB no está justificada.

### Decisión

Migrar de Dexie.js/IndexedDB a **localStorage** como capa de persistencia. Los métodos de storage ahora son síncronos.

### Consecuencias

**Positivas:**
- Eliminación de dependencia Dexie.js (~15KB)
- APIs síncronas más simples de usar
- Código más fácil de entender y mantener
- Compatibilidad universal con navegadores

**Negativas:**
- Límite de almacenamiento reducido (~5-10MB vs Gigabytes)
- datos son síncronos (puede bloquear UI con datos muy grandes)
- Mitigado por funcionalidad de exportación JSON

---

## ADR-009: Botón Meta 100% con Desglose Greedy

**Fecha:** 5 de Julio de 2026  
**Estado:** Aceptada  
**Decidido por:** Equipo de Arquitectura

### Contexto

Los operarios necesitan saber antes de empezar el turno cuántas piezas deben producir para alcanzar el 100% de eficiencia. El cálculo simple (piezas = eficiencia × horas) no es suficiente; necesitan ver el desglose en unidades de trabajo (palets, filas, paquetes).

### Decisión

Implementar un botón "🎯 Meta 100%" que:
1. Calcule: `piezasNecesarias = eficienciaEsperada × horasTurno`
2. Muestre el total de piezas en grande
3. Desglose por modelo usando algoritmo greedy:
   - Maximizar palets completos
   - Luego filas con el resto
   - Luego paquetes con el resto

### Consecuencias

**Positivas:**
- Los operarios conocen su objetivo antes de empezar
- Desglose visual facilita la planificación
- Algoritmo greedy produce desglose óptimo (máximos palets)

**Negativas:**
- El total puede ser ligeramente superior al necesario (por redondeo hacia arriba en paquetes)
- Se asume que el primer modelo es representativo para el desglose
- Añade complejidad a la UI de producción

### Algoritmo

```javascript
const pallets = Math.floor(totalNecesarias / piecesPerPallet);
let resto = totalNecesarias % piecesPerPallet;
const filas = Math.floor(resto / piecesPerRow);
resto = resto % piecesPerRow;
const paquetes = resto > 0 ? Math.ceil(resto / piecesPerPackage) : 0;
```

---

*Documento mantenido por el equipo de Arquitectura de Sistemas. Última revisión: 2026-07-05.*
