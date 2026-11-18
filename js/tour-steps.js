/**
 * Pasos del recorrido guiado de la Calculadora. Es solo datos y lógica pura
 * (sin DOM) para poder probarla con node --test; el motor que lo pinta está
 * en tour.js.
 *
 * Cada paso:
 *  - tab: pestaña en la que vive el elemento.
 *  - sel: selector CSS del elemento a resaltar (null = tarjeta centrada).
 *  - closest: si se indica, se resalta el ancestro que cumpla ese selector.
 *  - needsLine: el paso necesita una línea abierta en la pestaña Turno.
 */
export const TOUR_KEY = 'prodcalc_tour_visto';

export const STEPS = [
    {
        id: 'intro', tab: 'tab-plantillas', sel: null,
        title: 'Así se cuenta un turno',
        text: 'En un minuto ves cómo funciona. Todo va sin conexión y tus datos no salen de este dispositivo.'
    },
    {
        id: 'pestanas', tab: 'tab-plantillas', sel: '.tab-nav',
        title: 'Cuatro pestañas',
        text: 'Turno es donde cuentas, Mis líneas guarda tus perfiladoras, Mi historial los turnos ya guardados y Ajustes el aspecto.'
    },
    {
        id: 'lineas', tab: 'tab-plantillas', sel: '#lista-plantillas',
        title: 'Tus líneas',
        text: 'Cada línea guarda su objetivo de eficiencia y sus modelos con sus medidas. Toca el nombre de una para abrir su turno.'
    },
    {
        id: 'nueva', tab: 'tab-plantillas', sel: '#btn-nueva-plantilla',
        title: 'Crear tu línea',
        text: 'Pon el nombre, cuánto hace a pleno rendimiento y los modelos con sus largos. Se configura una sola vez y luego solo cuentas.'
    },
    {
        id: 'eficiencia', tab: 'tab-produccion', sel: '#hero', needsLine: true,
        title: 'Tu eficiencia al momento',
        text: 'Con lo que cuentas se calcula la eficiencia del turno y las piezas hechas. Se recalcula sola, sin botones.'
    },
    {
        id: 'buscar', tab: 'tab-produccion', sel: '#picklist-container', needsLine: true,
        title: 'Busca el modelo',
        text: 'Escribe el modelo o la medida que estás pasando y añádelo. Puedes llevar varios a la vez.'
    },
    {
        id: 'contar', tab: 'tab-produccion', sel: '#prod-entries-list', needsLine: true,
        title: 'Cuenta con − y +',
        text: 'Cada modelo que añades sale aquí con sus contadores de palets, filas y paquetes. Toca + al terminar cada palet.'
    },
    {
        id: 'falta', tab: 'tab-produccion', sel: '.rail .card', needsLine: true,
        title: 'Te falta para el 100 %',
        text: 'Lo que te queda por contar para cerrar el turno al 100 % de eficiencia. El desglose lo tienes en palets, filas y paquetes.'
    },
    {
        id: 'duracion', tab: 'tab-produccion', sel: '#shift-time-section', needsLine: true,
        title: 'Duración del turno',
        text: 'Ajusta las horas y los minutos del turno: el objetivo y lo que te falta se calculan con ese tiempo.'
    },
    {
        id: 'guardar', tab: 'tab-produccion', sel: '#btn-save-prod', needsLine: true,
        title: 'Guardar el turno',
        text: 'Se activa en cuanto has contado algo. El turno se queda en el historial de este dispositivo.'
    },
    {
        id: 'historial', tab: 'tab-historial', sel: '#lista-historial',
        title: 'Tu historial',
        text: 'Cada turno guardado, con su fecha, horas, modelos y eficiencia. Sirve para responder si te preguntan por un turno.'
    },
    {
        id: 'exportar', tab: 'tab-historial', sel: '.hist-foot',
        title: 'Llévatelo contigo',
        text: 'Descarga el Excel, haz una copia de seguridad o guárdalo en una hoja de tu Google Drive.'
    },
    {
        id: 'formato', tab: 'tab-config', sel: '#theme-layout-select', closest: '.card',
        title: 'Compacto o expandido',
        text: 'El formato compacto es para el móvil. El expandido reparte la pantalla en dos columnas y agranda los botones para usar con guantes.'
    },
    {
        id: 'drive', tab: 'tab-config', sel: '#card-drive',
        title: 'Google Drive, si quieres',
        text: 'Puedes guardar el historial en una hoja de tu Drive. La hoja es tuya y solo esta app la ve. Sin conectar, todo sigue funcionando igual.'
    }
];

/**
 * Pasos que se pueden enseñar ahora.
 * @param {Array} steps  lista de pasos
 * @param {{hasTemplates: boolean, exists?: (step: object) => boolean}} ctx
 *   exists: dice si el elemento del paso está en pantalla (solo para pasos
 *   de pestañas que ya están pintadas; los demás se comprueban al llegar).
 */
export function visibleSteps(steps, ctx) {
    return steps.filter((s) => {
        if (s.needsLine && !ctx.hasTemplates) return false;
        if (ctx.exists && !ctx.exists(s)) return false;
        return true;
    });
}
