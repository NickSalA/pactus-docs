---
title: Centro de Alertas (Trabajadores)
description: Sistema de alertas para identificar contratos laborales críticos a 30, 60 días y vigencia prolongada.
---

El **Centro de Alertas (Trabajadores)** actúa como una herramienta de seguimiento proactivo para el área de Recursos Humanos. 

Centraliza y semaforiza los contratos de talento humano que se acercan a su término, mitigando los riesgos de que los trabajadores sigan prestando labores fuera del plazo legal, o que se generen renovaciones automáticas no deseadas (tácitas).

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/alert_center/labor` |
| **Rol requerido** | HR |

### Lógica de Cálculo
- Toma la totalidad del portafolio laboral (LABOR) activo.
- Estructura las alertas en tres grandes grupos o "tarjetas":
  1. **Vencen Próximos (30 días):** Vencimientos en el cortísimo plazo.
  2. **Vencen Próximos (60 días):** Vencimientos previstos para el mes siguiente.
  3. **Vigencia Prolongada:** Contratos sin fecha de fin inminente (> 60 días de vigencia restante).
- Presenta las métricas de volumen por grupo y un extracto de las alertas para resolución directa.

### Respuesta del Endpoint (Ejemplo)
```json
[
  {
    "label": "VENCEN PROXIMOS",
    "color": { "accent": "#232232", "bg": "#123421" },
    "due_to": 30,
    "count": 3,
    "items": [
      { "id": 10, "name": "Juan Pérez", "detail": null, "status": "VENCE EN 15 DIAS" }
    ]
  },
  {
    "label": "VENCEN PROXIMOS",
    "color": { "accent": "#F59E0B", "bg": "#FEF3C7" },
    "due_to": 60,
    "count": 5,
    "items": []
  },
  {
    "label": "VIGENCIA PROLONGADA",
    "color": { "accent": "#059669", "bg": "#D1FAE5" },
    "due_to": null,
    "count": 8,
    "items": []
  }
]
```

## Valor de Negocio

El **Gerente Legal** y el **Director de RRHH** dependen de este sistema para asegurar el fiel cumplimiento normativo y mantener un inventario de personal sano.

La anticipación a 60 días facilita que los procesos de evaluación de desempeño de los empleados se completen con holgura y que las renovaciones —o desvinculaciones— se formalicen de manera documentada, protegiendo a la empresa frente a eventuales contingencias laborales.