---
title: Retención de Talento (Trabajadores)
description: Dashboard de métricas de antigüedad y retención de trabajadores.
---

El dashboard de **Retención de Talento Laboral** analiza la permanencia de los trabajadores mediante la acumulación de sus contratos firmados a lo largo del tiempo. 

Este módulo provee al área de Recursos Humanos una perspectiva clara sobre las dinámicas de contratación, renovación y fidelidad del personal interno a corto y largo plazo.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/retention/labor` |
| **Rol requerido** | HR |

### Lógica de Cálculo
- **Tasa de Retención Activa:** Trabajadores con >1 contrato / Total de trabajadores
- **Antigüedad:** Diferencia entre `first_contract_start` y `latest_contract_end`
- **Legacy Worker:** Trabajador con antigüedad superior a 2 años

### Respuesta del Endpoint (Ejemplo)
```json
{
  "kpis": {
    "active_retention_rate": 83.33,
    "total_unique_workers": 12,
    "avg_contracts_per_worker": 2.25
  },
  "tenure_distribution": [
    { "contracts_count": 1, "workers_count": 5 },
    { "contracts_count": 3, "workers_count": 2 }
  ],
  "renewal_trend": [
    { "month": "Dic 25", "renewal_rate": 80.0, "total_expired": 5, "total_renewed": 4 }
  ],
  "details": [
    {
      "worker_name": "Juan Pérez",
      "worker_document_number": "12345678",
      "contracts_count": 3,
      "first_contract_start": "2024-01-15",
      "latest_contract_end": "2026-06-30"
    }
  ]
}
```

## Métricas y KPIs Clave

El panel principal expone los siguientes indicadores de salud organizacional:

| KPI | Descripción |
|-----|-------------|
| **Tasa de Retención Activa** | Porcentaje del total de trabajadores vigentes que cuentan con un historial de 2 o más contratos. |
| **Total de Trabajadores Únicos** | Volumen neto de talento humano administrado en el periodo de análisis. |
| **Contratos Promedio** | Media de contratos generados por trabajador en la plataforma. |

## Tendencia de Renovación Mensual

Un gráfico evolutivo que permite contrastar la **tasa de renovación mensual** con el volumen neto de contratos que han expirado frente a aquellos que se han renovado de forma exitosa. Ayuda a Recursos Humanos a medir periodos de alta rotación (ej. fin de año o términos de temporada).

## Distribución de Permanencia y Antigüedad

Clasifica a la plantilla según la cantidad de contratos firmados. El sistema realiza además un cálculo dinámico de la antigüedad de la relación (comparando el primer inicio de labores con la fecha de término más reciente). 

Los trabajadores con una antigüedad mayor a 2 años reciben el distintivo de **"Legacy Worker"**, facilitando políticas de beneficios e incentivos al talento clave.

## Valor de Negocio

El análisis de retención provee certidumbre sobre el clima laboral y el impacto de los procesos de contratación. Permite a los directores de RRHH identificar rápidamente desviaciones en la tasa de renovación y enfocar sus esfuerzos en la retención del talento antes de que expire su relación contractual.