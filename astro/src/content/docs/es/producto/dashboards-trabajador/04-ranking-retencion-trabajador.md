---
title: Ranking de Retención (Trabajadores)
description: Métrica de antigüedad del capital intelectual, ranking de trabajadores por permanencia.
---

El dashboard de **Ranking de Retención (Trabajadores)** presenta un ranking de los trabajadores por su antigüedad en la organización, permitiendo identificar y reconocer al capital intelectual más experimentado.

## Resumen Ejecutivo

Este dashboard muestra la permanencia de los trabajadores activos, ordenados por tiempo de antigüedad. Es fundamental para la gestión del conocimiento organizacional, la identificación de líderes naturales y la evaluación de las políticas de retención.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Antigüedad Promedio** | Permanencia media de todos los trabajadores activos | AVG(DATEDIFF(NOW(), MIN(start_date)) GROUP BY client |
| **Ranking por Antigüedad** | Posición del trabajador según permanencia | RANK() ORDER BY DATEDIFF(NOW(), MIN(start_date)) DESC |
| **Antigüedad por Colaborador** | Meses desde el primer contrato del trabajador | DATEDIFF(NOW(), MIN(start_date)) |
| **Tasa de Retención** | Porcentaje de trabajadores con más de un contrato | (Trabajadores con renovación / Total trabajadores) × 100 |
| **Colab. > 2 Años** | Cantidad de trabajadores con antigüedad mayor a 24 meses | COUNT WHERE Antigüedad > 24 meses |
| **Riesgo de Conocimiento** | Trabajadores clave con >36 meses sin promoción | COUNT WHERE Antigüedad > 36 AND no cambio de cargo |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (LABOR), state, start_date, end_date |
| `Organization` | org_id para contexto |

### Lógica de Cálculo

| Métrica | Metodología |
|---------|-------------|
| **Antigüedad por trabajador** | Calculada desde la fecha del primer contrato hasta la fecha actual |
| **Múltiples contratos** | Si un trabajador tiene varios contratos, se considera la fecha del primer contrato |
| **Contratos activos** | Solo se incluyen trabajadores con al menos un contrato en estado ACTIVE o EXPIRING |
| **Ranking** | Ordenamiento decreciente por antigüedad en meses |

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Diario a las 6:00 AM |
| **Período de Análisis** | Datos completos desde inicio de operaciones |
| **Actualización de ranking** | Tiempo real cuando hay nuevos contratos |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Tabla de Ranking** | Lista ordenada con posición, trabajador, antigüedad, modalidad |
| **Medalla para Top 10** | Badge especial para los 10 más antiguos |
| **Barras Horizontales** | Representación visual de la magnitud relativa por antigüedad |
| **Distribución por Cohort** | Gráfico de barras de distribución por rango de antigüedad |
| **Badge de Riesgo** | Indicador para trabajadores con riesgo de salida |

### Visualización del Ranking

```
#  Colaborador         Antigüedad    Modalidad      Riesgo
─────────────────────────────────────────────────────────
1  ██████████████████ Roberto C.    48 meses        Alto ⚠
2  ████████████████   María L.       42 meses        -
3  ███████████████    Ana G.         36 meses        -
4  ██████████████    Carlos M.       30 meses        -
5  ████████████      Juan P.        24 meses        -
...
```

### Distribución por Cohort

```
Antigüedad por Rango:
0-6 meses    ████████████  30%
7-12 meses   ██████████    25%
13-24 meses  ████████      20%
25-36 meses  ██████        15%
37+ meses    ████          10%
```

### Interactividad

| Interacción | Comportamiento |
|-------------|----------------|
| **Click en trabajador** | Muestra historial completo de contratos |
| **Hover sobre fila** | Muestra tooltip con métricas adicionales |
| **Ordenar por columna** | Click en header para reordenar por cualquier métrica |
| **Filtro por rango** | Ver solo trabajadores de cierto rango de antigüedad |
| **Buscar trabajador** | Filtrar por nombre |
| **Exportar** | Descargar ranking como CSV |

### Funcionalidades Adicionales

| Función | Descripción |
|---------|-------------|
| **Filtrar por modalidad** | Ver solo tiempo completo, servicios, etc. |
| **Vertimeline de retención** | Evolución de la retención en los últimos 12 meses |
| **Comparar con mercado** | Benchmark de retención (si hay datos disponibles) |
| **Notificaciones de anniversario** | Alerta cuando un trabajador cumple años en la empresa |

### Casos de Uso

1. **Reconocimiento de antigüedad**: Identificar trabajadores para programas de reconocimiento.
2. **Plan de sucesión**: Los más antiguos son candidatos naturales para liderazgo.
3. **Gestión del conocimiento**: Trabajadores con 36+ meses tienen conocimiento crítico.
4. **Análisis de rotación**: Comparar antigüedad de quienes se van vs. quienes se quedan.
5. **Decisiones de compensación**: La antigüedad puede factorar en revisiones salariales.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CEO** | Preservación del capital intelectual y liderazgo |
| **Director de RRHH** | Políticas de retención y gestión del conocimiento |
| **Gerente de RRHH** | Programas de reconocimiento y desarrollo |
| **Gerente de Legal** | Historial de trabajadores para compliance |

### Decisiones Associadas

- Programas de reconocimiento por antigüedad
- Plan de desarrollo y promoción
- Estrategias de retención de trabajadores senior
- Transferencia de conocimiento
- Revisión de compensación por experiencia

### Impacto Estratégico

La retención de trabajadores senior es **crítica para la sostenibilidad**:

| Métrica | Impacto |
|---------|---------|
| **Conocimiento tácito** | Solo se desarrolla con años de experiencia |
| **Costo de rotación** | Los trabajadores senior tienen mayor costo de reemplazo |
| **Liderazgo** | Los más antiguos suelen ser líderes naturales |

Este dashboard permite:

- **Identificar capital intelectual** más experimentado
- **Preservar conocimiento** crítico de la organización
- **Reconocer antigüedad** con programas adecuados
- **Planificar sucesión** basándose en antigüedad y potencial
- **Reducir rotación** de trabajadores senior

La distinción por modalidad permite además entender la distribución de conocimiento entre diferentes tipos de relación laboral.

## Diferencias con Fidelidad B2B

| Aspecto | Fidelidad (Empresas) | Retención (Trabajadores) |
|---------|----------------------|---------------------|
| **Entidad** | Clientes empresariales | Trabajadores individuales |
| **Métrica principal** | Permanencia del cliente | Antigüedad del trabajador |
| **Riesgo** | Pérdida de ingresos | Pérdida de conocimiento |
| **Acciones** | Renovación comercial | Programas de retención |