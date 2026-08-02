# ADR-006: Medidas Múltiples por Modelo y Picklist Buscable

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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