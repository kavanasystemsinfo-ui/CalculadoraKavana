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
     * Objetivo del turno completo al 100% (lo que pide la tarjeta "Te falta").
     * @param {Object} template Plantilla con efficiencyType y expectedEfficiency.
     * @param {number} shiftHours Duración del turno en horas.
     * @returns {{totalProduced: number, unit: string}} Metros o piezas del turno.
     */
    /** ¿Esta sesión se mide en metros? Si no trae el dato (turnos antiguos), se mira el puesto. */
    static sessionUsesMeters(session, template) {
        const hasOwn = session && session.efficiencyType;
        return this.usesMeters(hasOwn ? session : template);
    }

    static usesMeters(source) {
        return Boolean(source) && source.enableEfficiency !== false && source.efficiencyType === 'meters_per_hour';
    }

    static targetForShift(template, shiftHours) {
        const expected = template?.expectedEfficiency;
        if (!expected || !shiftHours) return { totalProduced: 0, unit: 'pz' };

        const isMeters = template.efficiencyType === 'meters_per_hour';
        return {
            totalProduced: Math.round(expected * shiftHours),
            unit: isMeters ? 'm' : 'pz'
        };
    }

    /**
     * Convierte lo que falta para el 100% en lo que el operario cuenta en planta:
     * palets completos, luego filas, luego paquetes (redondeando el paquete hacia arriba).
     * @param {number} requiredPieces Piezas necesarias para el 100%.
     * @param {number} producedPieces Piezas ya contadas.
     * @param {Object} cfg {piecesPerPallet, piecesPerRow, piecesPerPackage}
     * @returns {{missingPieces:number, pallets:number, rows:number, packages:number, totalPieces:number}}
     */
    static remainingForTarget(requiredPieces, producedPieces, cfg = {}) {
        const perPallet = cfg.piecesPerPallet || 480;
        const perRow = cfg.piecesPerRow || 24;
        const perPackage = cfg.piecesPerPackage || 120;
        const missingPieces = Math.max(0, Math.round((requiredPieces || 0) - (producedPieces || 0)));

        if (missingPieces === 0) {
            return { missingPieces: 0, pallets: 0, rows: 0, packages: 0, totalPieces: 0 };
        }

        const pallets = Math.floor(missingPieces / perPallet);
        let rest = missingPieces % perPallet;
        const rows = Math.floor(rest / perRow);
        rest = rest % perRow;
        const packages = rest > 0 ? Math.ceil(rest / perPackage) : 0;

        return {
            missingPieces,
            pallets,
            rows,
            packages,
            totalPieces: pallets * perPallet + rows * perRow + packages * perPackage
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
