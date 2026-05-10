---
title: Centro de Alertas (Empresas)
description: Sistema de semáforo interactivo para identificar contratos empresariales críticos a 30, 60 días y vigencia prolongada.
---

El **Centro de Alertas (Empresas)** es un dashboard de gestión de riesgos que permite a los altos cargos identificar y actuar proactivamente sobre contratos empresariales que requieren atención inmediata.

## Resumen Ejecutivo

Este dashboard presenta un sistema de semáforo que clasifica los contratos de tipo `COMPANY` según su proximidad al vencimiento y duración de vigencia. Cada alerta es interactiva y permite drill-down para ver el detalle específico de cada contrato.

## Ficha Técnica

### Definición de KPIs

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Alertas Críticas (Rojo)** | Contratos que vencen en los próximos 30 días | COUNT where DATEDIFF(end_date, NOW()) <= 30 AND state=ACTIVE |
| **Alertas Avanzadas (Amarillo)** | Contratos que vencen entre 31 y 60 días | COUNT where DATEDIFF(end_date, NOW()) BETWEEN 31 AND 60 |
| **Vigencia Prolongada (Naranja)** | Contratos con más de 24 meses de duración activa | COUNT where DATEDIFF(end_date, start_date) > 720 días |
| **Total de Contratos en Alerta** | Suma de todas las alertas activas | SUM(rojo + amarillo + naranja) |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (COMPANY), state, start_date, end_date, name |
| `ServiceItem` | value, currency (para mostrar valor en riesgo) |
| `Organization` | org_id para filtrar contexto |

### Lógica de Clasificación

| Color | Condición | Acción Recomendada |
|-------|-----------|-------------------|
| **Rojo** | `end_date` en los próximos 30 días | Contacto inmediato para renovación |
| **Amarillo** | `end_date` entre 31 y 60 días | Iniciar proceso de negociación |
| **Naranja** | Vigencia > 24 meses | Evaluar actualización de términos |
| **Verde** | Ninguna alerta (informativo) | Estado normal |

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Refresh Automático** | Cada hora |
| **Latencia de Datos** | Tiempo real desde última modificación de contrato |
| **Notificaciones** | Envío de email cuando un contrato entra en estado rojo |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **Tarjetas de Semáforo** | 3 tarjetas principales (Rojo, Amarillo, Naranja) con conteo y valor en riesgo |
| **Barra de Progreso** | Representación visual del porcentaje de contratos en cada estado |
| **Lista de Contratos** | Tabla con contratos filtrables por color de alerta |
| **Valor en Riesgo** | Suma de `service_items.value` de contratos en alerta |

### Interactividad: Drill-Down Ascendente

| Nivel | Acción |
|-------|--------|
| **Nivel 1 (Semáforo)** | Click en tarjeta de color → filtra la tabla a contratos de ese estado |
| **Nivel 2 (Tabla)** | Click en fila de contrato → abre modal con detalle completo |
| **Nivel 3 (Modal)** | Ver datos completos del contrato, documentos asociados, servicios y acciones disponibles |

**Flujo de Drill-Down**:
```
Dashboard → [Click en tarjeta Roja] → Lista de contratos en rojo → [Click en contrato] → Modal de detalle
```

### Funcionalidades Adicionales

| Función | Descripción |
|---------|-------------|
| **Filtro por cliente** | Buscar contratos de una empresa específica |
| **Ordenar por valor** | Mostrar primero los contratos con mayor valor en riesgo |
| **Exportar lista** | Descargar CSV con todas las alertas |
| **Acciones rápidas** | Botones para crear renovación, enviar recordatorio, agendar llamada |

### Casos de Uso

1. **Revisión semanal de riesgos**: El Director de Operaciones revisa el semáforo los lunes para asignar tareas.
2. **Reuniones de cuenta clave**: El Account Manager revisa alertas de sus clientes antes de reuniones.
3. **Reporte mensual a dirección**: El CEO revisa el total de valor en riesgo para decisiones estratégicas.
4. **Asignación de tareas**: El Manager reparte contratos a su equipo para seguimiento.

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Director de Operaciones** | Visibilidad de contratos que requieren acción inmediata |
| **Gerente Legal** | Seguimiento de renovaciones y vencimientos |
| **Account Manager** | Gestión de cuenta cliente y prevention de churn |
| **CEO** | Riesgo de pérdida de ingresos por contratos no renovados |

### Decisiones Asociadas

- Asignar recursos para negociación de renovaciones
- Decidir si ofrecer descuentos por fidelidad
- Priorizar renovación de contratos de alto valor
- Planificar ingresos futuros con precisión
- Evitar pérdida de clientes por falta de seguimiento

### Impacto Estratégico

El Centro de Alertas es **fundamental** para la retención de clientes B2B:

- **Reducción de churn**: Identificación proactiva de contratos próximos a vencer
- **Preservación de ingresos**: El valor en riesgo permite priorizar esfuerzos
- **Mejora de servicio**: Seguimiento sistemático mejora la percepción del cliente
- **Accountability**: Visibilidad clara de quién debe actuar en cada contrato

La funcionalidad de drill-down permite pasar de una vista agregada a los detalles específicos de cada contrato sin abandonar el contexto del dashboard.