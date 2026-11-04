# Manual de Usuario — Calculadora Kavana

> **Versión:** 3.0.0
> **Última actualización:** 2026-11-03
> **Público:** operarios de producción

---

## 1. Qué es

La calculadora evita las cuentas de cabeza y los errores al rellenar el parte de
producción en papel. Tú cuentas palets, filas y paquetes; la app hace el resto y
te dice al instante tu eficiencia y lo que te falta para cerrar el turno al 100 %.

- Funciona sin conexión, una vez cargada la primera vez.
- Los datos quedan guardados en tu dispositivo, no en un servidor.
- No envía nada a la oficina: el histórico es tuyo, para cuando te pregunten.

---

## 2. Instalarla

**Android (Chrome):**
1. Abre `calculadora.kavanasystems.com`
2. Menú (⋮) → **Añadir a pantalla de inicio**

**iPhone/iPad (Safari):**
1. Abre la app en Safari
2. Compartir → **Añadir a pantalla de inicio**

---

## 3. Navegación

En tablet verás una barra lateral; en móvil, una barra abajo con cuatro accesos:

| Acceso | Función |
|--------|---------|
| **Turno** | Contar lo producido y ver eficiencia y lo que falta |
| **Mis líneas** | Crear y editar tus líneas con sus modelos y medidas |
| **Mi historial** | Tus turnos guardados y las copias de seguridad |
| **Ajustes** | Formato y color de la interfaz |

---

## 4. Crear una línea

Una línea es tu máquina: su objetivo por hora y los modelos que hace.

1. **Mis líneas** → **+ Nueva línea**
2. Rellena:
   - **Nombre de la línea**: por ejemplo `Perfiladora 3`
   - **Llevar eficiencia**: déjalo marcado si quieres calcular porcentaje
   - **Se mide en**: piezas/hora o metros/hora
   - **Objetivo al 100 %**: lo que la línea hace en una hora a pleno rendimiento
3. Añade cada modelo con **+ Añadir modelo**:
   - **Modelo**: nombre del perfil o pieza
   - **Pz/palet**: piezas de un palet completo
   - **Pz/paquete** y **Pz/fila**: cómo se cuenta en planta
   - **Medidas (largo en mm)**: una por cada largo. Usa **+ Añadir medida** si el
     mismo modelo sale en varios largos.
4. **Guardar**

Puedes editar la línea cuando quieras con el lápiz; el icono ✕ la elimina.

---

## 5. Registrar el turno

1. **Mis líneas** → toca el nombre de tu línea (se abre el turno)
2. En **Lo que llevas hecho**, busca el modelo en el buscador y tócalo para añadirlo
3. Con los botones **− / +** apunta lo que llevas:
   - **Palets** completos
   - **Filas** del palet abierto
   - **Paquetes** sueltos
4. Ajusta **Duración del turno** (horas y minutos) si no son 8 h

No hay que pulsar nada más: la eficiencia, los metros y las piezas se recalculan
en el momento.

### Dónde mirar

| Zona | Qué te dice |
|------|-------------|
| **Eficiencia** (número grande) | Porcentaje del turno sobre el objetivo |
| **Piezas / Tiempo teórico** | Piezas contadas y horas que habrías tardado al ritmo del 100 % |
| **Te falta para el 100 %** | Palets, filas y paquetes que aún tendrías que contar |

**Ojo:** cada fila de *Te falta* es lo que faltaría si el turno fuese solo de ese
modelo. Cuánto haces de cada uno lo marca la orden de producción, no la app.

---

## 6. Guardar el turno

Toca **Guardar turno**. Se añade a **Mi historial** con la fecha, la eficiencia y
las piezas y metros producidos. Si no has contado nada, el botón está desactivado.

---

## 7. Historial y copias

En **Mi historial** ves tus turnos, con la eficiencia de cada uno. Desde ahí:

- **Guardar en Drive**: vuelca en tu hoja de Google Sheets los turnos que aún no
  estaban. La primera vez hay que conectar Drive en **Ajustes → Google Drive**.
  Cada pulsación añade solo lo nuevo, no duplica.
- **Descargar Excel**: un `.xlsx` con el detalle, para cuando no tengas conexión
  o quieras el archivo suelto.
- **Copia de seguridad (JSON)**: guarda todos tus datos en un archivo.
- **Importar copia**: los recupera en este u otro dispositivo.
- **✕** en una fila: borra ese turno (no se puede deshacer).

---

## 8. Ajustes

- **Formato**: *Compacto* (una columna, móvil) o *Expandido* (dos columnas y
  botones grandes, tablet de planta).
- **Tema**: seis colores. Cada línea puede tener el suyo y se aplica al abrirla.
- **Zona peligrosa**: borra todas las líneas y el historial del dispositivo.

---

## 9. Rutina de turno

**Antes de empezar**
1. Abre la app y comprueba que estás en tu línea
2. Mira *Te falta para el 100 %* y apunta el objetivo en el parte

**Durante el turno**
1. Ve sumando palets, filas y paquetes con − / +
2. Si cambias de modelo, añádelo con el buscador

**Al terminar**
1. Revisa que la duración del turno sea la correcta
2. Comprueba la eficiencia que marca
3. **Guardar turno**

---

## 10. Preguntas frecuentes

**¿Se pierden los datos si cierro el navegador?**
No. Quedan en este dispositivo hasta que los borres desde Ajustes. Los del turno
en curso, en cambio, debes guardarlos antes de cerrar.

**¿Puedo usarla sin internet?**
Sí, una vez cargada la primera vez.

**¿Cómo la paso a otro móvil?**
Copia de seguridad (JSON) en el historial e importación en el otro dispositivo.

**¿Por qué no veo el porcentaje?**
La línea está configurada solo para contar piezas. Se activa en *Mis líneas* →
editar → **Llevar eficiencia**.

**¿De dónde sale el objetivo del turno?**
De multiplicar el objetivo por hora por la duración del turno. Con 2.400 m/h y
7 h 30 m, el 100 % son 18.000 m.

---

*Calculadora Kavana — Herramientas de Producción*
