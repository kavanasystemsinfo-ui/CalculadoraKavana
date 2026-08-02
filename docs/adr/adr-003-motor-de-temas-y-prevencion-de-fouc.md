# ADR-003: Motor de Temas y Prevención de FOUC

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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