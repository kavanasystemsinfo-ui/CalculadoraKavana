/**
 * Módulo de cálculos de producción industrial (TDD-friendly, sin dependencias del DOM).
 */

export class Calculator {
    /**
     * Calcula los metros lineales a partir de la longitud de la pieza y la cantidad de piezas.
     * @param {number} lengthMm Longitud en milímetros.
     * @param {number} pieces Cantidad de piezas.
     * @returns {number} Metros lineales totales.
     */
    static calcMeters(lengthMm, pieces) {
        if (!lengthMm || !pieces || lengthMm < 0 || pieces < 0) return 0;
        return (lengthMm / 1000) * pieces;
    }

    /**
     * Calcula la eficiencia general de un turno.
     * @param {number} totalProduced Cantidad producida (piezas o metros, según el template).
     * @param {number} expectedEfficiency Velocidad teórica esperada (piezas/h o metros/h).
     * @param {number} shiftHours Horas del turno.
     * @returns {Object} { theoreticalTime, efficiency }
     */
    static calcEfficiency(totalProduced, expectedEfficiency, shiftHours) {
        if (!totalProduced || !expectedEfficiency || !shiftHours) {
            return { theoreticalTime: 0, efficiency: 0 };
        }

        const theoreticalTime = totalProduced / expectedEfficiency;
        const efficiencyPct = (theoreticalTime / shiftHours) * 100;

        return {
            theoreticalTime: Number(theoreticalTime.toFixed(2)),
            efficiency: Number(efficiencyPct.toFixed(2))
        };
    }

    /**
     * Ejecuta el cálculo completo para una sesión de producción.
     * @param {Object} template La plantilla usada.
     * @param {Array} entries Entradas de producción { lengthMm, pieces }.
     * @param {number} shiftHours Horas del turno.
     * @returns {Object} Resultados agregados de la sesión.
     */
    static runSession(template, entries, shiftHours) {
        let totalPieces = 0;
        let totalMeters = 0;

        entries.forEach(e => {
            const pieces = e.pieces || 0;
            totalPieces += pieces;
            totalMeters += this.calcMeters(e.lengthMm, pieces);
        });

        const isMeters = template.efficiencyType === 'meters_per_hour';
        const totalProduced = isMeters ? totalMeters : totalPieces;
        const expected = template.expectedEfficiency;

        const calc = this.calcEfficiency(totalProduced, expected, shiftHours);

        return {
            totalPieces,
            totalMeters,
            theoreticalTime: calc.theoreticalTime,
            efficiency: calc.efficiency
        };
    }
}
