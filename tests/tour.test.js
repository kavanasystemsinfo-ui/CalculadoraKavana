// Tests del recorrido guiado: datos de los pasos y que sus selectores existan de verdad.
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { STEPS, TOUR_KEY, visibleSteps } from '../js/tour-steps.js';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const fuentes = ['../index.html', '../js/ui-production.js', '../js/ui-templates.js', '../js/ui-history.js']
    .map(read).join('\n');
const TABS = ['tab-plantillas', 'tab-produccion', 'tab-historial', 'tab-config'];

describe('Recorrido guiado', () => {
    it('cada paso tiene id único, título, texto y una pestaña válida', () => {
        const ids = new Set();
        for (const s of STEPS) {
            assert.ok(s.id && !ids.has(s.id), `id repetido o vacío: ${s.id}`);
            ids.add(s.id);
            assert.ok(s.title.trim().length > 0, `sin título: ${s.id}`);
            assert.ok(s.text.trim().length > 0, `sin texto: ${s.id}`);
            assert.ok(TABS.includes(s.tab), `pestaña desconocida en ${s.id}: ${s.tab}`);
        }
    });

    it('los selectores apuntan a ids y clases que existen en la app', () => {
        for (const s of STEPS) {
            if (!s.sel) continue;
            const partes = s.sel.match(/[#.][A-Za-z][\w-]*/g) || [];
            assert.ok(partes.length > 0, `selector sin id ni clase: ${s.id}`);
            for (const p of partes) {
                const nombre = p.slice(1);
                assert.ok(fuentes.includes(nombre), `${s.id}: "${p}" no aparece en el código de la app`);
            }
        }
    });

    it('los pasos de la pantalla de turno piden una línea abierta', () => {
        for (const s of STEPS.filter((x) => x.tab === 'tab-produccion')) {
            assert.strictEqual(s.needsLine, true, `falta needsLine en ${s.id}`);
        }
    });

    it('sin líneas se quitan los pasos del turno y el resto se mantiene', () => {
        const sin = visibleSteps(STEPS, { hasTemplates: false });
        assert.ok(sin.every((s) => !s.needsLine));
        assert.strictEqual(sin.length, STEPS.filter((s) => !s.needsLine).length);
        const con = visibleSteps(STEPS, { hasTemplates: true });
        assert.strictEqual(con.length, STEPS.length);
    });

    it('exists puede descartar pasos cuyo elemento no está', () => {
        const r = visibleSteps(STEPS, { hasTemplates: true, exists: (s) => s.id !== 'exportar' });
        assert.ok(!r.some((s) => s.id === 'exportar'));
    });

    it('usa una clave de almacenamiento propia', () => {
        assert.strictEqual(TOUR_KEY, 'prodcalc_tour_visto');
    });
});
