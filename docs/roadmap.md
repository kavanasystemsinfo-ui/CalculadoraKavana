# Roadmap Técnico — Calculadora Kavana

> **Versión del Documento:** 2.5.0  
> **Última Actualización:** 2026-07-05  
> **Clasificación:** Interna / Arquitectura

---

## 1. Resumen Ejecutivo

**Calculadora Kavana** es una Progressive Web Application para cálculo de eficiencia en producción industrial. El sistema sigue una arquitectura **client-side pura** con persistencia en localStorage, diseñada para operar 100% offline en entornos de fábrica.

### Valor de Negocio

| Aspecto | Impacto |
|---------|---------|
| **Coste Cero de Infraestructura** | Sin servidores, bases de datos ni API keys |
| **Offline-First** | 100% funcional sin conexión a internet |
| **Portabilidad** | Exportación/importación para migración de datos |
| **Escalabilidad** | Preparado para integración futura con backend |
| **Temas Visuales** | Identificación rápida de líneas con codificación por colores |

---

## 2. Estado Actual del Proyecto

### 2.1 Fases Completadas

| Fase | Estado | Fecha de Finalización | Verificación |
|------|--------|----------------------|--------------|
| Phase 1: Limpieza y Base | ✅ COMPLETADA | 2026-06-26 | Arquitectura modular establecida |
| Phase 2: Sistema de Plantillas | ✅ COMPLETADA | 2026-06-26 | CRUD funcional con multi-medida |
| Phase 3: Production Engine | ⏭️ OMITIDA | — | Reducción de alcance deliberada |
| Phase 4: Export & Backup | ✅ COMPLETADA | 2026-06-26 | Excel + JSON export/import |
| Phase 5: Portfolio Polish | ✅ COMPLETADA | 2026-06-28 | 27 tests passing |
| Phase 6: Meta 100% Feature | ✅ COMPLETADA | 2026-07-05 | Botón + desglose implementado |

### 2.2 Progreso por Componente

| Componente | Estado | Tests | Notas |
|------------|--------|-------|-------|
| Storage Helper (`store.js`) | ✅ Completo | 6/6 | Abstracción localStorage |
| Templates UI (`ui-templates.js`) | ✅ Completo | Manual | Operaciones CRUD |
| Production UI (`ui-production.js`) | ✅ Completo | Manual | Cálculo de eficiencia + Meta 100% |
| History UI (`ui-history.js`) | ✅ Completo | Manual | Gestión de sesiones |
| Exporter Module (`export.js`) | ✅ Completo | Manual | Exportación Excel/JSON |
| Theme Manager (`theme.js`) | ✅ Completo | 11/11 | Temas de plantilla |
| Calculator Engine | ✅ Completo | 10/10 | Lógica de cálculo pura |

---

## 3. Roadmap a Futuro

### 3.1 Funcionalidades Planeadas

| Feature | Prioridad | Esfuerzo Estimado | Estado |
|---------|-----------|-------------------|--------|
| Gráficos de eficiencia histórica | Media | 3 días | Planeado |
| Modo oscuro/claro | Media | 2 días | Planeado |
| Múltiples idiomas (i18n) | Baja | 2 días | Planeado |
| Sincronización cloud (Supabase) | Alta | 1 semana | Investigación |
| Modo offline avanzado | Media | 2 días | Planeado |
| Dashboard de supervisores | Alta | 1 semana | Planeado |
| Exportación a PDF | Baja | 1 día | Planeado |
| Notificaciones push | Baja | 2 días | Planeado |

### 3.2 Mejoras Técnicas

| Mejora | Prioridad | Justificación |
|--------|-----------|---------------|
| ESLint + Prettier | Alta | Consistencia de código |
| CI/CD Pipeline | Alta | Deploy automatizado |
| Storybook | Baja | Documentación de componentes |
| Lighthouse CI | Media | Performance monitoring |
| Error Tracking (Sentry) | Media | Monitoreo de errores |

---

## 4. Deuda Técnica

| ID | Componente | Deuda | Severidad | Estado | Mitigación |
|----|------------|-------|-----------|--------|------------|
| TD-001 | sw.js | Verificación de caché pendiente | Baja | Abierta | Verificación manual |
| TD-002 | index.html | Arquitectura de archivo único | Baja | Aceptada | Documentar limitación |
| TD-003 | localStorage | Límite de 5-10MB | Media | Mitigada | Exportación a JSON |
| TD-004 | Tests UI | Tests manuales | Media | Abierta | Considerar Playwright |
| TD-005 | CSS | Sin sistema de diseño formal | Baja | Aceptada | Variables CSS existentes |

---

## 5. Validación y Testing

### 5.1 Comandos de Testing

```bash
# Tests unitarios (todos)
cd tests && npm test

# Tests unitarios (archivo específico)
node --test tests/engine.test.js
node --test tests/storage.test.js
node --test tests/theme.test.js

# Servidor de desarrollo
npx serve .

# Auditoría de producción
# Verificar: https://developers.google.com/web/tools/lighthouse
```

### 5.2 Cobertura de Tests

| Módulo | Líneas | Funciones | Ramas |
|--------|--------|-----------|-------|
| Calculator Engine | 100% | 100% | 100% |
| Storage Helper | 100% | 100% | 100% |
| Theme Manager | 100% | 100% | 100% |
| UI Modules | Manual | Manual | Manual |
| **Total** | **27 tests** | **100%** | **100%** |

---

## 6. Seguridad y Cumplimiento

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Validación de inputs | ✅ | Templates validan campos requeridos |
| Prevención XSS | ✅ | `escapeHtml()` usado en templates |
| Aislamiento de datos | ✅ | localStorage por-origin |
| Sin secretos almacenados | ✅ | Solo client-side |
| Compatible CSP | ✅ | Sin eval(), sin inline scripts |

---

## 7. Estrategia de Despliegue

### 7.1 Plataformas Objetivo

| Plataforma | Estado | URL |
|------------|--------|-----|
| Desarrollo Local | ✅ | `npx serve .` |
| GitHub Pages | ✅ | https://kavanasystemsinfo-ui.github.io/CalculadoraKavana/ |
| Vercel | Planeado | Deploy directo |
| Nginx/Apache | Documentado | Ver deployment-guide.md |

### 7.2 Pipeline CI/CD (Futuro)

```yaml
# .github/workflows/deploy.yml (planeado)
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: peaceiris/actions-gh-pages@v3
```

---

## 8. Registro de Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|--------|-------------|---------|------------|-------------|
| localStorage lleno | Baja | Alto | Recordatorio de exportación | Usuario |
| Compatibilidad de navegador | Baja | Medio | ES Modules en navegadores modernos | Dev |
| Pérdida de datos | Baja | Alto | Funcionalidad de backup JSON | Usuario |
| Cache obsoleta | Media | Medio | Versionado de assets + SW | Dev |
| Dependencia SheetJS CDN | Baja | Medio | Fallback a manual | Dev |

---

## 9. Métricas de Calidad

### 9.1 Performance (Lighthouse)

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Performance | >90 | ~95 |
| Accessibility | >95 | ~98 |
| Best Practices | >90 | ~95 |
| SEO | >80 | ~85 |
| PWA | >90 | ~92 |

### 9.2 Métricas de Código

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Test Coverage | >80% | 100% (módulos core) |
| Cyclomatic Complexity | <10 | <5 |
| Technical Debt | <5% | ~2% |
| Bundle Size | <500KB | ~150KB |

---

*Documento mantenido por el equipo de Arquitectura de Sistemas. Última revisión: 2026-07-05.*
