/**
 * Lógica pura de la sincronización con Google Drive.
 * Sin red y sin DOM: se puede probar con node --test.
 */

/** Hojas que crea la app en el libro de Drive. */
export const SHEET_TURNOS = 'Turnos';
export const SHEET_DETALLE = 'Detalle';

/**
 * Versión del formato de la hoja. Si cambia, la app crea un libro nuevo y
 * vuelve a subir el historial (el libro antiguo se queda en el Drive).
 */
export const LAYOUT_VERSION = 2;

export const HEADERS_TURNOS = [
    'Fecha', 'Hora', 'Puesto', 'Turno (h)', 'Producción', 'Unidad',
    'Objetivo/h', 'Eficiencia (%)', 'Tiempo teórico (h)', 'Modelos', 'Guardado'
];

export const HEADERS_DETALLE = [
    'Fecha', 'Puesto', 'Modelo', 'Largo (mm)', 'Palets', 'Producción', 'Unidad'
];

function parseDate(value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

/** Fecha ISO corta (YYYY-MM-DD). Solo para nombres internos y pruebas. */
export function isoDate(value) {
    const d = parseDate(value);
    if (!d) return '';
    return d.toISOString().slice(0, 10);
}

/**
 * Fecha como número de serie de Hoja de cálculo (días desde 1899-12-30, en
 * hora local). Así la hoja la ordena bien y la muestra como DD/MM/AA con el
 * formato de la columna, sin depender de la configuración regional.
 */
export function sheetDate(value) {
    const d = parseDate(value);
    if (!d) return '';
    return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000);
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

/** ¿El puesto de esta sesión mide en metros? Solo si tiene objetivo y es de metros/hora. */
function usesMeters(source) {
    return Boolean(source) && source.enableEfficiency !== false && source.efficiencyType === 'meters_per_hour';
}

/** ¿El puesto tiene objetivo por hora? (si no, es solo recuento de piezas) */
function hasTarget(source) {
    return Boolean(source) && source.enableEfficiency !== false && Number(source.expectedEfficiency) > 0;
}

/**
 * Completa una sesión con los datos de su puesto cuando no los trae
 * (los turnos guardados antes de esta versión no guardaban tipo ni objetivo).
 */
export function resolveSession(session, templates = []) {
    if (session && session.efficiencyType && Number(session.expectedEfficiency) > 0) return session;
    const tpl = (templates || []).find(t => t && t.id === session?.templateId);
    if (!tpl) return session;
    return {
        ...session,
        enableEfficiency: tpl.enableEfficiency,
        efficiencyType: tpl.efficiencyType,
        expectedEfficiency: tpl.expectedEfficiency
    };
}

/**
 * Fila de la hoja "Turnos" para una sesión guardada.
 * La producción va en la unidad del puesto: piezas o metros, nunca las dos.
 * @param {Object} session Sesión de producción (ya completada con resolveSession).
 * @returns {Array} Fila lista para la API de Sheets.
 */
export function sessionRow(session) {
    const entries = session.entries || [];
    const meters = usesMeters(session);
    const target = hasTarget(session);
    return [
        sheetDate(session.date),
        isoTime(session.date),
        session.templateName || 'Sin nombre',
        round(session.shiftHours, 2),
        meters ? round(session.totalMeters, 2) : round(session.totalPieces, 0),
        meters ? 'm' : 'pz',
        target ? round(session.expectedEfficiency, 2) : '',
        target ? round(session.efficiency, 2) : '',
        target ? round(session.theoreticalTime, 2) : '',
        entries.length,
        isoTime(session.savedAt || session.date)
    ];
}

/**
 * Filas de la hoja "Detalle": una por modelo del turno.
 * Si una sesión no tiene modelos, devuelve una fila resumen.
 */
export function entryRows(session) {
    const entries = session.entries || [];
    const meters = usesMeters(session);
    const unit = meters ? 'm' : 'pz';
    const name = session.templateName || 'Sin nombre';

    if (entries.length === 0) {
        const total = meters ? round(session.totalMeters, 2) : round(session.totalPieces, 0);
        return [[sheetDate(session.date), name, 'Sin modelos', '', '', total, unit]];
    }

    return entries.map(e => [
        sheetDate(session.date),
        name,
        e.modelName || 'Modelo',
        round(e.lengthMm, 0),
        round(e.pallets, 0),
        meters ? round(((e.lengthMm || 0) / 1000) * (e.pieces || 0), 2) : round(e.pieces, 0),
        unit
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
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `Calculadora Kavana — ${dd}-${mm}-${date.getFullYear()}`;
}
