---
title: Módulo de Dashboard
description: Endpoints del módulo de dashboard para gráficos de área, centro de alertas, contratos recientes y rankings.
---

El módulo de **Dashboard** expone métricas analíticas segmentadas por tipo documental: `company` (empresarial) y `labor` (laboral). Todos los endpoints usan `GET` y retornan JSON.

## Gráficos de Área

### Área empresarial

`GET /dashboard/area_chart/company`

Devuelve series históricas de ingresos proyectados para contratos empresariales.

```json
{
  "props": {
    "title": "Ingresos Proyectados",
    "subtitle": "Contratos empresariales",
    "y_axis": {
      "format": "currency",
      "labels": [0, 50000, 100000, 150000]
    },
    "threshold_date": "2026-05-01T00:00:00Z",
    "series": [
      {
        "currency": "USD",
        "name": "Ingresos",
        "data": [
          { "x": "2026-01", "y": 85000, "is_forecast": false },
          { "x": "2026-02", "y": 92000, "is_forecast": false },
          { "x": "2026-03", "y": 105000, "is_forecast": true }
        ]
      }
    ]
  }
}
```

### Área laboral

`GET /dashboard/area_chart/labor`

Mismo formato que el endpoint empresarial, pero para contratos laborales (gasto de planilla).

## Centro de Alertas

### Alertas empresariales

`GET /dashboard/alert_center/company`

```json
[
  {
    "label": "Vencidos",
    "color": { "accent": "#DC2626", "bg": "#FEE2E2" },
    "due_to": -3,
    "count": 2,
    "items": [
      { "id": 12, "name": "Servicios de Limpieza", "detail": "Proveedor XYZ", "status": "expired" }
    ]
  },
  {
    "label": "Por vencer (7 días)",
    "color": { "accent": "#D97706", "bg": "#FEF3C7" },
    "due_to": 7,
    "count": 4,
    "items": [...]
  }
]
```

### Alertas laborales

`GET /dashboard/alert_center/labor`

Mismo formato, segmentado para contratos laborales.

## Contratos Recientes

### Recientes empresariales

`GET /dashboard/recent_contracts/company`

```json
[
  {
    "id": 33,
    "title": "Contrato Marco 2026",
    "services": ["Administración Integral", "Soporte Técnico"],
    "name": "Acme Corp",
    "dates": "01/01/2026 - 31/12/2026"
  }
]
```

### Recientes laborales

`GET /dashboard/recent_contracts/labor`

Mismo formato para contratos laborales.

## Rankings

### Top empresas contraparte

`GET /dashboard/top_companies`

```json
[
  { "name": "Acme Corp", "contracts": 12, "amount": 150000.00 },
  { "name": "Globex Inc", "contracts": 8, "amount": 95000.00 }
]
```

Ordena por volumen de contratos por defecto. Soporta ordenamiento por `volume` o `value`.

### Top servicios más contratados

`GET /dashboard/top_services`

```json
[
  { "name": "Administración Integral", "quantity": 24, "amount": 320000.00 },
  { "name": "Soporte Técnico", "quantity": 18, "amount": 180000.00 }
]
```

## Estructura Común de Respuesta

### AreaChartResponse

```
props.title       — título del gráfico
props.subtitle    — subtítulo contextual
props.y_axis      — configuración del eje Y (formato de moneda + labels)
props.threshold_date — fecha de corte entre datos reales y forecast
props.series[]    — array de series, cada una con moneda, nombre y puntos {x, y, is_forecast}
```

### AlertCategory

```
label     — nombre de la categoría ("Vencidos", "Por vencer (7 días)")
color     — {accent, bg} para renderizado visual
due_to    — días restantes (negativo indica vencimiento)
count     — número total de elementos
items[]   — hasta N elementos de previsualización con id, name, detail, status
```

## Segmentación por Tipo

| Tipo | Contexto | Ejemplo de uso |
|------|----------|----------------|
| `company` | Contratos empresariales B2B | Ingresos, alertas empresariales |
| `labor` | Contratos laborales | Gasto de planilla, alertas laborales |

Todos los endpoints de dashboard requieren autenticación JWT normal.