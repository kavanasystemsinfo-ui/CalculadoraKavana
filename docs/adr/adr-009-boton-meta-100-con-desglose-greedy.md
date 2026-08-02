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

---

*Documento mantenido por el equipo de Arquitectura de Sistemas. Última revisión: 2026-07-05.*