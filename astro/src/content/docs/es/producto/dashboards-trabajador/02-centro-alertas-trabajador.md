---
title: Centro de Alertas (Trabajadores)
description: Sistema de alertas para identificar contratos laborales críticos a 30, 60 días y vigencia prolongada.
---

El **Centro de Alertas (Trabajadores)** permite identificar contratos laborales que requieren atención.

## Resumen Ejecutivo

Este dashboard presenta **3 categorías de alertas** para contratos de tipo `LABOR`. A diferencia de lo documentado anteriormente (2 tarjetas), el backend devuelve 3 categorías idénticas a las del módulo de empresa.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/alert_center/labor` |
| **Rol requerido** | HR |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (LABOR), state, start_date, end_date, name |
| `ServiceItem` | value, currency, start_date, end_date |

### Filtros Aplicados

- `type = LABOR`
- `state IN (ACTIVE, EXPIRING_SOON)`
- `name IS NOT NULL`
- `client IS NOT NULL`

### Categorías de Alertas

| Categoría | `due_to` | Descripción |
|-----------|----------|-------------|
| **Vencen Próximos (30 días)** | 30 | Contratos con `end_date` entre hoy y los próximos 30 días |
| **Vencen Próximos (60 días)** | 60 | Contratos con `end_date` entre 31 y 60 días |
| **Vigencia Prolongada** | `null` | Contratos con `end_date` posterior a hoy + 60 días |

> **Nota**: El backend devuelve las **mismas 3 categorías** que el centro de alertas de empresa.

### Respuesta del Endpoint

```json
[
  {
    "label": "VENCEN PROXIMOS",
    "color": { "accent": "#232232", "bg": "#123421" },
    "due_to": 30,
    "count": 3,
    "items": [
      { "id": 10, "name": "Juan Pérez", "detail": null, "status": "VENCE EN 15 DIAS" },
      { "id": 11, "name": "María García", "detail": null, "status": "VENCE EN 22 DIAS" },
      { "id": 12, "name": "Carlos López", "detail": null, "status": "VENCE EN 10 DIAS" }
    ]
  },
  {
    "label": "VENCEN PROXIMOS",
    "color": { "accent": "#F59E0B", "bg": "#FEF3C7" },
    "due_to": 60,
    "count": 5,
    "items": [...]
  },
  {
    "label": "VIGENCIA PROLONGADA",
    "color": { "accent": "#059669", "bg": "#D1FAE5" },
    "due_to": null,
    "count": 8,
    "items": [...]
  }
]
```

### Diferencias con Alertas B2B

| Aspecto | Empresas | Trabajadores |
|---------|----------|---------------|
| **Entidad** | client (empresa) | client (trabajador) |
| **Rol** | MANAGER | HR |

### Frecuencia de Actualización

| Métrica | Valor |
|---------|-------|
| **Latencia de Datos** | Tiempo real (consulta directa a BD) |

## Guía de Funcionalidad

### Comportamiento Visual

| Elemento | Descripción |
|----------|-------------|
| **3 Tarjetas de Categoría** | Cada categoría muestra label, color, count y hasta 3 items |
| **Items** | Cada item muestra id, name, detail (nullable), status |

> **Nota**: Los items laborales típicamente no tienen campo `detail`, salvo que venga en el resumen interno.

### Funcionalidades NO Implementadas

- Costo en riesgo (suma de valores)
- Distribución por modalidad
- Filtro por modalidad (tiempo completo, medio tiempo, servicios)
- Ordenar por costo
- Calendario de alertas
- Acciones rápidas (crear renovación, agendar evaluación)
- Exportar CSV
- Email diario de alertas

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Gerente de RRHH** | Gestión de trabajadores y prevención de vacíos |
| **Director de RRHH** | Visibilidad de riesgos laborales |
| **Gerente Legal** | Asegurar vigencia de contratos |

### Decisiones Asociadas

- Aprobación de renovaciones de contrato
- Planificación de nuevas contrataciones
- Gestión de cumplimiento legal

### Limitaciones

Este dashboard **no incluye**:
- Suma de costo en riesgo
- Distribución por modalidad
- Drill-down a modal con detalle completo
- Ordenamiento por costo
- Exportación de datos
- Notificaciones por email
- Filtros avanzados

> **Nota de alcance**: Esta documentación describe el estado actual del backend.