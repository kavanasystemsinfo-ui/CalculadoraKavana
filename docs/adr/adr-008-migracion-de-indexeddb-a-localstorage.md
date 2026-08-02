# ADR-008: Migración de IndexedDB a localStorage

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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