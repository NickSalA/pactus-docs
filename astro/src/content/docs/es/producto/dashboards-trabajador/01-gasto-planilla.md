---
title: Gasto de Planilla
description: Gráfico de área para visualización del gasto laboral histórico y proyectado.
---

El dashboard de **Gasto de Planilla** proporciona una visión del gasto total en contratos laborales mediante un gráfico de área.

## Resumen Ejecutivo

Este dashboard muestra el gasto mensual de contratos laborales (`LABOR`). Es esencial para la planificación presupuestaria básica.

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
| `currency` | string | No | Filtra por moneda (PEN, USD, EUR). Si no se envía, devuelve "ALL" |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (LABOR), state, start_date, end_date |
| `ServiceItem` | value, currency, start_date, end_date |

### Filtros Aplicados

- `type = LABOR` (excluye contratos empresariales)
- `state IN (ACTIVE, EXPIRING_SOON)` (solo contratos vigentes o próximos a vencer)
- `name IS NOT NULL`
- `client IS NOT NULL`
- `service_items.value > 0` (solo items con valor económico)

### Lógica de Cálculo

1. Suma los valores de servicios vigentes por mes
2. Devuelve **7 puntos de datos**:
   - 4 meses históricos
   - Mes actual
   - 2 meses futuros
3. Los meses futuros tienen `is_forecast = true`
4. **El backend no calcula reducción neta ni renovación proyectada**; solo suma servicios vigentes por mes

### Respuesta del Endpoint

```json
{
  "props": {
    "title": "Gasto de Planilla",
    "subtitle": "Costo historico y reduccion por fin de contratos",
    "y_axis": {
      "format": "currency",
      "labels": [5000, 10000, 15000, ...]
    },
    "threshold_date": "2026-05-01T00:00:00",
    "series": [
      {
        "currency": "ALL",
        "name": "Gasto",
        "data": [
          { "x": "Ene", "y": 45000, "is_forecast": false },
          { "x": "Feb", "y": 48000, "is_forecast": false },
          { "x": "Mar", "y": 46000, "is_forecast": false },
          { "x": "Abr", "y": 50000, "is_forecast": false },
          { "x": "May", "y": 52000, "is_forecast": false },
          { "x": "Jun", "y": 51000, "is_forecast": true },
          { "x": "Jul", "y": 53000, "is_forecast": true }
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

- Horizonte de 6 meses (solo 2 meses proyectados)
- Lógica de reducción esperada
- Tasa de renovación 70%
- Comparación contra ingresos B2B
- Presupuesto vs. real
- Conversión en tiempo real de monedas
- Área sombreada de reducción esperada
- Exportar CSV
- Zoom temporal

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CFO** | Visualización básica de gasto de planilla |
| **Director de RRHH** | Gestión de costos laborales |
| **Gerente de Finanzas** | Control de gastos |

### Decisiones Asociadas

- Planificación de presupuesto de personal
- Evaluación de capacidad de nuevas contrataciones
- Control de gasto operativo

### Limitaciones

Este dashboard **no incluye**:
- Proyecciones de reducción por contratos que finalizan
- Comparación con presupuesto
- Análisis de proporción vs. ingresos
- Detección de tendencias de renovación
- Forecasting avanzado

> **Nota de alcance**: Esta documentación describe el estado actual del backend. El módulo dashboard expone endpoints agregados de lectura, no implementa aún exportación, drill-down, filtros avanzados, conversiones de moneda, cohortes, retención, churn ni tendencias históricas avanzadas.
