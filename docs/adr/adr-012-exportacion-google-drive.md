# ADR-012: Guardar el historial en Google Drive

**Fecha:** 3 de noviembre de 2026
**Estado:** Aceptada (implementación completa; pendiente el Client ID para uso real)
**Decidido por:** Jorge (KAVANA)

---

## Contexto

La exportación a Excel no funcionaba: el nombre de hoja se construía como
`03/11/2026 - Perfiladora 3` y SheetJS rechaza `/` en nombres de hoja, así que
lanzaba `Sheet name cannot contain : \ / ? * [ ]` antes de escribir el archivo.
Además, descargar un `.xlsx` en el móvil resuelve poco: el operario acaba con un
archivo suelto que no se actualiza.

Jorge pide que el usuario pueda vincular su Drive desde la app y que el botón
genere una hoja de cálculo que se vaya actualizando.

## Decisión

1. **Corregir la exportación** saneando el nombre de hoja (`js/sheet-utils.js`,
   con tests) y mantenerla como opción secundaria "Descargar Excel".
2. **Google Drive desde el navegador**, sin backend ni coste:
   - Google Identity Services para obtener un token en memoria.
   - Sheets API v4 para crear el libro y añadir filas.
   - Permiso único `https://www.googleapis.com/auth/drive.file`: la app solo ve los
     archivos que crea. No es un permiso sensible, así que no exige revisión de
     Google.
3. **Un libro por usuario**: `Calculadora Kavana — AAAA-MM-DD`, con hojas
   **Turnos** (una fila por turno) y **Detalle** (una fila por modelo).
4. **Sincronización incremental**: se guarda en `localStorage` el identificador del
   libro y los IDs de las sesiones ya subidas. "Guardar en Drive" añade solo lo que
   falta, así que pulsar dos veces no duplica.
5. **El Client ID vive en `js/config.js`** y es público por diseño. Sin él, la app
   funciona igual y el botón aparece desactivado con el motivo.
6. **Sin conexión no hay Drive**: el aviso es explícito y el Excel/JSON siguen
   disponibles. La app no deja de ser offline-first.

## Alternativas evaluadas

| Alternativa | Estado | Motivo |
|-------------|--------|--------|
| Dejar solo la descarga `.xlsx` | Descartada | Archivo suelto en el móvil; no se actualiza y se pierde |
| Exportar CSV y que el usuario lo importe en Sheets | Descartada | Pasos manuales cada vez; no es "vincular el Drive" |
| Backend propio con OAuth y refresh token | Descartada | Rompe el coste cero (ADR-010) y mete un servidor donde no hace falta |
| Apps Script publicado como web app | Descartada | Ataría la app a la cuenta del autor; mal para un portafolio |
| Permiso `drive` completo | Descartada | Da acceso a todo el Drive del usuario sin necesidad |
| Guardar un refresh token en el dispositivo | Descartada | No hay backend que lo custodie; el flujo de token es el adecuado para una SPA |

## Consecuencias

**Positivas**
- El historial deja de ser un archivo huérfano: vive en una hoja que se actualiza.
- Cero coste y cero servidores; el token no sale del navegador del usuario.
- El permiso mínimo hace la app publicable sin revisión de Google.
- La exportación a Excel vuelve a funcionar y queda como respaldo offline.

**Negativas**
- Requiere crear un Client ID en Google Cloud antes de poder usarse de verdad.
- Depende de la sesión de Google del usuario: en un dispositivo nuevo hay que
  reconectar.
- Sin tests de la capa de red real (solo modelos puros y API simulada): la
  verificación completa necesita credenciales.
- El token en memoria no sobrevive a recargas: puede aparecer una ventana de
  Google si el navegador no mantiene la sesión.

## Señal de revisión

Se revisa si aparece un segundo usuario real que necesite compartir la hoja con
otra persona, si hace falta sincronizar sin conexión (habría que pasar a un
backend) o si Google cambia las condiciones del permiso `drive.file`.
