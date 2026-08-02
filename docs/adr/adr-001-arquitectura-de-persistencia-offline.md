# ADR-001: Arquitectura de Persistencia Offline

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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