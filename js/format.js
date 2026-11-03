/**
 * Formato numérico español: punto para miles, coma para decimales.
 * Intl con es-ES no agrupa los números de cuatro cifras (2.400 → "2400"),
 * así que la agrupación se fuerza aquí para que toda la app use el mismo criterio.
 */
export function formatNumber(value, minDecimals = 0, maxDecimals = minDecimals) {
    const n = Number(value);
    if (!isFinite(n)) return '0';

    const negative = n < 0;
    const fixed = Math.abs(n).toFixed(maxDecimals);
    let [integer, decimals = ''] = fixed.split('.');

    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    let out = integer;
    if (maxDecimals > 0) {
        let d = decimals.replace(/0+$/, '');
        if (d.length < minDecimals) d = d.padEnd(minDecimals, '0');
        if (d.length) out += ',' + d;
    }

    return (negative ? '-' : '') + out;
}
