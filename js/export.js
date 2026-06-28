/**
 * Módulo de exportación a Excel (.xlsx) y backup JSON usando SheetJS.
 */

export class Exporter {
    /**
     * Exporta una sesión de producción individual a un archivo .xlsx.
     * @param {Object} session La sesión a exportar.
     */
    static exportSessionToExcel(session) {
        if (typeof XLSX === 'undefined') {
            alert('Error: La librería SheetJS no está cargada. Verifica tu conexión.');
            return;
        }

        const effLabel = session.efficiencyType === 'meters_per_hour' ? 'Metros/hora' : 'Piezas/hora';
        const dateStr = new Date(session.date).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        // Cabecera general
        const wsData = [
            ['Fecha', 'Plantilla', 'Turno (h)', 'Eficiencia (%)', 'Tiempo Teórico (h)',
                'Total Piezas', 'Total Metros', 'Tipo', 'Esperado/h'
            ],
            [
                dateStr,
                session.templateName,
                session.shiftHours,
                session.efficiency + '%',
                session.theoreticalTime,
                session.totalPieces,
                session.totalMeters,
                effLabel,
                session.expectedEfficiency || '-'
            ],
            [], // Fila vacía separadora
            ['Modelo', 'Medida (mm)', 'Palets', 'Piezas', 'Metros Lineales']
        ];

        // Detalle por modelo
        (session.entries || []).forEach(e => {
            const meters = ((e.lengthMm || 0) / 1000) * (e.pieces || 0);
            wsData.push([
                e.modelName,
                e.lengthMm,
                e.pallets,
                e.pieces,
                meters.toFixed(2)
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Anchos de columna
        ws['!cols'] = [
            { wch: 14 }, { wch: 22 }, { wch: 10 }, { wch: 14 },
            { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Producción');

        const safeName = (session.templateName || 'sesion').replace(/\s+/g, '_');
        const filename = `produccion_${safeName}_${dateStr.replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(wb, filename);
    }

    /**
     * Exporta un array de datos completo como archivo JSON (backup).
     * @param {Object} data Objeto con templates y sessions.
     * @param {string} filename Nombre del archivo de backup.
     */
    static exportToJSON(data, filename = 'prodcalc_backup.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Lee y parsea un archivo JSON subido por el usuario.
     * @param {File} file Archivo JSON.
     * @returns {Promise<Object>} Datos parseados.
     */
    static importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    resolve(JSON.parse(e.target.result));
                } catch (err) {
                    reject(new Error('El archivo no contiene JSON válido.'));
                }
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo.'));
            reader.readAsText(file);
        });
    }
}
