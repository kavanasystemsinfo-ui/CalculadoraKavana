/**
 * Lógica pura de la sincronización con Google Drive.
 * Sin red y sin DOM: se puede probar con node --test.
 */

/** Hojas que crea la app en el libro de Drive. */
export const SHEET_TURNOS = 'Turnos';
export const SHEET_DETALLE = 'Detalle';

export const HEADERS_TURNOS = [
    'Fecha', 'Hora', 'Línea', 'Turno (h)', 'Eficiencia (%)',
    'Piezas', 'Metros', 'Tiempo teórico (h)', 'Modelos', 'Tipo', 'Objetivo/h', 'Guardado'
];

export const HEADERS_DETALLE = [
    'Fecha', 'Línea', 'Modelo', 'Largo (mm)', 'Palets', 'Piezas', 'Metros'
];

function parseDate(value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

/** Fecha ISO corta (YYYY-MM-DD) para que la hoja se pueda ordenar. */
export function isoDate(value) {
    const d = parseDate(value);
    if (!d) return '';
    return d.toISOString().slice(0, 10);
}

/** Hora local HH:MM. */
export function isoTime(value) {
    const d = parseDate(value);
    if (!d) return '';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

/** Número redondeado a los decimales pedidos, como número (no como texto). */
function round(value, decimals = 2) {
    const n = Number(value);
    if (!isFinite(n)) return 0;
    const f = Math.pow(10, decimals);
    return Math.round(n * f) / f;
}

/**
 * Fila de la hoja "Turnos" para una sesión guardada.
 * @param {Object} session Sesión de producción.
 * @returns {Array} Fila lista para la API de Sheets.
 */
export function sessionRow(session) {
    const entries = session.entries || [];
    return [
        isoDate(session.date),
        isoTime(session.date),
        session.templateName || 'Línea',
        round(session.shiftHours, 2),
        round(session.efficiency, 2),
        round(session.totalPieces, 0),
        round(session.totalMeters, 2),
        round(session.theoreticalTime, 2),
        entries.length,
        session.efficiencyType === 'meters_per_hour' ? 'Metros/hora'
            : session.efficiencyType === 'pieces_per_hour' ? 'Piezas/hora'
            : 'Solo recuento',
        round(session.expectedEfficiency, 2),
        isoTime(session.savedAt || session.date)
    ];
}

/**
 * Filas de la hoja "Detalle": una por modelo del turno.
 * Si una sesión no tiene modelos, devuelve una fila resumen.
 */
export function entryRows(session) {
    const entries = session.entries || [];
    if (entries.length === 0) {
        return [[isoDate(session.date), session.templateName || 'Línea', 'Sin modelos', '', '', round(session.totalPieces, 0), round(session.totalMeters, 2)]];
    }

    return entries.map(e => [
        isoDate(session.date),
        session.templateName || 'Línea',
        e.modelName || 'Modelo',
        round(e.lengthMm, 0),
        round(e.pallets, 0),
        round(e.pieces, 0),
        round(((e.lengthMm || 0) / 1000) * (e.pieces || 0), 2)
    ]);
}

/**
 * Sesiones pendientes de subir: las que no están en el registro de sincronizadas.
 * Se ordenan por fecha ascendente para que la hoja se lea cronológicamente.
 */
export function pendingSessions(sessions, syncedIds = []) {
    const synced = new Set(syncedIds);
    return (sessions || [])
        .filter(s => s && s.id && !synced.has(s.id))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Agrupa filas en bloques para no enviar un payload enorme de una vez.
 */
export function chunkRows(rows, size = 500) {
    const out = [];
    for (let i = 0; i < rows.length; i += size) {
        out.push(rows.slice(i, i + size));
    }
    return out;
}

/**
 * Título del libro. Lleva la fecha de creación para poder tener varios sin
 * pisarse si el usuario borra el archivo en Drive.
 */
export function spreadsheetTitle(date = new Date()) {
    return `Calculadora Kavana — ${isoDate(date)}`;
}
