/**
 * Datos de ejemplo realistas para la Calculadora Kavana.
 * Basados en la experiencia real de Jorge en fábricas metálicas (perfiladoras, inyección, corte).
 * Se usan para sembrar la app y que el reclutador vea una app "viva" al entrar.
 */

export const SEED_TEMPLATES = [
    {
        id: 'tpl-perfiladora-3',
        name: 'Perfiladora 3 · Perfil C',
        enableEfficiency: true,
        efficiencyType: 'meters_per_hour',
        expectedEfficiency: 2400,
        theme: 'blue',
        models: [
            {
                id: 'm-c200',
                name: 'Perfil C 200',
                piecesPerPallet: 60,
                piecesPerPackage: 12,
                piecesPerRow: 60,  // 5 paquetes/fila * 12 pz/paq
                measures: [
                    { id: 'ms-c200-6000', lengthMm: 6000 }
                ]
            },
            {
                id: 'm-c150',
                name: 'Perfil C 150',
                piecesPerPallet: 80,
                piecesPerPackage: 16,
                piecesPerRow: 80,  // 5 paquetes/fila * 16 pz/paq
                measures: [
                    { id: 'ms-c150-4500', lengthMm: 4500 }
                ]
            }
        ]
    },
    {
        id: 'tpl-perfiladora-1',
        name: 'Perfiladora 1 · Perfil U',
        enableEfficiency: true,
        efficiencyType: 'meters_per_hour',
        expectedEfficiency: 1800,
        theme: 'teal',
        models: [
            {
                id: 'm-u200',
                name: 'Perfil U 200',
                piecesPerPallet: 48,
                piecesPerPackage: 8,
                piecesPerRow: 48,  // 6 paquetes/fila * 8 pz/paq
                measures: [
                    { id: 'ms-u200-6000', lengthMm: 6000 }
                ]
            },
            {
                id: 'm-u150',
                name: 'Perfil U 150',
                piecesPerPallet: 64,
                piecesPerPackage: 12,
                piecesPerRow: 48,  // 4 paquetes/fila * 12 pz/paq
                measures: [
                    { id: 'ms-u150-5000', lengthMm: 5000 }
                ]
            },
            {
                id: 'm-u100',
                name: 'Perfil U 100',
                piecesPerPallet: 96,
                piecesPerPackage: 16,
                piecesPerRow: 64,  // 4 paquetes/fila * 16 pz/paq
                measures: [
                    { id: 'ms-u100-4000', lengthMm: 4000 }
                ]
            }
        ]
    },
    {
        id: 'tpl-inyeccion-2',
        name: 'Inyección 2 · Piezas plásticas',
        enableEfficiency: true,
        efficiencyType: 'pieces_per_hour',
        expectedEfficiency: 2500,
        theme: 'orange',
        models: [
            {
                id: 'm-tapa',
                name: 'Tapa contenedor',
                piecesPerPallet: 480,
                piecesPerPackage: 48,
                piecesPerRow: 96,  // 2 paquetes/fila * 48 pz/paq
                measures: [
                    { id: 'ms-tapa-unica', lengthMm: 0 }
                ]
            },
            {
                id: 'm-cuerpo',
                name: 'Cuerpo contenedor',
                piecesPerPallet: 320,
                piecesPerPackage: 32,
                piecesPerRow: 64,  // 2 paquetes/fila * 32 pz/paq
                measures: [
                    { id: 'ms-cuerpo-unica', lengthMm: 0 }
                ]
            }
        ]
    },
    {
        id: 'tpl-corte-laser',
        name: 'Corte Láser · Chapas',
        enableEfficiency: true,
        efficiencyType: 'pieces_per_hour',
        expectedEfficiency: 800,
        theme: 'purple',
        models: [
            {
                id: 'm-chapa-3mm',
                name: 'Chapa 3mm · Soporte',
                piecesPerPallet: 200,
                piecesPerPackage: 20,
                piecesPerRow: 40,  // 2 paquetes/fila * 20 pz/paq
                measures: [
                    { id: 'ms-soporte-500', lengthMm: 500 }
                ]
            },
            {
                id: 'm-chapa-5mm',
                name: 'Chapa 5mm · Base',
                piecesPerPallet: 120,
                piecesPerPackage: 12,
                piecesPerRow: 24,  // 2 paquetes/fila * 12 pz/paq
                measures: [
                    { id: 'ms-base-800', lengthMm: 800 }
                ]
            }
        ]
    }
];

/**
 * Sesiones de ejemplo para que el historial no esté vacío.
 * Fechas recientes, eficiencias realistas.
 */
export const SEED_SESSIONS = [
    {
        id: 's-seed-1',
        templateId: 'tpl-perfiladora-3',
        templateName: 'Perfiladora 3 · Perfil C',
        efficiencyType: 'meters_per_hour',
        expectedEfficiency: 2400,
        date: '2026-11-01T07:30:00.000Z',
        shiftHours: 7.5,
        entries: [
            { modelId: 'm-c200', modelName: 'Perfil C 200', lengthMm: 6000, pallets: 14, pieces: 860 },
            { modelId: 'm-c150', modelName: 'Perfil C 150', lengthMm: 4500, pallets: 8, pieces: 431 }
        ],
        efficiency: 88.3,
        totalPieces: 1291,
        totalMeters: 7099.5,
        theoreticalTime: 2.96,
        savedAt: '2026-11-01T15:05:00.000Z'
    },
    {
        id: 's-seed-2',
        templateId: 'tpl-perfiladora-3',
        templateName: 'Perfiladora 3 · Perfil C',
        efficiencyType: 'meters_per_hour',
        expectedEfficiency: 2400,
        date: '2026-10-31T15:00:00.000Z',
        shiftHours: 7.5,
        entries: [
            { modelId: 'm-c200', modelName: 'Perfil C 200', lengthMm: 6000, pallets: 12, pieces: 738 },
            { modelId: 'm-c150', modelName: 'Perfil C 150', lengthMm: 4500, pallets: 6, pieces: 324 }
        ],
        efficiency: 82.9,
        totalPieces: 1062,
        totalMeters: 5859,
        theoreticalTime: 2.44,
        savedAt: '2026-10-31T22:35:00.000Z'
    },
    {
        id: 's-seed-3',
        templateId: 'tpl-perfiladora-1',
        templateName: 'Perfiladora 1 · Perfil U',
        efficiencyType: 'meters_per_hour',
        expectedEfficiency: 1800,
        date: '2026-10-30T07:30:00.000Z',
        shiftHours: 8,
        entries: [
            { modelId: 'm-u200', modelName: 'Perfil U 200', lengthMm: 6000, pallets: 8, pieces: 384 },
            { modelId: 'm-u150', modelName: 'Perfil U 150', lengthMm: 5000, pallets: 10, pieces: 480 }
        ],
        efficiency: 91.2,
        totalPieces: 864,
        totalMeters: 5184,
        theoreticalTime: 2.88,
        savedAt: '2026-10-30T15:32:00.000Z'
    },
    {
        id: 's-seed-4',
        templateId: 'tpl-inyeccion-2',
        templateName: 'Inyección 2 · Piezas plásticas',
        efficiencyType: 'pieces_per_hour',
        expectedEfficiency: 2500,
        date: '2026-10-29T07:30:00.000Z',
        shiftHours: 8,
        entries: [
            { modelId: 'm-tapa', modelName: 'Tapa contenedor', lengthMm: 0, pallets: 5, pieces: 2400 },
            { modelId: 'm-cuerpo', modelName: 'Cuerpo contenedor', lengthMm: 0, pallets: 4, pieces: 1280 }
        ],
        efficiency: 96.4,
        totalPieces: 3680,
        totalMeters: 0,
        theoreticalTime: 1.47,
        savedAt: '2026-10-29T15:30:00.000Z'
    }
];