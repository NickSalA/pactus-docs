---
title: Ingresos Proyectados
description: Gráfico de área para visualización de ingresos históricos y proyectados de contratos empresariales.
---

El dashboard de **Ingresos Proyectados** proporciona una representación visual de la tendencia de ingresos generados por los contratos empresariales (B2B). 

A través de un gráfico de área interactivo, los directivos pueden evaluar el comportamiento histórico reciente y prever los ingresos garantizados a corto plazo, facilitando la planificación financiera y la gestión de flujo de caja.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/area_chart/company` |
| **Rol requerido** | MANAGER |

### Parámetros de Consulta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `currency` | string | No | Filtra por moneda (PEN, USD, EUR). Si se omite, consolida todas en "ALL". |

### Lógica de Cálculo
- Filtra exclusivamente contratos comerciales vigentes o próximos a vencer que tengan valor económico.
- Agrupa los montos según el cruce temporal de cada servicio con el mes calendario.
- Devuelve **7 puntos de datos** en total: 4 meses históricos, el mes actual y 2 meses futuros proyectados. Los meses futuros marcan una bandera de proyección (`is_forecast: true`).

### Respuesta del Endpoint (Ejemplo)
```json
{
  "props": {
    "title": "Ingresos Proyectados",
    "subtitle": "Histórico vs. contratos asegurados a futuro",
    "y_axis": {
      "format": "currency",
      "labels": [1000, 2000, 3000]
    },
    "threshold_date": "2026-05-01T00:00:00",
    "series": [
      {
        "currency": "ALL",
        "name": "Ingresos",
        "data": [
          { "x": "Ene", "y": 15000, "is_forecast": false },
          { "x": "Feb", "y": 18000, "is_forecast": false },
          { "x": "Jun", "y": 21000, "is_forecast": true },
          { "x": "Jul", "y": 22500, "is_forecast": true }
        ]
      }
    ]
  }
}
```

## Valor de Negocio

El análisis de esta tendencia histórica y futura (forecasting) brinda al **CFO** y al **Director de Finanzas** una visibilidad instantánea de la salud financiera de la empresa.
Al saber qué ingresos están asegurados para los próximos dos meses según los contratos vigentes, la directiva puede tomar decisiones informadas sobre la programación de pagos, planificación de gastos operativos y estrategias de inversión a corto plazo.
