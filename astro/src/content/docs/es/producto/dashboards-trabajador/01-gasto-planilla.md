---
title: Gasto de Planilla
description: Gráfico de área para visualización del gasto laboral histórico y proyectado.
---

El dashboard de **Gasto de Planilla** proporciona una visión panorámica y evolutiva de los costos asociados a las contrataciones de talento humano.

Presentado a través de un gráfico de área interactivo, permite a la gerencia comparar los costos laborales recientes y estimar el impacto financiero de la planilla a corto plazo, facilitando la planificación presupuestaria de Recursos Humanos.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/area_chart/labor` |
| **Rol requerido** | HR |

### Parámetros de Consulta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `currency` | string | No | Filtra por moneda (PEN, USD, EUR). Si se omite, consolida todas bajo la etiqueta "ALL". |

### Lógica de Cálculo
- Filtra exclusivamente los contratos laborales vigentes o próximos a vencer que representen un costo económico.
- Agrupa los gastos según la permanencia mensual de cada recurso dentro del periodo del contrato.
- Devuelve **7 puntos de datos** temporales: 4 meses de historial consolidado, el mes actual y 2 meses futuros como proyección (`is_forecast: true`).

### Respuesta del Endpoint (Ejemplo)
```json
{
  "props": {
    "title": "Gasto de Planilla",
    "subtitle": "Costo histórico y reducción por fin de contratos",
    "y_axis": {
      "format": "currency",
      "labels": [5000, 10000, 15000]
    },
    "threshold_date": "2026-05-01T00:00:00",
    "series": [
      {
        "currency": "ALL",
        "name": "Gasto",
        "data": [
          { "x": "Ene", "y": 45000, "is_forecast": false },
          { "x": "Feb", "y": 48000, "is_forecast": false },
          { "x": "Jun", "y": 51000, "is_forecast": true },
          { "x": "Jul", "y": 53000, "is_forecast": true }
        ]
      }
    ]
  }
}
```

## Valor de Negocio

Este análisis es esencial para el **CFO** y el **Director de Recursos Humanos** al momento de validar la eficiencia del gasto de personal y auditar desviaciones.

Al proyectar el gasto base de la planilla para los próximos meses considerando los contratos que caducan, la gerencia puede evaluar anticipadamente su capacidad para realizar nuevas contrataciones, otorgar bonos de desempeño o aplicar recortes, manteniendo los costos dentro de los márgenes presupuestados.
