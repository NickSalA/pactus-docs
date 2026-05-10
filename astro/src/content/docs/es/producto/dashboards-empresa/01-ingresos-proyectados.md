---
title: Ingresos Proyectados
description: Gráfico de líneas con histórico de ingresos reales vs. proyección futura para previsión de flujo de caja.
---

El dashboard de **Ingresos Proyectados** permite a los altos cargos visualizar la tendencia histórica de ingresos por contratos empresariales y anticipar el flujo de caja futuro mediante proyecciones automáticas.

## Resumen Ejecutivo

Este dashboard consolida los ingresos generados por contratos de tipo `COMPANY` (empresariales), mostrando el comportamiento pasado y las proyecciones futuras. Es fundamental para la planificación financiera y la toma de decisiones sobre inversiones, gastos y crecimiento.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Ingresos Reales** | Ingresos efectivamente facturados hasta la fecha actual | SUM(service_items.value) donde type=COMPANY y state=ACTIVE |
| **Ingresos Proyectados** | Ingresos esperados en períodos futuros basados en contratos vigentes | SUM(service_items.value) donde end_date > fecha actual |
| **Tendencia** | Variación porcentual entre períodos consecutivos | (Ingresos período N / Ingresos período N-1) - 1 |
| **Ingreso Mensual Promedio** | Media de ingresos mensuales en el período histórico | SUM(Ingresos Reales) / número de meses |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (COMPANY), state, start_date, end_date |
| `ServiceItem` | service_id, value, currency, start_date, end_date |
| `Organization` | org_id para filtrar por contexto |

### Filtros Aplicados

- `type = COMPANY` (excluye contratos laborales)
- `state IN (ACTIVE, EXPIRING)` (solo contratos vigentes o próximos a vencer)
- `service_items.value > 0` (excluye items sin valor económico)

### Lógica de Proyecciones (Líneas Punteadas)

La proyección utiliza un algoritmo de **promedio móvil ponderado** con los siguientes parámetros:

| Parámetro | Valor |
|-----------|-------|
| **Horizonte de Proyección** | 12 meses desde la fecha actual |
| **Ponderación de Datos Históricos** | Meses más recientes tienen mayor peso (decaimiento exponencial) |
| **Factores Considerados** | Tasa de renovación histórica, estacionalidad detectada, contratos próximos a vencer |
| **Línea de Proyección** | Representada con estilo punteado para distinguibilidad visual |
| **Banda de Confianza** | ±15% sombreado alrededor de la línea de proyección |

**Fórmula simplificada**:
```
Proyección mes M = Σ(Ingresos_mes_i × peso_i) / Σ(pesos_i)
```
donde `peso_i = e^(-0.1 × distancia_en_meses)`

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Cada 6 horas |
| **Latencia de Datos** | Hasta 2 horas desde la última transacción |
| **Cálculo de Proyección** | Recálculo diario a medianoche |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Eje X** | Meses (formato YYYY-MM), con historial de 24 meses + proyección de 12 meses |
| **Eje Y** | Valor en soles (PEN) con escala automática |
| **Línea Sólida** | Ingresos reales históricos (color azul) |
| **Línea Punteada** | Ingresos proyectados (color naranja) |
| **Banda Sombreada** | Margen de incertidumbre de la proyección |
| **Tooltip** | Muestra valor exacto, período y variación vs. período anterior |

### Interactividad

| Interacción | Comportamiento |
|-------------|----------------|
| **Hover sobre punto** | Muestra tooltip con valor exacto, fecha y variación porcentual |
| **Click en período** | Filtra la tabla de contratos subyacente por ese mes |
| **Zoom temporal** | Arrastrar para seleccionar rango de fechas, doble click para resetear |
| **Cambio de moneda** | Selector para cambiar entre PEN, USD, EUR con conversión en tiempo real |
| **Exportar** | Botón para descargar datos como CSV |

### Casos de Uso

1. **Planificación de flujo de caja**: Visualizar cuándo se esperan los mayores ingresos para programar pagos o inversiones.
2. **Detección de deuda técnica**: Identificar períodos con caída de ingresos que requieren acción comercial.
3. **Negociación con inversores**: Presentar proyección realista de ingresos futuros.
4. **Presupuesto departamental**: Establecer metas de ingresos basadas en tendencia histórica.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CFO** | Proyección de flujo de caja para planificación financiera |
| **Director de Finanzas** | Análisis de tendencia de ingresos y facturación |
| **CEO** | Visibilidad de salud financiera y crecimiento |
| **Gerente de Ventas** | Evaluación de efectividad de cierre de contratos |

### Decisiones Asociadas

- Programación de inversiones de capital
- Ajuste de presupuestos departamentales
- Definición de metas de ventas trimestrales
- Negociación de líneas de crédito
- Planificación de contrataciones

### Impacto Estratégico

Este dashboard es **crítico** para la toma de decisiones financieras de alto nivel. Permite:

- **Anticipar problemas de liquidez** antes de que ocurran
- **Identificar oportunidades** de crecimiento basado en tendencias
- **Justificar inversiones** con datos proyectados
- **Establecer Accountability** con metas basadas en datos concretos

La línea punteada de proyección proporciona una visión forward-looking que diferencia este dashboard de reportes financieros tradicionales que solo muestran datos históricos.