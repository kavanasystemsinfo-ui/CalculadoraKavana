# Seguridad — CALCULADORA KAVANA

## Gestión de Secretos

No hay contraseñas, tokens ni claves en el repositorio. La aplicación es
client-side pura (sin backend): no existen `DATABASE_URL`, `JWT_SECRET` ni
variables de entorno de servidor.

## Datos del Usuario

- **Almacenamiento local**: los datos (plantillas, sesiones de producción e
  histórico) viven en `localStorage` del propio dispositivo. No se envían a
  ningún servidor.
- **Export/Import**: el backup JSON se genera y restaura localmente. El usuario
  es responsable de guardar el archivo exportado en un lugar seguro.
- **Exportación Excel**: los datos se procesan en el navegador con SheetJS
  (CDN). No se sube ningún dato a terceros.

## Prácticas de Código

- **Sanitización de entrada**: los valores numéricos de producción se validan
  antes de entrar en el motor de cálculo (ver tests en `tests/engine.test.js`).
- **Sin dependencias de runtime**: vanilla JavaScript con ES Modules nativos.
  La única dependencia externa es SheetJS (CDN) para la exportación Excel.
- **Service Worker**: la caché (`prod-calc-v17`) solo contiene assets estáticos
  del propio proyecto. No cachea respuestas de terceros.

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad, abre un issue en el repositorio o contacta
con el mantenedor. No publiques detalles de seguridad en público sin avisar.
