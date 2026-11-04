/**
 * Configuración pública de la app.
 *
 * GOOGLE_CLIENT_ID: identificador del cliente OAuth de Google (tipo "Aplicación
 * web"). Es público por diseño, no es un secreto. Se crea en Google Cloud
 * Console y se limita a los orígenes de la app. Instrucciones completas en
 * docs/drive-setup.md.
 *
 * Mientras esté vacío, la app funciona igual y el botón "Guardar en Drive"
 * aparece desactivado explicando que falta configurarlo.
 */
export const GOOGLE_CLIENT_ID = '';

/** Permiso mínimo: solo los archivos que crea esta app. */
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
