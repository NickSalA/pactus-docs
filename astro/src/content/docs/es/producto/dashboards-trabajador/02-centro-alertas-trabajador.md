---
title: Centro de Alertas (Trabajadores)
description: Sistema de alertas de vencimiento de contratos de trabajadores a 30 y 60 días.
---

El **Centro de Alertas (Trabajadores)** es un dashboard de gestión de riesgos laborales que permite a los altos cargos identificar y actuar proactivamente sobre contratos laborales que requieren renovación o finalización.

## Resumen Ejecutivo

Este dashboard presenta un sistema de semáforo para contratos de tipo `LABOR`, clasificándolos según su proximidad al vencimiento. Al igual que el Centro de Alertas de Empresas, permite drill-down para ver el detalle de cada contrato y gestionar la renovación oportuna de los trabajadores.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Alertas Críticas (Rojo)** | Trabajadores con contrato por vencer en 30 días | COUNT where DATEDIFF(end_date, NOW()) <= 30 AND state=ACTIVE |
| **Alertas Tempranas (Amarillo)** | Trabajadores con contrato entre 31 y 60 días | COUNT where DATEDIFF(end_date, NOW()) BETWEEN 31 AND 60 |
| **Total de Alertas** | Suma de todas las alertas activas | SUM(rojo + amarillo) |
| **Costo en Riesgo** | Remuneraciones de contratos en alerta | SUM(service_items.value) WHERE contratos en alerta |
| **Alertas del Mes** | Contratos que vencen en el mes actual | COUNT WHERE MONTH(end_date) = MONTH(NOW()) |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (LABOR), state, start_date, end_date, name |
| `ServiceItem` | value, currency |
| `Organization` | org_id para contexto |

### Lógica de Clasificación

| Color | Condición | Acción Recomendada |
|-------|-----------|-------------------|
| **Rojo** | `end_date` en los próximos 30 días | Entrevista de renovación inmediata |
| **Amarillo** | `end_date` entre 31 y 60 días | Iniciar proceso de evaluación de desempeño |
| **Verde** | Ninguna alerta | Estado normal |

### Diferencias con Alertas B2B

| Aspecto | Empresas | Trabajadores |
|---------|----------|---------|
| **Entidad** | client (empresa) | client (trabajador) |
| **Impacto** | Pérdida de cliente | Pérdida de trabajador |
| **Métrica de riesgo** | Valor en riesgo | Costo de reemplazo |

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Cada hora |
| **Latencia de Datos** | Tiempo real |
| **Notificaciones** | Email diario resumen de alertas del día |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Tarjetas de Semáforo** | 2 tarjetas (Rojo, Amarillo) con conteo y costo en riesgo |
| **Lista de Trabajadores** | Tabla filtrable por color de alerta |
| **Barra de Progreso** | Porcentaje de contratos en cada estado |
| **Costo en Riescho** | Valor total de remuneraciones en alerta |
| **Distribución por Modalidad** | Gráfico circular de modalidades en alerta |

### Interactividad: Drill-Down

| Nivel | Acción |
|-------|--------|
| **Nivel 1 (Semáforo)** | Click en tarjeta → filtra lista a alertas de ese color |
| **Nivel 2 (Tabla)** | Click en fila → abre modal con datos del contrato |
| **Nivel 3 (Modal)** | Ver completo del contrato, historial, documentos y acciones |

**Flujo de Drill-Down**:
```
Dashboard → [Click en tarjeta Roja] → Lista de trabajadores en rojo → [Click en trabajador] → Modal de detalle
```

### Funcionalidades Adicionales

| Función | Descripción |
|---------|-------------|
| **Filtro por modalidad** | Ver alertas de tiempo completo, medio tiempo, servicios |
| **Ordenar por costo** | Priorizar trabajadores de mayor remuneración |
| **Acciones rápidas** | Crear renovación, agendar evaluación, enviar notificación |
| **Exportar** | Descargar CSV de alertas |
| **Ver calendario** | Vista de alertas por fecha específica |

### Casos de Uso

1. **Revisión semanal de RRHH**: El Gerente de RRHH revisa alertas cada lunes.
2. **Planificación de reemplazos**: Identificar qué posiciones necesitan contratación.
3. **Evaluación de desempeño**: Coordinar evaluaciones de trabajadores próximos a vencer.
4. **Presupuesto de reemplazos**: Estimar costo de nuevas contrataciones.
5. **Compliance**: Asegurar que todos los contratos estén vigentes o renovados.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Gerente de RRHH** | Gestión de trabajadores y prevención de vacíos |
| **Director de RRHH** | Visibilidad de riesgos laborales y planificación |
| **Gerente Legal** | Asegurar vigencia de contratos laborales |
| **CFO** | Costos de reemplazo y planificación presupuestaria |

### Decisiones Associadas

- Aprobación de renovaciones de contrato
- Decisiones de conversión a planilla fija
- Planificación de nuevas contrataciones
- Asignación de presupuesto para reemplazos
- Gestión de litigios laborales por contratos vencidos

### Impacto Estratégico

Las alertas de trabajadores son **críticas para la continuidad operativa**:

| Métrica | Impacto |
|---------|---------|
| **Costo de reemplazo** | 50-200% del salario anual según posición |
| **Pérdida de conocimiento** | Conocimiento tácito no documentado se pierde |
| **Tiempo de vacancia** | Typically 2-4 meses para cubrir posición |

Este dashboard permite:

- **Prevenir vacancias** por falta de renovación oportuna
- **Planificar reemplazo** con tiempo adecuado
- **Preservar conocimiento** del capital intelectual
- **Controlar costos** de rotación de personal
- **Cumplir obligaciones legales** de vigencia contractual

La diferenciación por modalidad permite además gestionar diferentes tipos de relación laboral (tiempo completo vs. servicios).