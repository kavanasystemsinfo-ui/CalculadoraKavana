# ADR-002: Modularidad sin Bundlers (Vanilla JS Modules)

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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