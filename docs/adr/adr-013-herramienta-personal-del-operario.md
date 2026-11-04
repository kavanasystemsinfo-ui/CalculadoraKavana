# ADR-013: Alcance — herramienta personal del operario

**Fecha:** 4 de noviembre de 2026
**Estado:** Aceptada
**Decidido por:** Jorge (KAVANA) — criterio de producto

---

## Contexto

Al rediseñar la interfaz (ADR-011) salió una maqueta orientada a que los datos
viajaran a la oficina: paneles, KPIs, informes. Además, el roadmap y varios
documentos hablaban de un dashboard de supervisores, sincronización en la nube y
roles. Nada de eso corresponde al uso real de la Calculadora.

El uso real: **el operario apunta en el parte de papel lo que produce** (es el
método de registro de muchas empresas) y la Calculadora le ahorra las cuentas
de cabeza o con la calculadora de bolsillo mientras lo rellena. Es una ayuda
pensada para facilitar su trabajo, no un sistema de reporting.

## Decisión

1. **La Calculadora es una herramienta de uso personal del operario.** No
   sustituye al parte en papel y no envía datos a la empresa.
2. **El guardado en Excel y en Drive (ADR-012) es para su control propio:** que el
   operario pueda llevar un registro de su producción y tenerlo a mano si la
   empresa le pregunta por un turno concreto. La hoja de Drive es suya.
3. **Queda descartado** lo que contradice ese uso: dashboard de supervisores,
   sincronización multiusuario, cuentas y roles, y cualquier envío de datos a la
   oficina.
4. Este alcance se refleja en el README, la documentación y la landing.

## Consecuencias

- **Positivas:** el producto es honesto y se explica en una frase; no hay
  autenticación ni datos de terceros que proteger; la arquitectura sin servidor
  sigue siendo suficiente.
- **Negativas:** no sirve a quien necesite ver la producción de varias personas.
  Ese caso lo cubre otro proyecto del portfolio (Kavana Manufacturing), no esta
  herramienta.

## Señal de revisión

Una petición de que los datos lleguen a otra persona (oficina o supervisor)
indicaría un producto distinto y no una evolución de este. Se documentaría como
proyecto nuevo, no como cambio de esta calculadora.
