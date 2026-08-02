# ADR-004: Gestión Reactiva del DOM sin Virtual DOM

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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