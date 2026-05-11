---
title: Ingresos Proyectados
description: Gráfico de área para visualización de ingresos históricos y proyectados de contratos empresariales.
---

El dashboard de **Ingresos Proyectados** permite visualizar la tendencia de ingresos por contratos empresariales mediante un gráfico de área.

## Resumen Ejecutivo

Este dashboard muestra los ingresos generados por contratos de tipo `COMPANY` (empresariales). Es fundamental para la planificación financiera básica.

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
| `currency` | string | No | Filtra por moneda (PEN, USD, EUR). Si no se envía, devuelve "ALL" |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (COMPANY), state, start_date, end_date |
| `ServiceItem` | service_id, value, currency, start_date, end_date |

### Filtros Aplicados

- `type = COMPANY` (excluye contratos laborales)
- `state IN (ACTIVE, EXPIRING_SOON)` (solo contratos vigentes o próximos a vencer)
- `service_items.value > 0` (excluye items sin valor económico)

### Lógica de Cálculo

1. Agrupa los montos de servicios por mes según el solapamiento de `start_date` y `end_date` de cada service item con el mes
2. Devuelve **7 puntos de datos**:
   - 4 meses históricos
   - Mes actual
   - 2 meses futuros
3. Los meses futuros tienen `is_forecast = true`
4. Si no se envía el parámetro `currency`, devuelve `currency = "ALL"` y suma los valores sin conversión

### Respuesta del Endpoint

```json
{
  "props": {
    "title": "Ingresos Proyectados",
    "subtitle": "Historico vs. contratos asegurados a futuro",
    "y_axis": {
      "format": "currency",
      "labels": [1000, 2000, 3000, ...]
    },
    "threshold_date": "2026-05-01T00:00:00",
    "series": [
      {
        "currency": "ALL",
        "name": "Ingresos",
        "data": [
          { "x": "Ene", "y": 15000, "is_forecast": false },
          { "x": "Feb", "y": 18000, "is_forecast": false },
          { "x": "Mar", "y": 16500, "is_forecast": false },
          { "x": "Abr", "y": 20000, "is_forecast": false },
          { "x": "May", "y": 19000, "is_forecast": false },
          { "x": "Jun", "y": 21000, "is_forecast": true },
          { "x": "Jul", "y": 22500, "is_forecast": true }
        ]
      }
    ]
  }
}
```

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Latencia de Datos** | Tiempo real (consulta directa a BD) |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Eje X** | Meses en formato corto (Ene, Feb, Mar, etc.), 7 puntos |
| **Eje Y** | Valor en la moneda seleccionada |
| **Línea Sólida** | Datos históricos (mes actual y anteriores) |
| **Línea Punteada** | Datos proyectados (meses futuros) |

### Interactividad

| Interacción | Descripción |
|-------------|-------------|
| **Filtro por moneda** | Parámetro opcional `currency` para filtrar por PEN, USD o EUR |
| **Tooltip** | Muestra valor exacto del punto |

### Funcionalidades NO Implementadas

- Promedio móvil ponderado
- Horizonte de 12 meses (solo 2 meses proyectados)
- 24 meses históricos (solo 4 meses)
- Banda de confianza ±15%
- Estacionalidad
- Tasa de renovación histórica
- Conversión en tiempo real de monedas
- Exportar CSV
- Zoom temporal
- Click para filtrar tabla de contratos

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CFO** | Visualización básica de ingresos |
| **Director de Finanzas** | Análisis de tendencia |
| **CEO** | Visibilidad de salud financiera |

### Decisiones Asociadas

- Programación de pagos
- Planificación de gastos operativos
- Evaluación de ingresos por cliente

### Limitaciones

Este dashboard **no incluye**:
- Proyecciones avanzadas con algoritmos de aprendizaje automático
- Bandas de confianza
- Comparación inter-anual
- Detección de estacionalidad
- Forecasting de más de 2 meses

> **Nota de alcance**: Esta documentación describe el estado actual del backend. El módulo dashboard expone endpoints agregados de lectura, no implementa aún exportación, drill-down, filtros avanzados, conversiones de moneda, cohortes, retención, churn ni tendencias históricas avanzadas.