// Nombres de hoja válidos: Excel y Google Sheets rechazan : \ / ? * [ ]
// El fallo real: la exportación usaba "03/11/2026 - Perfiladora 3" y SheetJS
// lanzaba "Sheet name cannot contain : \ / ? * [ ]" antes de escribir el archivo.

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeSheetName, uniqueSheetName } from '../js/sheet-utils.js';

describe('sanitizeSheetName', () => {
    it('quita la barra de la fecha, que era el fallo de la exportación', () => {
        assert.strictEqual(sanitizeSheetName('03/11/2026 - Perfiladora 3'), '03-11-2026 - Perfiladora 3');
    });

    it('quita el resto de caracteres prohibidos', () => {
        assert.strictEqual(sanitizeSheetName('a:b\\c/d?e*f[g]h'), 'a-b-c-d-e-f-g-h');
    });

    it('recorta a 31 caracteres', () => {
        const name = sanitizeSheetName('x'.repeat(50));
        assert.strictEqual(name.length, 31);
    });

    it('usa el nombre por defecto si queda vacío', () => {
        assert.strictEqual(sanitizeSheetName('   '), 'Hoja');
        assert.strictEqual(sanitizeSheetName('///', 'Turno'), 'Turno');
    });
});

describe('uniqueSheetName', () => {
    it('devuelve el nombre tal cual si está libre', () => {
        assert.strictEqual(uniqueSheetName('Turnos', ['Detalle']), 'Turnos');
    });

    it('añade sufijo cuando ya existe', () => {
        assert.strictEqual(uniqueSheetName('Turnos', ['Turnos']), 'Turnos (2)');
        assert.strictEqual(uniqueSheetName('Turnos', ['Turnos', 'Turnos (2)']), 'Turnos (3)');
    });

    it('respeta el límite de 31 caracteres al añadir sufijo', () => {
        const long = 'x'.repeat(31);
        const result = uniqueSheetName(long, [long]);
        assert.ok(result.length <= 31, result);
        assert.ok(result.endsWith('(2)'), result);
    });
});
