# ADR-010: Coste cero y decisiones tomadas por presupuesto

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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
