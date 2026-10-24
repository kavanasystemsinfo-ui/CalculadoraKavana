# Registro de Decisiones Arquitectónicas (ADR)

> **Proyecto:** Calculadora Kavana  
> **Versión:** 2.5.0  
> **Última Actualización:** 2026-09-17  
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
| ADR-010 | Coste cero y decisiones tomadas por presupuesto | ✅ Aceptada | 2026-09-17 |

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

### Nota de revisión (2026-10-24)

Cómo funciona hoy, comprobado en la app publicada y en `js/ui-production.js`:

- El objetivo del turno es `eficienciaEsperada × horasTurno`, en la unidad de la línea: piezas en las plantillas de piezas/hora y metros en las de metros/hora.
- El botón solo muestra resultado si hay al menos un modelo añadido a la producción del turno.
- El desglose se calcula para cada modelo por separado, como si todo el turno se dedicara a ese modelo. El objetivo **no se reparte** entre los modelos: cuánto se fabrica de cada uno lo decide la orden de producción, no la app.
- En las plantillas de metros/hora, la cifra grande convierte los metros a piezas con el largo del **primer** modelo añadido. Si hay modelos de largos distintos, esa cifra solo vale para el primero; el desglose de cada modelo sí usa su propio largo.

---

## ADR-010: Coste cero y decisiones tomadas por presupuesto

**Fecha:** 17 de Septiembre de 2026  
**Estado:** Aceptada  
**Decidido por:** Jorge (KAVANA) — restricción de presupuesto

### Contexto

Calculadora Kavana es una pieza de portafolio con **un solo usuario real: su autor**, que la usa en su propio puesto de trabajo. No hay clientes, no hay contrato y no hay presupuesto de operación: el objetivo declarado es costar ~0 €/mes. Esa restricción condiciona decisiones que en un producto con usuarios reales se tomarían de otra forma (persistencia, autenticación, hosting, modelo del asistente, límites de uso).

El riesgo de no documentarlo es que esas limitaciones se lean como descuidos técnicos en lugar de lo que son: elecciones de coste conscientes y reversibles. Este ADR no cambia ningún comportamiento del sistema; fija el criterio y la señal que obliga a revisarlo.

### Decisión

Mantener el coste de operación en ~0 €/mes mientras el único usuario real sea el autor, y aceptar explícitamente las limitaciones que eso impone, dejando aislados los puntos de acoplamiento para que el salto a usuarios reales no exija reescribir el núcleo:

1. Hosting estático en GitHub Pages con dominio propio (`CNAME`).
2. Persistencia en `localStorage` tras la abstracción de `js/store.js` (ADR-008).
3. Sin autenticación ni multi-usuario.
4. Único backend: el asistente RAG de `backend/` en el mínimo de Fly.io (`auto_stop_machines = "stop"`, `min_machines_running = 0`, 256 MB compartidos).
5. LLM free-tier vía OpenRouter e índice TF-IDF construido en memoria (sin base de datos vectorial).
6. Límite de 15 preguntas/día por IP en un diccionario en memoria, aceptando que se pierde al reiniciar.
7. Sin vendorizar los assets de CDN (SheetJS 0.20.2 y fuente Inter).

### Decisiones tomadas por presupuesto

| Partida | Hoy, y por qué | Evidencia en el repo | Con usuarios reales |
|---------|----------------|----------------------|---------------------|
| Hosting | GitHub Pages estático con dominio propio: 0 € y cero mantenimiento | `CNAME`, `docs/deployment-guide.md` | Hosting con SLA y entornos separados de staging/producción |
| Persistencia | `localStorage` síncrono, sin dependencias; techo ~5-10 MB y datos en un solo dispositivo | `js/store.js`, ADR-008, TD-003 | Base de datos compartida con sincronización cloud y copias automáticas |
| Identidad | Sin autenticación: la identidad es el navegador | `js/app.js`, ausencia de módulo de auth | Login, roles operario/supervisor y aislamiento por planta |
| Backup | Export/import JSON manual: el usuario es su propio backup | `js/export.js`, registro de riesgos de `docs/roadmap.md` | Copias automáticas y restauración verificada |
| Servidor | Un único backend, dimensionado al mínimo, que se para cuando no se usa | `fly.toml`, `backend/fly.toml`, `backend/Dockerfile` | Dimensionado por carga medida, con métricas y alertas |
| LLM | Modelo free-tier de OpenRouter, el mismo para los dos alias de entorno | `backend/app/assistant.py` | Modelo de pago con SLA y presupuesto de tokens |
| Recuperación | TF-IDF en memoria al primer arranque, sin embeddings ni vector store | `backend/app/assistant.py` | Embeddings y almacén vectorial gestionado |
| Límites de uso | Contador por IP en memoria (15/día), se pierde al reiniciar | `backend/app/assistant.py` | Cuotas por cuenta en Redis/base de datos y panel de uso |
| Observabilidad | Sin telemetría ni error tracking | `docs/roadmap.md` (Sentry, Lighthouse CI: pendientes) | Trazas, errores y rendimiento monitorizados |
| Assets externos | SheetJS e Inter por CDN, fuera del precaché de `sw.js` | `index.html`, `sw.js`, riesgo asumido en `docs/roadmap.md` | Assets servidos desde el propio dominio |
| Calidad de UI | Tests de UI manuales; CI que ignora `docs/**` y `**.md` | `.github/workflows/ci.yml`, TD-004 | Tests de UI automatizados y gate de CI bloqueante |

### Alternativas evaluadas

| Alternativa | Estado | Motivo |
|-------------|--------|--------|
| Supabase / Postgres gestionado para sincronizar datos | No implementada (prioridad alta en el roadmap) | Exige plan de pago y login; con un solo usuario no hay nada que compartir |
| Servidor propio (Nginx/Apache) sirviendo el estático | Documentada en `docs/deployment-guide.md`, no usada | GitHub Pages sirve lo mismo sin coste ni mantenimiento |
| Autenticación con cuentas de usuario | No existe | Sin segundo usuario no hay datos que proteger de terceros |
| Modelo LLM de pago con SLA | No usado | El free-tier cubre el tráfico real del asistente (uso esporádico de un visitante) |
| Base de datos vectorial / embeddings para el RAG | No usada | El corpus son los documentos de este repo; el TF-IDF en memoria es suficiente y gratis |
| Rate limit en Redis o base de datos | No usado | Con el tráfico actual el diccionario en memoria basta; perderlo al reiniciar se acepta |
| Vendorizar SheetJS y la fuente Inter | No usado | El riesgo de CDN está asumido en el registro de riesgos del roadmap |
| IndexedDB / Dexie.js para persistencia | Descartada antes (ADR-008) | Complejidad no justificada para datos pequeños de uso individual |

### Consecuencias

**Positivas:**
- Coste de operación ~0 €/mes y cero mantenimiento de infraestructura.
- Reversibilidad: los puntos de acoplamiento están aislados (`js/store.js` como capa de abstracción, `tenantId` reservado en el modelo de datos, backend separado en `backend/`), así que cada partida se puede sustituir sin tocar el núcleo.
- Las limitaciones quedan escritas y atribuidas a una restricción real, no disimuladas.

**Negativas:**
- Techo de ~5-10 MB por navegador y datos atados a un dispositivo; sin sincronización ni copias automáticas.
- Sin autenticación ni roles: no hay trazabilidad de quién hizo qué.
- El asistente depende de un free tier y de un contador que se pierde al reiniciar el proceso.
- El export a Excel depende de un CDN que no está en el precaché del service worker.
- El resumen del README ("sin servidores, sin API keys") describe la calculadora, no el backend del asistente: afirmación incompleta hasta que este ADR la acota.

### Señal de revisión

Este ADR se revisa cuando ocurra alguno de estos hechos, no por fecha:

1. Aparece un **segundo usuario real** (otra persona con sus propios datos) o alguien necesita ver los mismos datos desde dos dispositivos.
2. Los datos se acercan al límite de `localStorage` o el export manual deja de ser una copia de seguridad suficiente.
3. Se pide trazabilidad o permisos diferenciados (operario vs supervisor) o un informe que hoy no se pueda producir.
4. El asistente supera el límite de 15 preguntas/día por IP o el free tier empieza a rechazar peticiones.
5. Entra un cliente o presupuesto: entonces se reevalúan hosting, persistencia e identidad en ese orden, por ser las partidas que bloquean el uso multiusuario.

---

*Documento mantenido por el equipo de Arquitectura de Sistemas. Última revisión: 2026-09-17.*
