---
title: Gasto de Planilla
description: Gráfico de líneas con proyección de reducción de gasto laboral por finalización de contratos de trabajadores.
---

El dashboard de **Gasto de Planilla** proporciona a los altos cargos una visión del gasto total en personal, incluyendo proyecciones futuras basadas en contratos próximos a finalizar. Es esencial para la planificación presupuestaria y la gestión de costos laborales.

## Resumen Ejecutivo

Este dashboard presenta el gasto mensual de planilla de contratos laborales (`LABOR`), con tendencia histórica y proyecciones de reducción basadas en contratos con fecha de fin próxima. Permite anticipar ahorros y planificar replacements.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Gasto Mensual Actual** | Total de remuneraciones de contratos laborales activos | SUM(service_items.value) WHERE type=LABOR AND state=ACTIVE |
| **Gasto Proyectado** | Gasto estimado en meses futuros considerando renovaciones y finales | SUM(service_items.value) con ajustes por renovación_proyectada |
| **Reducción Esperada** | Ahorro proyectado por contratos que finalizarán | SUM(service_items.value of contracts where end_date in projection window) |
| **Tendencia de Gasto** | Variación porcentual mensual del gasto | (Gasto mes N / Gasto mes N-1) - 1 |
| **Costo por Colaborador** | Gasto promedio por contrato laboral activo | SUM(valor) / COUNT(contracts) WHERE state=ACTIVE |
| **Proporción vs. Ingresos** | Porcentaje de gasto de planilla sobre ingresos B2B | (Gasto Planilla / Ingresos COMPANY) × 100 |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (LABOR), state, start_date, end_date |
| `ServiceItem` | value, currency, start_date, end_date |
| `Organization` | org_id para contexto |

### Filtros Aplicados

- `type = LABOR` (excluye contratos empresariales)
- `state IN (ACTIVE, EXPIRING)` (solo contratos vigentes)
- `service_items.value > 0` (solo items con valor económico)

### Lógica de Proyección de Reducción

La proyección de reducción de gasto considera los contratos que finalizarán en el horizonte de proyección:

| Parámetro | Valor |
|-----------|-------|
| **Horizonte de Proyección** | 6 meses |
| **Contratos a Finalizar** | Aquellos con `end_date` entre hoy y los próximos 6 meses |
| **Tasa de Renovación** | Porcentaje histórico de renovaciones (por defecto 70%) |
| **Reducción Neta** | Contratos que finalizan × (1 - tasa_renovación) × valor |

**Fórmula**:
```
Gasto_proyectado_mes_M = SUM(valor_contratos_vigentes_mes_M) - SUM(ahorro_por_finalizaciones_mes_M)
```

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Diario a las 6:00 AM |
| **Latencia de Datos** | Hasta 24 horas desde última modificación |
| **Cálculo de Proyección** | Recálculo mensual con revisión de contratos próximos a vencer |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Eje X** | Meses (formato YYYY-MM), con historial de 12 meses + proyección de 6 meses |
| **Eje Y** | Valor en soles (PEN) con escala automática |
| **Línea Sólida** | Gasto real histórico (color azul) |
| **Línea Punteada** | Gasto proyectado (color naranja) |
| **Área Sombreada** | Zona de reducción esperada (verde claro) |
| **Línea de Referencia** | Meta de gasto presupuestado |

### Visualización del Gráfico

```
Miles S/.
   │
200 │      ████████
   │     ╱        ╲
150 │    ╱   ████████  --- línea proyectada
   │   ╱   ╱
100 │  █████
   │ ╱
 50 │/
   └─────────────────────────────────────
      E   F   M   A   M   J   J   A   S
      │   │   │   │   │   │   │   │   │
      └──histórico──┘   └────proyección─┘
           ████ réel         --- punté reduct°
```

### Interactividad

| Interación | Comportamiento |
|-------------|----------------|
| **Hover sobre punto** | Muestra tooltip con gasto exacto, variación y detalle de composición |
| **Click en mes proyectado** | Muestra detalle de qué contratos finalizan ese mes |
| **Zoom temporal** | Arrastrar para seleccionar rango, doble click para resetear |
| **Cambio de moneda** | Selector PEN/USD/EUR con conversión en tiempo real |
| **Comparar presupuestos** | Superponer línea de presupuesto vs. real |
| **Exportar** | Descargar datos como CSV |

### Casos de Uso

1. **Planificación de presupuesto**: El CFO proyecta el gasto de planilla para el siguiente trimestre.
2. **Decisión de contrataciones**: Evaluar si hay espacio presupuestario para nuevas contrataciones.
3. **Gestión de reemplazos**: Identificar cuándo se liberará presupuesto por finalizaciones.
4. **Reporte a dirección**: Presentar estructura de costos laborales.
5. **Negociación salarial**: Contexto de costos totales para negociaciones colectivas.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CFO** | Planificación de gastos de personal y presupuesto |
| **Director de RRHH** | Visibilidad del costo laboral y decisiones de gestión de trabajadores |
| **CEO** | Comprehensión de estructura de costos y rentabilidad |
| **Gerente de Finanzas** | Control de gastos y seguimiento de presupuesto |

### Decisiones Associadas

- Aprobación de nuevas contrataciones
- Ajustes de presupuesto departamental
- Planificación de incrementos salariales
- Decisiones de tercerización vs. planilla
- Gestión de redundancias o restructuraciones

### Impacto Estratégico

El gasto de planilla es típicamente **el mayor costo operativo** de la organización:

| Métrica | Importancia |
|---------|-------------|
| **Porcentaje de ingresos** | Typically 40-60% en empresas de servicios |
| **Impacto en rentabilidad** | Cada 5% de variación cambia significativamente el EBITDA |
| **Proyección de reducción** | Permite planificar uso de ahorros |

Este dashboard permite:

- **Anticipar necesidades presupuestarias** con precisión
- **Identificar oportunidades de ahorro** antes de que ocurran
- **Tomar decisiones de contratación** con información completa
- **Controlar el gasto** vs. presupuesto establecido
- **Planificar replacements** con conocimiento del timing

La línea de reducción proyectada es particularmente valiosa para anticipar cuándo se liberará presupuesto por contratos que finalizan naturalmente.