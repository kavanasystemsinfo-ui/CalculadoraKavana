// Formato numérico español: punto para miles, coma para decimales.
// Regla de Jorge: 12.415 y 43,5. Se fuerza la agrupación porque es-ES
// no agrupa los números de cuatro cifras.

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatNumber } from '../js/format.js';

describe('formatNumber', () => {
    it('agrupa miles con punto', () => {
        assert.strictEqual(formatNumber(2400, 0), '2.400');
        assert.strictEqual(formatNumber(19200, 0), '19.200');
        assert.strictEqual(formatNumber(1200000, 0), '1.200.000');
    });

    it('no toca los números de tres cifras', () => {
        assert.strictEqual(formatNumber(860, 0), '860');
        assert.strictEqual(formatNumber(0, 0), '0');
    });

    it('usa coma decimal y respeta los decimales pedidos', () => {
        assert.strictEqual(formatNumber(1080.5, 2, 2), '1.080,50');
        assert.strictEqual(formatNumber(0.45, 2, 2), '0,45');
        assert.strictEqual(formatNumber(18.755, 1, 1), '18,8');
    });

    it('mínimo de decimales configurable', () => {
        assert.strictEqual(formatNumber(5160, 2, 2), '5.160,00');
        assert.strictEqual(formatNumber(5160, 0, 2), '5.160');
    });

    it('devuelve 0 si el valor no es un número', () => {
        assert.strictEqual(formatNumber(undefined, 0), '0');
        assert.strictEqual(formatNumber('abc', 0), '0');
    });
});
