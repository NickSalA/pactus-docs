---
title: Fidelidad (Retención)
description: Métrica de permanencia de empresas clientes en meses, con distribución de cohorts y tendencia de retención.
---

El dashboard de **Fidelidad (Retención)** mide la permanencia de los clientes empresariales en el tiempo, proporcionando una visión de la salud de la relación con los clientes y la efectividad de las estrategias de retención.

## Resumen Ejecutivo

Este dashboard presenta métricas de retención de clientes B2B, incluyendo la permanencia media, la distribución de cohorts por antigüedad, y la tendencia histórica de retención. Es fundamental para evaluar el éxito del modelo de negocio y la satisfacción del cliente.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Permanencia Media (Meses)** | Promedio de meses que los clientes llevan activos | AVG(DATEDIFF(NOW(), MIN(start_date)) GROUP BY client |
| **Tasa de Retención (%)** | Porcentaje de clientes que renovaron al menos una vez | (Clientes con más de un contrato / Total clientes) × 100 |
| **Distribución de Cohorts** | Distribución de clientes por rango de antigüedad | COUNT GROUP BY rango_meses (0-6, 7-12, 13-24, 25-36, 37+) |
| **Clientes en Riesgo** | Clientes con más de 12 meses sin nuevo contrato | COUNT where DATEDIFF(NOW(), MAX(end_date)) > 365 |
| **Churn Rate (%)** | Porcentaje de clientes perdidos en el período | (Clientes con último contrato vencido hace >90 días / Total clientes históricos) × 100 |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (COMPANY), start_date, end_date, state |
| `Organization` | org_id para contexto |

### Lógica de Cálculo

| Métrica | Metodología |
|---------|-------------|
| **Permanencia por Cliente** | Calculada desde la fecha del primer contrato hasta la fecha actual o último contrato |
| **Cohort de Antigüedad** | Agrupación en rangos: 0-6 meses, 7-12 meses, 13-24 meses, 25-36 meses, 37+ meses |
| **Detección de Churn** | Cliente sin contrato activo y cuyo último contrato terminó hace más de 90 días |
| **Retención Múltiple** | Cliente con 2 o más contratos renovados se considera "retenido" |

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Diario a las 6:00 AM |
| **Período de Análisis** | Datos completos desde el inicio, tendencias últimos 12 meses |
| **Cálculo de Churn** | Mensual con ventana móvil de 12 meses |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **KPI Principal** | Tarjeta grande con permanencia media en meses |
| **Gráfico de Distribución** | Histograma o barras horizontales por cohort de antigüedad |
| **Línea de Tendencia** | Evolución de la tasa de retención en los últimos 12 meses |
| **Tabla de Detalle** | Lista de clientes con su permanencia y estado |
| **Heatmap de Riesgo** | Matriz color-coded de clientes por antigüedad y valor |

### Visualización de Distribución

```
Permanencia por Cohort:
0-6 meses    ████████████  35%
7-12 meses   ████████     25%
13-24 meses  ██████       18%
25-36 meses  ████          12%
37+ meses    ████          10%
```

### Interactividad

| Interacción | Comportamiento |
|-------------|----------------|
| **Hover sobre cohort** | Muestra tooltip con cantidad de clientes y valor total |
| **Click en cohort** | Filtra la tabla de clientes a ese rango de permanencia |
| **Click en cliente** | Muestra historial completo de contratos del cliente |
| **Filtro de riesgo** | Selector para ver solo clientes en riesgo de churn |
| **Ordenar por valor** | Ver clientes con mayor facturación primero |

### Casos de Uso

1. **Reporte de salud de clientes**: El CEO revisa la distribución de permanencia para evaluar el negocio.
2. **Identificación de churn**: Detectar clientes con tendencia a no renovar.
3. **Programa de fidelización**: Clientes con 24+ meses reciben beneficios especiales.
4. **Plan de recuperación**: Clientes en riesgo reciben llamadas proactivas del equipo de account management.
5. **Análisis de rentabilidad**: Clientes con mayor permanencia tienen menor costo de adquisición.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CEO** | Salud general del negocio y retención de clientes |
| **Director de Customer Success** | Identificar clientes en riesgo y coordinar recuperación |
| **CFO** | Valor de vida del cliente (LTV) y costo de adquisición |
| **Gerente de Ventas** | Evaluar efectividad de retención vs. nueva adquisición |

### Decisiones Associadas

- Inversión en programa de fidelización
- Asignación de recursos para retención
- Políticas de descuentos por antigüedad
- Estrategias de recuperación de clientes en riesgo
- Metas de retención para equipos

### Impacto Estratégico

La retención de clientes es **más económica que la adquisición**:

| Métrica | Impacto |
|---------|---------|
| **Costo de Adquisición** | 5-7× mayor que costo de retención |
| **Valor de Vida (LTV)** | Clientes de 37+ meses generan 3× más valor |
| **Referencias** | Clientes satisfechos Referencian nuevos clientes |

Este dashboard permite:

- **Medir la salud del negocio** a través de la retención
- **Identificar patrones** de permanencia exitosa
- **Detectar problemas** antes de que se materialicen en churn
- **Justificar inversiones** en programas de fidelización

La distribución de cohorts es particularmente útil para entender la madurez de la cartera de clientes y proyectar ingresos futuros.