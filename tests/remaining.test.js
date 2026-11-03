// Tests for Calculator.remainingForTarget + targetForShift (importa el módulo REAL,
// no una réplica): son las dos funciones puras que alimentan la tarjeta
// "Te falta para el 100%" de la pantalla de turno.

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Calculator } from '../js/calculator.js';

describe('Calculator.targetForShift', () => {
    it('en metros/hora devuelve metros del turno', () => {
        const r = Calculator.targetForShift({ efficiencyType: 'meters_per_hour', expectedEfficiency: 2400 }, 7.5);
        assert.strictEqual(r.totalProduced, 18000);
        assert.strictEqual(r.unit, 'm');
    });

    it('en piezas/hora devuelve piezas del turno', () => {
        const r = Calculator.targetForShift({ efficiencyType: 'pieces_per_hour', expectedEfficiency: 2500 }, 8);
        assert.strictEqual(r.totalProduced, 20000);
        assert.strictEqual(r.unit, 'pz');
    });

    it('sin datos devuelve cero', () => {
        const r = Calculator.targetForShift({ efficiencyType: 'meters_per_hour', expectedEfficiency: 0 }, 8);
        assert.strictEqual(r.totalProduced, 0);
    });
});

describe('Calculator.remainingForTarget', () => {
    const cfg = { piecesPerPallet: 60, piecesPerRow: 4, piecesPerPackage: 12 };

    it('desglosa lo que falta en palets, filas y paquetes', () => {
        // 3.000 necesarias - 860 producidas = 2.140
        const r = Calculator.remainingForTarget(3000, 860, cfg);
        assert.strictEqual(r.missingPieces, 2140);
        assert.strictEqual(r.pallets, 35);   // 35 × 60 = 2.100
        assert.strictEqual(r.rows, 10);      // 10 × 4 = 40
        assert.strictEqual(r.packages, 0);   // 2.100 + 40 = 2.140 exacto
        assert.strictEqual(r.totalPieces, 2140);
    });

    it('redondea el paquete hacia arriba cuando sobra una pieza', () => {
        const r = Calculator.remainingForTarget(250, 0, cfg);
        assert.strictEqual(r.pallets, 4);    // 240
        assert.strictEqual(r.rows, 2);       // 8 → 248
        assert.strictEqual(r.packages, 1);   // 2 piezas → 1 paquete (12)
        assert.ok(r.totalPieces >= 250);
    });

    it('nunca devuelve cantidades negativas si ya se superó el objetivo', () => {
        const r = Calculator.remainingForTarget(1000, 1200, cfg);
        assert.strictEqual(r.missingPieces, 0);
        assert.strictEqual(r.pallets, 0);
        assert.strictEqual(r.rows, 0);
        assert.strictEqual(r.packages, 0);
    });

    it('usa valores por defecto si el modelo no define palet/fila/paquete', () => {
        const r = Calculator.remainingForTarget(960, 0, {});
        assert.strictEqual(r.pallets, 2);    // 480 por defecto
        assert.strictEqual(r.totalPieces, 960);
    });
});
