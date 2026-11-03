# ADR-011: Rediseño de la interfaz como herramienta de operario

**Fecha:** 3 de noviembre de 2026
**Estado:** Aceptada
**Decidido por:** Jorge (KAVANA) — criterio de producto y diseño

---

## Contexto

La interfaz venía del primer prototipo: una tarjeta estrecha con cuatro pestañas,
títulos en mayúsculas y una sucesión de botones ("🎯 Meta 100%", "📐 Calcular
Eficiencia", "💾 Guardar Sesión") que obligaban a calcular en tres pasos distintos
y repintaban la pantalla con estilos en línea.

Ese diseño valía para uso personal, pero se había convertido en la pieza más
visible del portafolio y no estaba a la altura del resto de proyectos. Además, la
lectura del producto se había desviado: la pantalla parecía un cuadro de mando
para la oficina (KPIs, tablas, exportaciones) cuando el uso real es otro.

El uso real, confirmado con Jorge: **el operario apunta lo que lleva hecho para no
hacer cuentas y para rellenar antes el parte de papel**. El histórico y la
exportación a Excel existen por si él necesita responder una pregunta puntual,
no para alimentar un sistema de reporting.

## Decisión

Sustituir el sistema visual completo por uno pensado para ese uso:

1. **Navegación lateral** (tablet) que pasa a barra inferior en móvil, con cuatro
   accesos: Turno, Mis líneas, Mi historial, Ajustes. Se mantiene el contrato de
   `data-target` / `.tab-btn` / `.tab-content`, así que `app.js` no cambia.
2. **Pantalla del turno en dos columnas**: eficiencia en grande, recuento con
   botones − / + por modelo, y una tarjeta **"Te falta para el 100 %"** que
   traduce el objetivo a palets, filas y paquetes restantes.
3. **Cálculo en vivo**: desaparecen los botones *Meta 100%* y *Calcular
   eficiencia*. Cada cambio en el recuento o en la duración del turno recalcula
   eficiencia, metros, piezas, tiempo teórico y lo que falta. *Guardar turno* se
   desactiva mientras no haya nada contado.
4. **Tema y formato existentes se conservan**: seis paletas y los formatos
   compacto/expandido (ADR-003) siguen funcionando; el expandido es el que abre
   la disposición en dos columnas.
5. **Formato numérico español en toda la UI** mediante `js/format.js`
   (12.415 y 43,5), incluidos los importes de cuatro cifras que `Intl` con
   `es-ES` deja sin separador.
6. **Lógica pura nueva, con tests**: `Calculator.targetForShift()` y
   `Calculator.remainingForTarget()` calculan objetivo del turno y desglose de lo
   que falta. Se prueban contra el módulo real (`tests/remaining.test.js`), no
   contra una réplica.

## Alternativas evaluadas

| Alternativa | Estado | Motivo |
|-------------|--------|--------|
| Mantener la interfaz y solo retocar colores | Descartada | El problema era la jerarquía y el flujo en tres pasos, no la paleta |
| Panel tipo SaaS con KPIs, tabla editable y sparkline | Descartada | Se probó en maqueta: parece un sistema de oficina y añade datos que el operario nunca mira |
| Estilo editorial claro (papel, tipografía grande) | Descartada para la app | Bonita en portafolio, pero deslumbra en planta y pierde densidad de recuento |
| Rediseño con framework (React/Vue) | Descartada | Contradice ADR-002 y ADR-004; no aporta nada a este tamaño |
| Añadir campo de "horas transcurridas" para calcular en vivo contra el reloj | No implementada | El turno se declara por su duración; añadir el reloj introduce estado que hoy no hace falta (YAGNI) |

## Consecuencias

**Positivas**
- El flujo pasa de tres acciones (añadir → meta → calcular) a una: contar.
- La pantalla responde a la pregunta que se hace el operario ("¿cuánto me falta?"),
  no a la que se hace la oficina.
- Un solo `styles.css` sin estilos en línea en los renderizadores: el rediseño
  futuro se hace en un archivo.
- Corrige un defecto arrastrado de ADR-009: la cifra grande convertía metros a
  piezas con el largo del **primer** modelo. Ahora cada fila usa su propio largo.
- Contraste verificado en las seis paletas (texto secundario ≥ 3,4:1, acento ≥ 9:1).

**Negativas**
- El rediseño toca los tres renderizadores y la hoja de estilos: cualquier
  personalización local de Jorge sobre el CSS anterior se pierde.
- Los `?v=` de CSS/JS y la caché del service worker hay que subirlos en cada
  cambio de assets o los usuarios con la PWA instalada ven la versión antigua.
- Sigue sin haber tests automatizados de UI (TD-004): la verificación de estas
  pantallas es manual, con navegador real y capturas.

## Señal de revisión

Se revisa si aparece un segundo usuario real con necesidades distintas (por
ejemplo, un supervisor que quiera ver varias líneas a la vez) o si el operario
pide datos que la pantalla del turno no muestra hoy.
