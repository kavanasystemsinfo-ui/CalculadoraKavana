# Calculadora Kavana

### Herramienta de Cálculo de Eficiencia para Producción Industrial

<p align="center">
  <img src="ICON.png" width="120" alt="Calculadora Kavana Logo">
</p>

<p align="center">
  <strong>Progressive Web Application</strong> · Offline-First · Zero Infrastructure<br>
  <em>Diseñada para el suelo de fábrica donde la conectividad no está garantizada</em>
</p>

---

## Resumen Ejecutivo

**Calculadora Kavana** es una aplicación web progresiva (PWA) diseñada para el cálculo de eficiencia en líneas de producción industrial. Desarrollada bajo una arquitectura **client-side pura** (sin backend), garantiza funcionamiento 100% offline en dispositivos móviles, tablets industriales y terminales de planta.

### Propuesta de Valor

| Métrica | Impacto |
|---------|---------|
| **Coste de Infraestructura** | $0 — Sin servidores, bases de datos ni API keys |
| **Disponibilidad** | 100% offline — Funciona sin conexión a internet |
| **Despliegue** | Estático — Compatible con GitHub Pages, Vercel, Nginx, cualquier CDN |
| **Portabilidad** | Export/Import JSON — Migración de datos entre dispositivos |
| **Tiempo de Carga** | <500ms — Sin framework, sin bundler, sin dependencias pesadas |

### Características Principales

- **Gestión de Plantillas**: Configuración de líneas de producción con modelos, medidas y parámetros de eficiencia
- **Cálculo de Eficiencia**: Cálculo en tiempo real de la eficiencia del turno en piezas/hora o metros/hora
- **Meta 100%**: Visualización del目标 de producción necesario para alcanzar el 100% de eficiencia
- **Temas Visuales**: 6 paletas de colores para identificación rápida de líneas
- **Exportación Excel**: Generación de archivos .xlsx conSheetJS para integración con sistemas ofimáticos
- **Backup JSON**: Respaldo e importación completa de datos
- **PWA Instalable**: Se puede instalar en dispositivos como aplicación nativa

---

## Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CALCULADORA KAVANA - ARQUITECTURA                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    PRESENTATION LAYER                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │   Production │  │  Templates   │  │   History    │        │  │
│  │  │      UI      │  │      UI      │  │      UI      │        │  │
│  │  │ (ui-prod.js) │  │ (ui-tpl.js)  │  │ (ui-hist.js) │        │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                    CustomEvent Bus                                   │
│                              │                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   BUSINESS LOGIC LAYER                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │  Calculator  │  │    Store     │  │   Exporter   │        │  │
│  │  │    Engine    │  │   Helper     │  │    Module    │        │  │
│  │  │(calculator.js)│ │  (store.js)  │  │  (export.js) │        │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    PERSISTENCE LAYER                          │  │
│  │  ┌──────────────────────────────────────────────────────┐     │  │
│  │  │              localStorage (Browser API)               │     │  │
│  │  │    Templates: prodcalc_templates                      │     │  │
│  │  │    Sessions:  prodcalc_sessions                       │     │  │
│  │  └──────────────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    INFRASTRUCTURE LAYER                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │  Service     │  │   Theme      │  │   Anti-FOUC  │        │  │
│  │  │  Worker      │  │   Manager    │  │   Script     │        │  │
│  │  │   (sw.js)    │  │  (theme.js)  │  │  (inline)    │        │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Runtime** | ES Modules (ES2022) | Sistema de módulos nativo del navegador |
| **Persistencia** | localStorage | Almacenamiento síncrono, offline-first |
| **Exportación** | SheetJS (xlsx 0.20.2) | Generación de archivos Excel |
| **PWA** | Service Worker API | Soporte offline y caché |
| **Testing** | Node.js test runner | Unit testing integrado |
| **Despliegue** | Static Hosting | GitHub Pages / Vercel / Nginx |

### Decisiones Arquitectónicas Clave

| Decisión | Alternativa Descartada | Justificación |
|----------|------------------------|---------------|
| ES Modules nativos | React/Vue/Angular | Zero dependencies, carga instantánea |
| localStorage | IndexedDB/Dexie.js | Síncrono, sin async/await, simpler |
| CustomEvent bus | RxJS/EventEmitter | Desacoplamiento sin dependencias |
| innerHTML rendering | Virtual DOM | Suficiente para listas <50 elementos |
| Service Worker caching | App Shell | Offline-first real, no solo cache |

Ver [docs/DECISIONES_ESTRATEGICAS.md](docs/DECISIONES_ESTRATEGICAS.md) para el registro completo de decisiones (ADR).

---

## Modelo de Datos

### Template (Plantilla de Producción)

```typescript
interface Template {
  id: string;                    // UUID único
  name: string;                  // Nombre de la línea/plantilla
  enableEfficiency: boolean;     // Habilitar cálculo de eficiencia
  efficiencyType: 'pieces_per_hour' | 'meters_per_hour' | null;
  expectedEfficiency: number;    // Piezas o metros esperados por hora (100%)
  theme: ThemeColor;             // Paleta visual asignada
  models: Model[];               // Modelos fabricados en esta línea
}

interface Model {
  id: string;
  name: string;                  // Nombre del modelo (ej: "T-12B")
  piecesPerPallet: number;       // Piezas por palet
  piecesPerPackage: number;      // Piezas por paquete
  piecesPerRow: number;          // Piezas por fila
  measures: Measure[];           // Medidas/longitudes disponibles
}

interface Measure {
  id: string;
  lengthMm: number;              // Longitud en milímetros
}

type ThemeColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal';
```

### ProductionSession (Sesión de Producción)

```typescript
interface ProductionSession {
  id: string;
  templateId: string;            // Referencia a la plantilla usada
  templateName: string;          // Snapshot del nombre
  efficiencyType: string;
  expectedEfficiency: number;
  date: string;                  // ISO 8601
  shiftHours: number;            // Horas del turno
  entries: ProductionEntry[];    // Detalle por modelo
  efficiency: number;            // Eficiencia calculada (%)
  totalPieces: number;
  totalMeters: number;
  theoreticalTime: number;       // Tiempo teórico (horas)
}

interface ProductionEntry {
  modelId: string;
  modelName: string;
  lengthMm: number;
  pallets: number;               // Palets completos
  pieces: number;                // Total piezas calculado
  rows: number;                  // Filas
  packages: number;              // Paquetes sueltos
}
```

### Almacenamiento localStorage

| Clave | Contenido | Tamaño Máx. |
|-------|-----------|-------------|
| `prodcalc_templates` | Array de plantillas JSON | ~5MB total |
| `prodcalc_sessions` | Array de sesiones JSON | ~5MB total |
| `themeProduction` | Tema activo (string) | Bytes |
| `themeLayout` | Layout (compact/expanded) | Bytes |

---

## Modelo de Cálculo

### Fórmula de Eficiencia

```
Eficiencia (%) = (Tiempo Teórico / Tiempo Real) × 100

Donde:
  Tiempo Teórico = Total Producido / Eficiencia Esperada
  Tiempo Real    = Horas del Turno
```

### Desglose de Producción

```
Total Piezas = (Palets × Pz/Palet) + (Paquetes × Pz/Paquete) + (Filas × Pz/Fila)
```

### Meta 100% de Eficiencia

```
Piezas Necesarias = Eficiencia Esperada × Horas del Turno

Desglose (Greedy):
  Palets   = floor(Necesarias / Pz/Palet)
  Resto    = Necesarias % Pz/Palet
  Filas    = floor(Resto / Pz/Fila)
  Resto    = Resto % Pz/Fila
  Paquetes = ceil(Resto / Pz/Paquete)
```

---

## Estructura del Proyecto

```
CalculadoraKavana/
├── css/
│   └── styles.css              # Sistema de temas CSS con variables
├── js/
│   ├── app.js                  # Orquestador principal (App, Tabs, SW)
│   ├── calculator.js           # Motor de cálculos (TDD-ready, puro)
│   ├── export.js               # Módulo de exportación Excel/JSON
│   ├── store.js                # Capa de abstracción localStorage
│   ├── theme.js                # Gestor de temas globales y de producción
│   ├── ui-production.js        # Controlador pestaña Producción
│   ├── ui-templates.js         # Controlador pestaña Plantillas (CRUD)
│   └── ui-history.js           # Controlador pestaña Historial
├── docs/
│   ├── DECISIONES_ESTRATEGICAS.md  # Architecture Decision Records (10)
│   ├── deployment-guide.md     # Guía de despliegue
│   ├── developer-guide.md      # Guía para desarrolladores
│   ├── technical-architecture.md   # Documentación técnica completa
│   ├── user-manual.md          # Manual de usuario
│   └── roadmap.md              # Roadmap técnico
├── DECISIONS.md                # Consolidación de decisiones (raíz)
├── tests/
│   ├── engine.test.js          # Tests del motor de cálculos (22)
│   ├── storage.test.js         # Tests del módulo de almacenamiento (6)
│   └── theme.test.js           # Tests del sistema de temas (6)
├── index.html                  # SPA root (entry point)
├── manifest.json               # Configuración PWA
├── sw.js                       # Service Worker (caché offline)
├── CHANGELOG.md                # Registro de cambios
└── README.md                   # Este archivo
```

---

## 💰 Cómo está construido y cómo lo construiría con presupuesto

Este repositorio es una pieza de portafolio con **un solo usuario real: su autor**, y se ha construido con la restricción explícita de costar ~0 €/mes. Las decisiones de infraestructura que vienen a continuación son decisiones de presupuesto, no de escala: funcionan porque el único usuario, el único dispositivo y el único interesado en los datos son la misma persona. Abajo se separa lo que hay hoy (y por qué) de lo que cambiaría con usuarios reales, presupuesto y un contrato de por medio. El detalle y las alternativas descartadas están en [ADR-010](docs/adr/adr-010-coste-cero-y-decisiones-tomadas-por-presupuesto.md).

- **Hosting y despliegue:** la app se sirve como estático desde GitHub Pages con dominio propio (`CNAME` → `calculadora.kavanasystems.com`): 0 € y cero mantenimiento de servidor. Con usuarios reales: hosting con SLA, entornos de staging y producción separados, y despliegue con control de versiones (el pipeline `deploy.yml` figura como planeado en `docs/roadmap.md`).
- **Persistencia y copias de seguridad:** `localStorage` (ADR-008), síncrono, sin dependencias y sin coste; el techo es de ~5-10 MB por navegador y los datos viven en un único dispositivo, mitigado con export/import JSON (deuda TD-003). El usuario es su propio backup: no hay copia automática. Con usuarios reales: base de datos compartida con sincronización cloud — prevista en el roadmap con prioridad alta, y el modelo de datos ya reserva `tenantId` (`local_default`) para ese salto — más copias automáticas.
- **Autenticación y multi-usuario:** no existe. La identidad es el navegador y los datos quedan aislados por origen, así que cualquiera con el dispositivo ve y edita todas las plantillas. Con usuarios reales: login, roles (operario / supervisor) y aislamiento por planta, además del dashboard de supervisores que el roadmap marca como prioridad alta.
- **Servidor:** la calculadora es client-side pura, sin backend. El único servidor del repo es el asistente técnico RAG de `backend/` (FastAPI sobre Fly.io: una máquina de 256 MB compartida, `auto_stop_machines = "stop"`, `min_machines_running = 0`), dimensionado al mínimo porque sólo se levanta cuando alguien pregunta. Con usuarios reales: dimensionado por carga real y con métricas de uso; este backend es posterior al resto del documento, y su fuente de verdad son `backend/`, `fly.toml` y este ADR.
- **Modelo del asistente:** LLM free-tier vía OpenRouter (`ASSISTANT_MODEL_FREE` / `ASSISTANT_MODEL_PRO` apuntan al mismo modelo) e índice TF-IDF construido en memoria sobre el propio corpus del repo (README, `SECURITY.md`, ADRs y guías), sin base de datos vectorial ni embeddings. Con usuarios reales: modelo de pago con SLA y recuperación con embeddings; el TF-IDF en memoria cabe porque el corpus es la documentación de este repositorio.
- **Protección del asistente:** límite de 15 preguntas/día por IP en un diccionario en memoria que se pierde al reiniciar el proceso (decisión de Jorge, 2026-09-01), con la clave del proveedor sólo en el servidor. Con usuarios reales: cuotas por cuenta en Redis o base de datos, y panel de métricas; hoy no hay telemetría ni error tracking (Sentry figura en el roadmap, prioridad media).
- **Dependencias de runtime:** cero dependencias npm en ejecución (ES Modules nativos, sin bundler). Las dos excepciones externas — SheetJS 0.20.2 y la fuente Inter — se cargan desde CDN, no están en la lista de precaché de `sw.js` y por tanto el export a Excel falla si el primer arranque es offline; el riesgo está asumido en `docs/roadmap.md` con fallback manual. Con usuarios reales: vendorizar o servir esos assets desde el propio dominio.
- **Calidad:** 34 tests con el runner nativo de Node (`node --test`, sin dependencias) y CI en GitHub Actions sobre Node 20 que ignora `docs/**` y `**.md`; los módulos de UI se prueban a mano (deuda TD-004) y no hay linting (`ESLint + Prettier` está como prioridad alta en el roadmap). Con usuarios reales: tests de UI automatizados (Playwright), gate de CI bloqueante y auditoría de rendimiento en pipeline (Lighthouse CI).

Lo que no cambia entre los dos escenarios es el núcleo técnico: el motor de cálculo puro de `js/calculator.js`, la fórmula de eficiencia y el desglose greedy de la Meta 100% (ADR-009), el modelo de datos (`Template` / `Model` / `Measure` / `ProductionSession`), la arquitectura modular sin framework ni bundler (ADR-002, ADR-004, ADR-005) y la regla de honestidad del asistente (sólo responde con lo que está documentado). Ninguna de esas decisiones se tomó por presupuesto: se tomaron por simplicidad, y con presupuesto seguirían siendo las mismas.

---

## Instalación y Despliegue

### Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/kavanasystemsinfo-ui/CalculadoraKavana.git
cd CalculadoraKavana

# Iniciar servidor de desarrollo (requiere HTTP para ES Modules)
npx serve .
# O alternativamente:
python -m http.server 8000
```

### Despliegue en Producción

**GitHub Pages (recomendado para portafolio):**
```bash
# Habilitar GitHub Pages en Settings > Pages > Source: main branch
# La app estará disponible en: https://kavanasystemsinfo-ui.github.io/CalculadoraKavana/
```

**Vercel / Netlify (despliegue estático):**
```bash
# Arrastrar la carpeta del proyecto al dashboard
# O usar CLI:
vercel deploy
```

**Nginx / Apache (servidor propio):**
```nginx
# Configuración Nginx
server {
    listen 80;
    server_name calculadora.tudominio.com;
    root /var/www/CalculadoraKavana;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache headers para assets estáticos
    location ~* \.(js|css|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Ver [docs/deployment-guide.md](docs/deployment-guide.md) para guía completa.

---

## Testing

```bash
# Ejecutar todos los tests
cd tests && npm test

# Tests específicos
node --test tests/engine.test.js    # Motor de cálculos (22 tests)
node --test tests/storage.test.js   # Almacenamiento (6 tests)
node --test tests/theme.test.js     # Sistema de temas (6 tests)

# Resultado esperado:
# ✓ Calculator Engine: 22/22 passing
# ✓ Storage Helper: 6/6 passing
# ✓ Theme Manager: 6/6 passing
# Total: 34 tests, 0 failures
```

### Cobertura de Tests

| Módulo | Líneas | Funciones | Ramas |
|--------|--------|-----------|-------|
| Calculator Engine | 100% | 100% | 100% |
| Storage Helper | 100% | 100% | 100% |
| Theme Manager | 100% | 100% | 100% |
| UI Modules | Manual | Manual | Manual |

---

## Seguridad

| Control | Implementación | Notas |
|---------|----------------|-------|
| Validación de Inputs | Campos requeridos en forms | Template validación obligatoria |
| Prevención XSS | `escapeHtml()` en renderizado | Todas las inserciones HTML sanitizadas |
| Aislamiento de Datos | localStorage por-origin | Datos aislados por dominio |
| Sin Secretos | Solo client-side | No se almacenan API keys ni tokens |
| CSP Compatible | Sin eval(), sin inline scripts | excepto anti-FOUC pre-carga |

---

## Roadmap

Ver [docs/roadmap.md](docs/roadmap.md) para el roadmap técnico completo.

| Fase | Estado | Fecha |
|------|--------|-------|
| Phase 1: Limpieza y Base | ✅ Completado | 2026-06-26 |
| Phase 2: Sistema de Plantillas | ✅ Completado | 2026-06-26 |
| Phase 3: Production Engine | ⏭️ Omitido | — |
| Phase 4: Export & Backup | ✅ Completado | 2026-06-26 |
| Phase 5: Portfolio Polish | ✅ Completado | 2026-06-28 |
| Phase 6: Meta 100% Feature | ✅ Completado | 2026-07-05 |

---

## Licencia

MIT License — Ver [LICENSE](LICENSE) para detalles.

---

## Contacto

**Kavana Systems** — Digital Solutions
- GitHub: [kavanasystemsinfo-ui](https://github.com/kavanasystemsinfo-ui)

---

*Desarrollado con arquitectura vanilla JS. Sin frameworks. Sin dependencias innecesarias. Producción industrial real.*
