# Manual de Usuario — Calculadora Kavana

> **Versión:** 2.5.0  
> **Última Actualización:** 2026-07-05  
> **Público Objetivo:** Operarios de producción, Supervisores de línea

---

## 1. Bienvenida

**Calculadora Kavana** es una herramienta diseñada para ayudarte a calcular y controlar la eficiencia de tu turno de producción. Funciona directamente desde el navegador de tu móvil o tablet, **sin necesidad de internet**.

### ¿Qué puedes hacer con ella?

- **Calcular la eficiencia** de tu turno en tiempo real
- **Conocer tu meta** de producción para alcanzar el 100%
- **Registrar** la producción de cada modelo y medida
- **Exportar** los datos a Excel para informes
- **Consultar** el historial de turnos anteriores

---

## 2. Primeros Pasos

### 2.1 Acceder a la Aplicación

Abre el navegador de tu dispositivo y accede a la dirección que te haya proporcionado tu supervisor.

### 2.2 Instalar como App (Opcional)

Para acceso rápido desde tu pantalla de inicio:

**En Android:**
1. Abre la app en Chrome
2. Toca los tres puntos (⋮) arriba a la derecha
3. Selecciona **"Añadir a pantalla de inicio"**
4. Ponle un nombre (ej: "Calculadora Kavana")
5. Toca **"Añadir"**

**En iPhone/iPad:**
1. Abre la app en Safari
2. Toca el botón de compartir (📤)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Toca **"Añadir"**

---

## 3. Navegación Básica

La app tiene tres pestañas principales:

| Pestaña | Función |
|---------|---------|
| **PRODUCCIÓN** | Registrar y calcular la eficiencia del turno |
| **PLANTILLAS** | Crear y gestionar las líneas de producción |
| **HISTORIAL** | Ver turnos anteriores y exportar datos |

Para cambiar de pestaña, simplemente toca el nombre de la pestaña que quieras.

---

## 4. Crear una Plantilla

Una plantilla define una línea de producción con sus modelos y parámetros.

### 4.1 Paso 1: Ir a Plantillas

Toca la pestaña **PLANTILLAS**.

### 4.2 Paso 2: Nueva Plantilla

Toca el botón **"+ Nueva Plantilla"**.

### 4.3 Paso 3: Configurar la Plantilla

Rellena los campos:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre** | Nombre de la línea o plantilla | "Línea 1 - Inyección" |
| **Habilitar eficiencia** | Marcar si quieres calcular eficiencia | ✅ (recomendado) |
| **Tipo de eficiencia** | Piezas/hora o Metros/hora | Piezas/hora |
| **Eficiencia esperada** | Cantidad que se debe producir por hora para el 100% | 250 |

### 4.4 Paso 4: Añadir Modelos

Por cada modelo que se fabrique en esta línea:

1. Toca **"+ Añadir Modelo"**
2. Rellena:
   - **Nombre del modelo**: Ej: "T-12B"
   - **Pz/Palet**: Cuántas piezas caben en un palet completo
   - **Pz/Paquete**: Cuántas piezas hay en un paquete
   - **Pz/Fila**: Cuántas piezas hay en una fila

3. Añade las **medidas** (longitudes) que tiene ese modelo:
   - Escribe el largo en milímetros (mm)
   - Si tiene más de una medida, toca **"➕ Añadir Medida"**

### 4.5 Paso 5: Guardar

Toca **"Guardar"**. Tu plantilla queda guardada automáticamente.

---

## 5. Registrar Producción del Turno

### 5.1 Seleccionar Plantilla

1. Ve a la pestaña **PLANTILLAS**
2. Toca el nombre de la plantilla que quieres usar
3. Se abrirá automáticamente la pestaña **PRODUCCIÓN**

### 5.2 Añadir Modelos al Turno

1. En **"Añadir Modelo a Producción"**, escribe el nombre o medida del modelo
2. Selecciona el modelo+medida de la lista
3. Se añadirá una tarjeta con los campos de entrada

### 5.3 Introducir Datos de Producción

Para cada modelo, rellena:

| Campo | Descripción |
|-------|-------------|
| **PALETS** | Número de palets COMPLETOS producidos |
| **FILAS** | Número de filas completas (después de palets) |
| **PAQUETES** | Número de paquetes sueltos (después de filas) |

**Importante:** Los campos están en mayúsculas para facilitar la lectura en el taller.

### 5.4 Ejemplo Práctico

Si produjiste:
- 2 palets completos de 480 piezas cada uno
- 3 filas de 24 piezas cada una
- 5 paquetes de 12 piezas cada uno

Introduce:
- PALETS: `2`
- FILAS: `3`
- PAQUETES: `5`

La app calculará automáticamente:
- Total piezas: (2 × 480) + (3 × 24) + (5 × 12) = 960 + 72 + 60 = **1.092 piezas**

---

## 6. Conocer tu Meta (100% Eficiencia)

Antes de empezar el turno, puedes ver cuántas piezas necesitas producir para alcanzar el 100%.

### 6.1 Paso 1: Seleccionar Horas de Turno

En **"Horas del Turno"**, selecciona:
- **HORAS**: Duración del turno (ej: 8 h)
- **MINUTOS**: Minutos adicionales (ej: +30 min)

### 6.2 Paso 2: Calcular Meta

Toca el botón **"🎯 Meta 100%"**.

### 6.3 Paso 3: Ver Resultado

Verás:
- **Total de piezas** necesarias en grande
- **Desglose por modelo**: Cuántos palets, filas y paquetes necesitas hacer

Ejemplo:
```
Total Piezas para 100%: 1.600

T12B · 1205 mm
┌─────────┬─────────┬─────────┐
│ PALETS  │  FILAS  │PAQUETES │
│    3    │    6    │    1    │
│ 3×480   │ 6×24    │ 1×120   │
│ =1.440  │  =144   │  =120   │
└─────────┴─────────┴─────────┘
Total: 1.704 piezas
```

**Nota:** El total puede ser ligeramente superior al necesario porque se priorizan palets completos.

---

## 7. Calcular Eficiencia del Turno

Al finalizar tu turno:

### 7.1 Paso 1: Verificar Horas

Asegúrate de que las horas y minutos del turno sean correctos.

### 7.2 Paso 2: Calcular

Toca el botón **"📐 Calcular Eficiencia"**.

### 7.3 Paso 3: Ver Resultados

| Dato | Significado |
|------|-------------|
| **Total Piezas** | Piezas totales producidas |
| **Total Metros** | Metros lineales producidos |
| **Tiempo Teórico** | Cuántas horas deberías haber tardado |
| **Eficiencia del Turno** | Tu porcentaje de eficiencia |

**Colores de eficiencia:**
- 🟢 **Verde** (≥100%): Excelente, superaste el objetivo
- 🟡 **Naranja** (80-99%): Buen ritmo, cerca del objetivo
- 🔴 **Rojo** (<80%): Por debajo del objetivo

### 7.4 Paso 4: Guardar Sesión

Toca **"💾 Guardar Sesión"** para registrar el turno en el historial.

---

## 8. Consultar el Historial

### 8.1 Ver Sesiones Anteriores

Ve a la pestaña **HISTORIAL**. Verás una lista de todos los turnos guardados con:
- Nombre de la plantilla
- Fecha y duración del turno
- Eficiencia alcanzada

### 8.2 Exportar a Excel

1. Toca el icono 📥 junto a la sesión que quieras exportar
2. Se descargará un archivo `.xlsx` con:
   - Datos generales (fecha, turno, eficiencia)
   - Detalle por modelo (piezas, metros)

### 8.3 Backup Completo

Para guardar todos tus datos:
1. Toca **"📤 Exportar Backup (JSON)"**
2. Guarda el archivo en un lugar seguro

Para restaurar un backup:
1. Toca **"📥 Importar Backup"**
2. Selecciona el archivo JSON

---

## 9. Cambiar la Apariencia

### 9.1 Cambiar Tema de Color

1. Ve a la pestaña **CONFIGURACIÓN** (engrane ⚙️)
2. En **"Tema de Producción"**, selecciona un color:
   - 🔵 Azul (Profesional)
   - 🟢 Verde (Natural)
   - 🟠 Naranja (Cálido)
   - 🟣 Púrpura (Creativo)
   - 🔴 Rojo (Energético)
   - 🔵 Turquesa (Fresco)

### 9.2 Cambiar Layout

- **Compacto**: Para móviles (tamaño normal)
- **Expandido**: Para tablets industriales (botones más grandes)

---

## 10. Consejos para Operarios

### 10.1 Antes del Turno

1. Abre la app y verifica que tengas la plantilla correcta seleccionada
2. Toca **"🎯 Meta 100%"** para conocer tu objetivo
3. Apunta cuántos palets, filas y paquetes necesitas

### 10.2 Durante el Turno

1. Ve introduciendo los palets, filas y paquetes a medida que produces
2. Puedes añadir varios modelos si cambias de producto
3. Los datos se guardan automáticamente al calcular

### 10.3 Al Finalizar el Turno

1. Verifica que las horas sean correctas
2. Toca **"📐 Calcular Eficiencia"**
3. Toca **"💾 Guardar Sesión"**
4. Si tu supervisor lo pide, exporta a Excel

### 10.4 Buena Práctica

- **No cierres la app** durante el turno (los datos se pierden si no se guardan)
- **Guarda la sesión** al finalizar cada turno
- **Haz backup** periódicamente desde el historial

---

## 11. Preguntas Frecuentes

### ¿Se pierden los datos si cierro el navegador?

**No**, los datos se guardan automáticamente en el dispositivo. Sin embargo, si usas la función "Borrar toda la base de datos" en Configuración, se eliminarán todos los datos.

### ¿Puedo usar la app sin internet?

**Sí**, la app funciona 100% offline una vez cargada por primera vez.

### ¿Puedo cambiar de dispositivo y conservar mis datos?

**Sí**, usa la función de **Backup** (📤 Exportar Backup) en el Historial para exportar tus datos a un archivo JSON. Luego importa ese archivo en el nuevo dispositivo.

### ¿Qué significan los colores de eficiencia?

- **Verde** (≥100%): Superaste el objetivo
- **Naranja** (80-99%): Estás cerca del objetivo
- **Rojo** (<80%): Estás por debajo del objetivo

### ¿Cómo sé cuántas piezas necesito para el 100%?

Toca el botón **"🎯 Meta 100%"** antes de empezar el turno. Te mostrará el total de piezas y el desglose en palets, filas y paquetes.

---

## 12. Soporte

Si tienes problemas o dudas, contacta con tu supervisor o con el equipo de sistemas de la empresa.

---

*Calculadora Kavana — Herramientas de Producción Industrial*
