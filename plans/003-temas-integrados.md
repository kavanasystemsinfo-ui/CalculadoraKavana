# Temas Integrados: Combinación de Global + Plantilla

## Objetivo
Integrar los temas de plantilla con los temas globales para crear combinaciones únicas.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    ThemeManager                             │
│  - applyTheme(globalTheme, templateTheme)                   │
│  - getCombinedTheme(globalTheme, templateTheme)            │
└─────────────────────────────────────────────────────────────┘
```

## Combinaciones

| Global | Plantilla | Resultado |
|--------|-----------|-----------|
| dark | blue | dark-blue |
| dark | green | dark-green |
| dark | orange | dark-orange |
| dark | purple | dark-purple |
| dark | red | dark-red |
| dark | teal | dark-teal |
| light | blue | light-blue |
| light | green | light-green |
| ... | ... | ... |
| industrial | blue | industrial-blue |
| industrial | green | industrial-green |
| ... | ... | ... |

## Implementación

1. Modificar `css/styles.css` con combinaciones completas
2. Actualizar `js/theme.js` para aplicar combinaciones
3. Actualizar `index.html` con nuevas opciones
4. Actualizar `js/ui-templates.js` y `js/ui-production.js`