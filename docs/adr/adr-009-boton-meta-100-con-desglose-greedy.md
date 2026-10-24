# ADR-009: Botón Meta 100% con Desglose Greedy

> Documento individual extraído de [DECISIONES_ESTRATEGICAS.md](../DECISIONES_ESTRATEGICAS.md)

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

*Documento mantenido por el equipo de Arquitectura de Sistemas. Última revisión: 2026-10-24.*