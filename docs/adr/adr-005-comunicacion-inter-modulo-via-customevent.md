# ADR-005: Comunicación Inter-Módulo vía CustomEvent

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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