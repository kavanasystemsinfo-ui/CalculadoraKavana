# Decisiones técnicas — CALCULADORA KAVANA

Este documento consolida las decisiones de arquitectura e ingeniería del proyecto.
Cada decisión tiene su ADR con contexto, alternativas y consecuencias. Git describe
qué cambió; este documento explica por qué.

- **ADRs**: [`docs/DECISIONES_ESTRATEGICAS.md`](docs/DECISIONES_ESTRATEGICAS.md) (registro completo, formato Michael Nygard)

---

## ADRs (9 documentados)

| # | Decisión | Estado |
|---|----------|--------|
| 001 | Arquitectura de Persistencia Offline (Dexie/IndexedDB) | 🔄 Superada por ADR-008 |
| 002 | Modularidad sin Bundlers (Vanilla JS Modules) | ✅ Aceptada |
| 003 | Motor de Temas y Prevención de FOUC | ✅ Aceptada |
| 004 | Gestión Reactiva del DOM sin Virtual DOM | ✅ Aceptada |
| 005 | Comunicación Inter-Módulo vía CustomEvent | ✅ Aceptada |
| 006 | Medidas Múltiples por Modelo y Picklist Buscable | ✅ Aceptada |
| 007 | Eliminación de Cambios de Bobina y OCR | ✅ Aceptada |
| 008 | Migración de IndexedDB a localStorage | ✅ Aceptada |
| 009 | Botón Meta 100% con Desglose Greedy | ✅ Aceptada |

## Decisiones clave (resumen ejecutivo)

### 1. PWA offline-first, zero infrastructure
Aplicación client-side pura: sin backend, sin servidores, sin API keys. Service
Worker (`sw.js`) cachea todos los assets y la app funciona 100% offline en
tablets industriales y terminales de planta. Despliegue estático compatible con
GitHub Pages, Vercel o cualquier CDN.

### 2. Vanilla JS Modules en vez de framework
ES Modules nativos sin bundler. Cero dependencias de runtime, carga instantánea
(<500ms). Se descartaron React/Vue/Angular por el coste que aportan a una app de
una sola página con lógica acotada (ADR-002).

### 3. localStorage en vez de IndexedDB/Dexie
La primera implementación usó Dexie.js (IndexedDB) por su capacidad, pero para
una app de datos pequeños y uso individual la complejidad no estaba justificada.
Se migró a localStorage (ADR-008): APIs síncronas, cero dependencias, compatible
con todos los navegadores. Trade-off: límite de ~5-10MB.

### 4. CustomEvent bus en vez de estado global
Los módulos UI (producción, plantillas, historial) se comunican con un bus de
CustomEvents, sin estado global compartido. Desacoplamiento sin dependencias
(ADR-005).

### 5. Meta 100% con desglose greedy
El botón "Meta 100%" calcula las piezas necesarias para alcanzar el 100% de
eficiencia y las desglosa en PALETS + FILAS + PAQUETES por modelo activo, con un
algoritmo greedy que reparte el déficit entre los modelos (ADR-009).

### 6. Modelo de datos con tenantId
Todos los registros llevan `tenantId` (`local_default`) para permitir una futura
sincronización multi-tenant con backend (MERN/Supabase) sin migración de datos.

---

## Verificación (2026-08-02)

- **34 tests, todos verdes** (22 engine + 6 storage + 6 theme) con `node --test`
  nativo, sin dependencias: `cd tests && npm test`
- App desplegada y funcionando: `https://kavanasystemsinfo-ui.github.io/CalculadoraKavana/`
- PWA instalable verificada: `sw.js` + `manifest.json` presentes y correctos

## Por qué este documento existe

Un reclutador técnico que siga el embudo CV → Landing → GitHub debe encontrar en
el repo la misma historia que cuenta la landing. Cada decisión aquí es verificable
en el código: módulos, persistencia y fórmulas. Si una afirmación no se puede
verificar, no está en este documento.
