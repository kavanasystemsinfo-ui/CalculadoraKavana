/**
 * Utilidades de hojas de cálculo compartidas por la exportación a Excel y la
 * sincronización con Google Sheets.
 */

/**
 * Excel y Google Sheets rechazan estos caracteres en el nombre de una hoja:
 * : \ / ? * [ ]
 * Además el nombre no puede pasar de 31 caracteres ni quedar vacío.
 * @param {string} name Nombre propuesto.
 * @param {string} fallback Nombre a usar si queda vacío.
 * @returns {string} Nombre válido para una hoja.
 */
export function sanitizeSheetName(name, fallback = 'Hoja') {
    const clean = String(name ?? '')
        .replace(/[:\\/?*[\]]/g, '-')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 31);

    // "///" se convierte en "---": válido pero inútil, mejor el nombre por defecto.
    if (!/[A-Za-z0-9]/.test(clean)) return fallback;

    return clean;
}

/**
 * Devuelve un nombre único dentro del libro: si ya existe, añade " (2)", " (3)"...
 * @param {string} base Nombre deseado (ya saneado o no).
 * @param {Set<string>|Array<string>} used Nombres ya usados.
 * @returns {string} Nombre libre.
 */
export function uniqueSheetName(base, used) {
    const taken = used instanceof Set ? used : new Set(used || []);
    let candidate = sanitizeSheetName(base);
    let n = 2;

    while (taken.has(candidate)) {
        const suffix = ` (${n++})`;
        candidate = sanitizeSheetName(base).slice(0, 31 - suffix.length) + suffix;
    }

    return candidate;
}
