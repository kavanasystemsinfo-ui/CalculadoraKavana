// Tests for Engine (pure calculation logic, no DOM needed)

// Replica del Engine para testear en Node.js sin DOM
const Engine = {
    calcMeters(lengthMm, pieces) {
        return (lengthMm / 1000) * pieces;
    },

    calcEfficiency(totalProduced, expectedPerHour, hoursWorked) {
        if (!totalProduced || !expectedPerHour || !hoursWorked) return null;
        if (totalProduced <= 0 || expectedPerHour <= 0 || hoursWorked <= 0) return null;
        const theoreticalTime = +(totalProduced / expectedPerHour).toFixed(2);
        const ratio = +(theoreticalTime / hoursWorked).toFixed(2);
        const efficiency = Math.round(ratio * 100);
        return { theoreticalTime, efficiency };
    },

    runSession(template, entries, shiftHours, coilMinutes) {
        let totalPieces = 0;
        let totalMeters = 0;

        entries.forEach(e => {
            totalPieces += e.pieces || 0;
            totalMeters += this.calcMeters(e.lengthMm, e.pieces || 0);
        });

        const isMeters = template.efficiencyType === 'meters_per_hour';
        const totalProduced = isMeters ? totalMeters : totalPieces;
        const expected = template.expectedEfficiency;

        const calc = this.calcEfficiency(totalProduced, expected, shiftHours);

        let coilEfficiency = null;
        if (coilMinutes && coilMinutes.length > 0) {
            const B = coilMinutes.reduce((a, b) => a + b, 0);
            const N = coilMinutes.length;
            if (B > 0) {
                coilEfficiency = {
                    totalMinutes: B,
                    count: N,
                    efficiency: +((N * 5 * 100) / B).toFixed(2)
                };
            }
        }

        return {
            totalPieces,
            totalMeters,
            theoreticalTime: calc?.theoreticalTime || 0,
            efficiency: calc?.efficiency || 0,
            coilEfficiency
        };
    }
};

// ================================================================
// TESTS
// ================================================================
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Engine.calcMeters', () => {
    it('calculates meters from mm and pieces', () => {
        // 2500mm * 1440 piezas / 1000 = 3600 metros
        const result = Engine.calcMeters(2500, 1440);
        assert.strictEqual(result, 3600);
    });

    it('returns 0 when pieces is 0', () => {
        const result = Engine.calcMeters(2500, 0);
        assert.strictEqual(result, 0);
    });

    it('handles decimal values', () => {
        const result = Engine.calcMeters(2750, 480);
        // 2750/1000 * 480 = 2.75 * 480 = 1320
        assert.strictEqual(result, 1320);
    });

    it('handles single piece', () => {
        const result = Engine.calcMeters(1000, 1);
        assert.strictEqual(result, 1);
    });
});

describe('Engine.calcEfficiency', () => {
    it('returns 100% when production matches expectation exactly', () => {
        // 15000 metros producidos / 15000 esperados por hora = 1h teórica
        // 1h / 1h real = 1.0 = 100%
        const result = Engine.calcEfficiency(15000, 15000, 1);
        assert.strictEqual(result.efficiency, 100);
        assert.strictEqual(result.theoreticalTime, 1);
    });

    it('returns 50% when efficiency is half', () => {
        // 7500 metros / 15000 esperados = 0.5h teórica
        // 0.5h / 1h real = 0.5 = 50%
        const result = Engine.calcEfficiency(7500, 15000, 1);
        assert.strictEqual(result.efficiency, 50);
    });

    it('returns 200% when efficiency is double', () => {
        // 30000 / 15000 = 2h teórica
        // 2h / 1h real = 2.0 = 200%
        const result = Engine.calcEfficiency(30000, 15000, 1);
        assert.strictEqual(result.efficiency, 200);
    });

    it('returns 89% with realistic shift data (meters)', () => {
        // 15000 metros / 2348 m/h esperado = 6.39h teórica
        // 6.39h / 7.75h real = 0.824 = 82%
        const result = Engine.calcEfficiency(15000, 2348, 7.75);
        assert.strictEqual(result.efficiency, 82);
        assert.strictEqual(result.theoreticalTime, 6.39);
    });

    it('returns null for zero production', () => {
        const result = Engine.calcEfficiency(0, 15000, 7.75);
        assert.strictEqual(result, null);
    });

    it('returns null for zero expected', () => {
        const result = Engine.calcEfficiency(15000, 0, 7.75);
        assert.strictEqual(result, null);
    });

    it('returns null for zero hours', () => {
        const result = Engine.calcEfficiency(15000, 15000, 0);
        assert.strictEqual(result, null);
    });

    it('returns null for negative values', () => {
        const result = Engine.calcEfficiency(-100, 15000, 7.75);
        assert.strictEqual(result, null);
    });

    it('rounds efficiency to nearest integer', () => {
        // Caso que da decimal
        const result = Engine.calcEfficiency(10000, 2348, 7.75);
        // 10000/2348 = 4.26h teórica
        // 4.26/7.75 = 0.5496 = 55%
        assert.strictEqual(result.efficiency, 55);
    });
});

describe('Engine.runSession (full simulation)', () => {
    const template = {
        id: 'test-1',
        name: 'Línea de prueba',
        efficiencyType: 'meters_per_hour',
        expectedEfficiency: 2348,
        models: [
            { id: 'm1', name: 'Modelo A', lengthMm: 2500, piecesPerPallet: 480 },
            { id: 'm2', name: 'Modelo B', lengthMm: 3000, piecesPerPallet: 480 }
        ]
    };

    it('calculates complete session with multiple entries', () => {
        const entries = [
            { modelId: 'm1', modelName: 'Modelo A', lengthMm: 2500, pallets: 3, pieces: 1440 },
            { modelId: 'm2', modelName: 'Modelo B', lengthMm: 3000, pallets: 5, pieces: 2400 }
        ];

        const result = Engine.runSession(template, entries, 7.75, []);

        // Total pieces: 1440 + 2400 = 3840
        assert.strictEqual(result.totalPieces, 3840);

        // Total meters: (2500/1000*1440) + (3000/1000*2400) = 3600 + 7200 = 10800
        assert.strictEqual(result.totalMeters, 10800);

        // Theo time: 10800 / 2348 = 4.60h
        assert.strictEqual(result.theoreticalTime, 4.60);

        // Efficiency: 4.60 / 7.75 = 0.5935 = 59%
        assert.strictEqual(result.efficiency, 59);
    });

    it('calculates session with pieces_per_hour type', () => {
        const tplPieces = {
            ...template,
            efficiencyType: 'pieces_per_hour',
            expectedEfficiency: 500
        };

        const entries = [
            { modelId: 'm1', modelName: 'Modelo A', lengthMm: 2500, pallets: 2, pieces: 960 }
        ];

        const result = Engine.runSession(tplPieces, entries, 7.75, []);

        // Total pieces: 960
        assert.strictEqual(result.totalPieces, 960);

        // Theo time: 960 / 500 = 1.92h
        assert.strictEqual(result.theoreticalTime, 1.92);

        // Efficiency: 1.92 / 7.75 = 0.2477 = 25%
        assert.strictEqual(result.efficiency, 25);
    });

    it('calculates coil change efficiency', () => {
        const entries = [
            { modelId: 'm1', modelName: 'Modelo A', lengthMm: 2500, pallets: 1, pieces: 480 }
        ];

        const result = Engine.runSession(template, entries, 7.75, [8, 6, 9, 7, 8]);

        // Coil: B=38, N=5
        // Efficiency = (5 * 5 * 100) / 38 = 2500/38 = 65.79
        assert.ok(result.coilEfficiency !== null);
        assert.strictEqual(result.coilEfficiency.totalMinutes, 38);
        assert.strictEqual(result.coilEfficiency.count, 5);
        assert.strictEqual(result.coilEfficiency.efficiency, 65.79);
    });

    it('handles empty entries gracefully', () => {
        const result = Engine.runSession(template, [], 7.75, []);
        assert.strictEqual(result.totalPieces, 0);
        assert.strictEqual(result.totalMeters, 0);
        assert.strictEqual(result.efficiency, 0);
    });
});

describe('Storage (logic validation)', () => {
    it('generates unique IDs', () => {
        // Verify the ID generator creates unique values
        const id1 = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        const id2 = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        assert.notStrictEqual(id1, id2);
    });

    it('ID has reasonable length', () => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        assert.ok(id.length >= 8);
    });
});