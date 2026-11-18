import { store } from './store.js';
import { STEPS, TOUR_KEY, visibleSteps } from './tour-steps.js';

/**
 * Recorrido guiado: resalta un elemento, enseña una tarjeta con su
 * explicación y cambia de pestaña cuando hace falta. Se abre solo la primera
 * vez y se repite con el botón "?". Motor propio, sin librerías.
 */

let capa = null;
let foco = null;
let tarjeta = null;
let activo = null; // { pasos, i, tabInicial, lineaPuestaPorElTour, previo }
let pendiente = null;

const reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function leerVisto() {
    try { return localStorage.getItem(TOUR_KEY) === '1'; } catch (e) { return false; }
}
function marcarVisto() {
    try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) { /* sin almacenamiento: se repetirá */ }
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function pestanaActiva() {
    const t = document.querySelector('.tab-content.active');
    return t ? t.id : 'tab-produccion';
}
function irAPestana(tab) {
    if (pestanaActiva() !== tab) window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab } }));
}

function objetivo(paso) {
    if (!paso.sel) return null;
    let el = document.querySelector(paso.sel);
    if (el && paso.closest) el = el.closest(paso.closest) || el;
    return el && el.offsetParent !== null ? el : null;
}

/** Deja la pantalla lista para el paso (pestaña y, si hace falta, una línea abierta). */
function preparar(paso) {
    if (paso.needsLine) {
        const prod = window.app && window.app.productionUI;
        if (prod && !prod.activeTemplateId) {
            const primera = store.getTemplates()[0];
            if (primera) {
                window.dispatchEvent(new CustomEvent('template-selected', { detail: { id: primera.id } }));
                activo.lineaPuestaPorElTour = true;
            }
        }
    }
    irAPestana(paso.tab);
}

function poner() {
    if (!activo || !tarjeta) return;
    const paso = activo.pasos[activo.i];
    const el = objetivo(paso);
    const vh = innerHeight, vw = innerWidth;
    const th = tarjeta.offsetHeight, tw = tarjeta.offsetWidth;

    if (!el) {
        // Paso sin elemento: tarjeta centrada y sin recuadro.
        foco.style.display = 'none';
        capa.classList.add('tour-oscura');
        tarjeta.style.top = Math.max((vh - th) / 2, 8) + 'px';
        tarjeta.style.left = Math.max((vw - tw) / 2, 8) + 'px';
        return;
    }
    foco.style.display = '';
    capa.classList.remove('tour-oscura');
    const r = el.getBoundingClientRect();
    const arriba = Math.max(r.top, 8), abajo = Math.min(r.bottom, vh - 8);
    const izq = Math.max(r.left, 8), der = Math.min(r.right, vw - 8);
    const m = 6;
    foco.style.top = (arriba - m) + 'px';
    foco.style.left = (izq - m) + 'px';
    foco.style.width = Math.max(der - izq + 2 * m, 20) + 'px';
    foco.style.height = Math.max(abajo - arriba + 2 * m, 20) + 'px';
    const centro = (arriba + abajo) / 2;
    const top = centro < vh / 2
        ? Math.min(abajo + m + 12, vh - th - 8)
        : Math.max(arriba - m - 12 - th, 8);
    const left = Math.min(Math.max((izq + der) / 2 - tw / 2, 8), vw - tw - 8);
    tarjeta.style.top = top + 'px';
    tarjeta.style.left = left + 'px';
}

function reposicionar() {
    if (pendiente) return;
    pendiente = requestAnimationFrame(() => { pendiente = null; poner(); });
}

function pintarPaso(direccion) {
    const paso = activo.pasos[activo.i];
    preparar(paso);
    // Si el elemento no está (p. ej. el historial sin turnos), se salta el paso.
    if (paso.sel && !objetivo(paso)) {
        const sig = activo.i + direccion;
        if (sig < 0 || sig >= activo.pasos.length) { cerrar(true); return; }
        activo.i = sig;
        pintarPaso(direccion);
        return;
    }
    const n = activo.pasos.length;
    const ultimo = activo.i === n - 1;
    tarjeta.innerHTML =
        '<p class="tour-cont">Paso ' + (activo.i + 1) + ' de ' + n + '</p>'
        + '<h3 id="tour-tit">' + esc(paso.title) + '</h3>'
        + '<p class="tour-txt">' + esc(paso.text) + '</p>'
        + '<div class="tour-botones">'
        + '<button type="button" class="tour-saltar">Cerrar</button>'
        + '<button type="button" class="tour-sec"' + (activo.i === 0 ? ' disabled' : '') + '>Anterior</button>'
        + '<button type="button" class="tour-sig">' + (ultimo ? 'Terminar' : 'Siguiente') + '</button>'
        + '</div>';
    tarjeta.querySelector('.tour-saltar').onclick = () => cerrar(true);
    tarjeta.querySelector('.tour-sec').onclick = anterior;
    tarjeta.querySelector('.tour-sig').onclick = siguiente;
    const el = objetivo(paso);
    if (el) {
        const alto = el.getBoundingClientRect().height > innerHeight * 0.6;
        el.scrollIntoView({ block: alto ? 'start' : 'center', behavior: reducido ? 'auto' : 'smooth' });
    }
    poner();
    setTimeout(poner, 250);
    setTimeout(poner, 600);
    tarjeta.querySelector('.tour-sig').focus({ preventScroll: true });
}

function anterior() {
    if (activo && activo.i > 0) { activo.i--; pintarPaso(-1); }
}
function siguiente() {
    if (!activo) return;
    if (activo.i < activo.pasos.length - 1) { activo.i++; pintarPaso(1); return; }
    cerrar(true);
}

function alTeclado(ev) {
    if (!activo) return;
    if (ev.key === 'Escape') { ev.preventDefault(); cerrar(true); }
    else if (ev.key === 'ArrowRight') { ev.preventDefault(); siguiente(); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); anterior(); }
}

function cerrar(marcar) {
    if (!activo) return;
    if (marcar) marcarVisto();
    const { tabInicial, lineaPuestaPorElTour, previo } = activo;
    activo = null;
    [capa, foco, tarjeta].forEach((x) => x && x.remove());
    capa = foco = tarjeta = null;
    removeEventListener('resize', reposicionar);
    removeEventListener('scroll', reposicionar, true);
    removeEventListener('keydown', alTeclado, true);
    // Si el recorrido abrió una línea por su cuenta, se deja como estaba.
    if (lineaPuestaPorElTour) {
        const cambiar = document.getElementById('btn-change-tpl');
        if (cambiar) cambiar.click();
    }
    irAPestana(tabInicial);
    if (previo && previo.focus) previo.focus({ preventScroll: true });
}

function modalAbierto() {
    const m = document.getElementById('modal-plantilla');
    return !!m && m.style.display !== 'none';
}

export function empezarTour() {
    cerrar(false);
    const pasos = visibleSteps(STEPS, { hasTemplates: store.getTemplates().length > 0 });
    if (!pasos.length) return;
    capa = document.createElement('div');
    capa.className = 'tour-capa';
    foco = document.createElement('div');
    foco.className = 'tour-foco';
    tarjeta = document.createElement('div');
    tarjeta.className = 'tour-tarjeta';
    tarjeta.setAttribute('role', 'dialog');
    tarjeta.setAttribute('aria-modal', 'true');
    tarjeta.setAttribute('aria-labelledby', 'tour-tit');
    document.body.append(capa, foco, tarjeta);
    activo = { pasos, i: 0, tabInicial: pestanaActiva(), lineaPuestaPorElTour: false, previo: document.activeElement };
    addEventListener('resize', reposicionar);
    addEventListener('scroll', reposicionar, true);
    addEventListener('keydown', alTeclado, true);
    pintarPaso(1);
}

/** Engancha el botón «Guía» de la barra y abre el recorrido solo la primera vez. */
export function initTour() {
    const b = document.getElementById('btn-tour');
    if (b) b.addEventListener('click', empezarTour);

    if (!leerVisto()) {
        setTimeout(() => { if (!activo && !modalAbierto()) empezarTour(); }, 1200);
    }
}
