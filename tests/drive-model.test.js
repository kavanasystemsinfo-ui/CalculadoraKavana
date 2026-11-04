// Filas y sincronización de la hoja de Drive (lógica pura, sin red ni DOM).

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
    sessionRow, entryRows, pendingSessions, chunkRows,
    spreadsheetTitle, SHEET_TURNOS, SHEET_DETALLE, HEADERS_TURNOS, HEADERS_DETALLE
} from '../js/drive-model.js';

const session = {
    id: 's1',
    date: '2026-11-03T08:15:00.000Z',
    templateName: 'Perfiladora 3',
    efficiencyType: 'meters_per_hour',
    expectedEfficiency: 2400,
    shiftHours: 7.5,
    efficiency: 88.33,
    totalPieces: 1291,
    totalMeters: 7099.5,
    theoreticalTime: 2.96,
    entries: [
        { modelName: 'Perfil C 200', lengthMm: 6000, pallets: 14, pieces: 860 },
        { modelName: 'Perfil C 150', lengthMm: 4500, pallets: 5, pieces: 431 }
    ]
};

describe('sessionRow', () => {
    it('devuelve una fila con el mismo número de columnas que la cabecera', () => {
        assert.strictEqual(sessionRow(session).length, HEADERS_TURNOS.length);
    });

    it('no mete texto con formato: los números van como números', () => {
        const row = sessionRow(session);
        assert.strictEqual(typeof row[3], 'number');
        assert.strictEqual(typeof row[4], 'number');
        assert.strictEqual(row[4], 88.33);
        assert.strictEqual(row[9], 'Metros/hora');
    });

    it('usa una fecha ordenable (YYYY-MM-DD)', () => {
        assert.match(sessionRow(session)[0], /^\d{4}-\d{2}-\d{2}$/);
    });

    it('aguanta una sesión sin datos opcionales', () => {
        const row = sessionRow({ id: 'x', date: '2026-01-01T00:00:00.000Z' });
        assert.strictEqual(row.length, HEADERS_TURNOS.length);
        assert.strictEqual(row[2], 'Línea');
        assert.strictEqual(row[8], 0);
    });
});

describe('entryRows', () => {
    it('genera una fila por modelo con sus metros', () => {
        const rows = entryRows(session);
        assert.strictEqual(rows.length, 2);
        assert.strictEqual(rows[0].length, HEADERS_DETALLE.length);
        assert.strictEqual(rows[0][2], 'Perfil C 200');
        assert.strictEqual(rows[0][6], 5160);
        assert.strictEqual(rows[1][6], 1939.5);
    });

    it('si el turno no tiene modelos deja una fila resumen', () => {
        const rows = entryRows({ date: '2026-01-01T00:00:00.000Z', templateName: 'L1', entries: [], totalPieces: 10, totalMeters: 60 });
        assert.strictEqual(rows.length, 1);
        assert.strictEqual(rows[0][2], 'Sin modelos');
    });
});

describe('pendingSessions', () => {
    const list = [
        { id: 'b', date: '2026-11-02T08:00:00.000Z' },
        { id: 'a', date: '2026-11-01T08:00:00.000Z' },
        { id: 'c', date: '2026-11-03T08:00:00.000Z' }
    ];

    it('excluye las ya sincronizadas y ordena por fecha', () => {
        const pending = pendingSessions(list, ['b']);
        assert.deepStrictEqual(pending.map(s => s.id), ['a', 'c']);
    });

    it('sin registro devuelve todas', () => {
        assert.strictEqual(pendingSessions(list, []).length, 3);
    });

    it('ignora elementos sin id', () => {
        assert.strictEqual(pendingSessions([{ date: '2026-01-01' }, ...list], []).length, 3);
    });
});

describe('chunkRows', () => {
    it('parte en bloques del tamaño pedido', () => {
        const rows = Array.from({ length: 5 }, (_, i) => [i]);
        assert.deepStrictEqual(chunkRows(rows, 2).map(c => c.length), [2, 2, 1]);
    });

    it('con lista vacía devuelve cero bloques', () => {
        assert.deepStrictEqual(chunkRows([], 10), []);
    });
});

describe('spreadsheetTitle y nombres de hoja', () => {
    it('lleva la fecha para no pisar libros antiguos', () => {
        assert.match(spreadsheetTitle(new Date('2026-11-03T10:00:00Z')), /2026-11-03$/);
    });

    it('los nombres de hoja no llevan caracteres prohibidos', () => {
        for (const name of [SHEET_TURNOS, SHEET_DETALLE]) {
            assert.ok(!/[:\\/?*[\]]/.test(name), name);
            assert.ok(name.length <= 31, name);
        }
    });
});
