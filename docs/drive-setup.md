# Conectar Google Drive — puesta en marcha

La app guarda el historial en una hoja de cálculo **del Drive del propio usuario**.
No hay servidor de por medio: el navegador pide permiso a Google y escribe
directamente en la API de Sheets con el token del usuario.

Para que funcione hace falta un **ID de cliente OAuth** (público). Se crea una vez,
es gratis y no requiere tarjeta.

---

## 1. Crear el proyecto y el cliente OAuth

1. Entra en <https://console.cloud.google.com/> con la cuenta de Google que
   gestiona el dominio (no tiene que ser la del operario).
2. **Crear proyecto** → nombre: `Calculadora Kavana`.
3. **APIs y servicios → Biblioteca** → busca **Google Sheets API** → *Habilitar*.
   (Opcional: **Google Drive API**, solo si quieres listar o borrar archivos desde
   la app; hoy no se usa.)
4. **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**.
   - Nombre de la app: `Calculadora Kavana`.
   - Correo de asistencia y de contacto: el tuyo.
   - **Permisos (scopes)**: añade `https://www.googleapis.com/auth/drive.file`.
     Es un permiso no sensible: la app solo ve los archivos que ella misma crea.
   - Usuarios de prueba: añade tu correo (y el de quien vaya a probarla) mientras
     la app esté en modo *Testing*.
5. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente OAuth**:
   - Tipo: **Aplicación web**.
   - **Orígenes JavaScript autorizados**:
     - `https://calculadora.kavanasystems.com`
     - `http://localhost:8099` (solo para pruebas en local)
   - **URI de redirección**: no hace falta (se usa flujo de token, sin redirección).
6. Copia el **ID de cliente** (`xxxxx.apps.googleusercontent.com`).

## 2. Pegarlo en la app

Edita `js/config.js`:

```js
export const GOOGLE_CLIENT_ID = 'xxxxx.apps.googleusercontent.com';
```

Haz commit y despliega. Fin.

> El ID de cliente es público: va en el JavaScript de cualquier web que use Google
> Sign-In. Lo que protege la cuenta es el consentimiento y el origen autorizado,
> no el secreto.

## 3. Cómo lo usa el operario

1. **Ajustes → Google Drive → Conectar**.
2. Google pide permiso una vez. Al aceptar, la app crea en su Drive un libro
   llamado `Calculadora Kavana — AAAA-MM-DD` con dos hojas: **Turnos** y **Detalle**.
3. En **Mi historial**, cada vez que pulsa **Guardar en Drive** se añaden las filas
   de los turnos que aún no estaban. No se duplican: la app recuerda qué sesiones
   ya subió.
4. Desde el mismo sitio puede abrir la hoja en Drive.

## 4. Qué pasa si…

| Situación | Comportamiento |
|-----------|----------------|
| Sin conexión | El botón avisa: para Drive hace falta internet. El Excel y el JSON siguen funcionando. |
| El usuario borra la hoja en Drive | La app lo detecta al sincronizar y crea una nueva. El historial local no se toca. |
| Caduca el token (1 h) | Se pide otro; si el usuario ya dio permiso, normalmente sin ventana. |
| Cambia de dispositivo | Debe conectar Drive otra vez y subir el historial (o importar el JSON). |
| Varias personas | Cada una conecta su cuenta y tiene su hoja; el Client ID es el mismo para todas. |
| Más de 100 usuarios | Hay que publicar la app en la consola (con `drive.file` no requiere revisión de Google). |

## 5. Límites conocidos

- El permiso es `drive.file`: la app **no puede** leer el resto del Drive.
- El token vive en memoria: al recargar la página se pide de nuevo (sin mostrar
  ventana si el navegador mantiene la sesión de Google).
- Solo se suben turnos guardados. Un turno en curso no se sincroniza.
- No hay resolución de conflictos: si el usuario edita la hoja a mano, la app
  añade filas debajo sin tocar lo escrito.

## 6. Comprobarlo sin Google

Los tests de `tests/drive-model.test.js` verifican las filas, el orden y el cálculo
de pendientes. La ruta HTTP se puede probar en el navegador con la API simulada
(ver el ADR-012). La prueba real requiere el Client ID del paso 1.
