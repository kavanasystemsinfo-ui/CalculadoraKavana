# ADR-007: Eliminación de Cambios de Bobina y OCR

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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