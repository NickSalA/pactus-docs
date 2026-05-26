---
title: Centro de Alertas (Empresas)
description: Sistema de alertas para identificar contratos empresariales críticos a 30, 60 días y vigencia prolongada.
---

El **Centro de Alertas (Empresas)** es un panel preventivo diseñado para identificar rápidamente los contratos comerciales que requieren atención inmediata. 

A través de un sistema de semáforos y categorías, permite al equipo legal y comercial anticiparse a vencimientos críticos y gestionar renovaciones o terminaciones a tiempo.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/alert_center/company` |
| **Rol requerido** | MANAGER |

### Lógica de Cálculo
- Evalúa todos los contratos comerciales (B2B) actualmente activos.
- Clasifica automáticamente los contratos en tres categorías basadas en su fecha de finalización:
  1. **Vencen Próximos (30 días):** Contratos cuya fecha de fin se encuentra dentro de los próximos 30 días.
  2. **Vencen Próximos (60 días):** Contratos cuya fecha de fin oscila entre 31 y 60 días en el futuro.
  3. **Vigencia Prolongada:** Contratos con una fecha de fin superior a 60 días, indicando estabilidad contractual.
- Retorna el conteo total por categoría y una lista previa de hasta 3 contratos para visualización rápida.

### Respuesta del Endpoint (Ejemplo)
```json
[
  {
    "label": "VENCEN PROXIMOS",
    "color": { "accent": "#232232", "bg": "#123421" },
    "due_to": 30,
    "count": 5,
    "items": [
      { "id": 1, "name": "Contrato Acme Corp", "detail": null, "status": "VENCE EN 12 DIAS" }
    ]
  },
  {
    "label": "VENCEN PROXIMOS",
    "color": { "accent": "#F59E0B", "bg": "#FEF3C7" },
    "due_to": 60,
    "count": 8,
    "items": []
  },
  {
    "label": "VIGENCIA PROLONGADA",
    "color": { "accent": "#059669", "bg": "#D1FAE5" },
    "due_to": null,
    "count": 12,
    "items": []
  }
]
```

## Valor de Negocio

El Centro de Alertas es una herramienta indispensable para el **Director de Operaciones** y los **Account Managers**. Transforma el seguimiento manual de cientos de contratos en un tablero de prioridades visual.

Las decisiones de negocio derivadas incluyen la asignación proactiva de ejecutivos para re-negociar acuerdos antes de que expiren, asegurando así que los ingresos no se vean interrumpidos por vencimientos pasados por alto.