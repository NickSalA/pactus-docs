---
title: Centro de Alertas (Empresas)
description: Sistema de alertas para identificar contratos empresariales críticos a 30, 60 días y vigencia prolongada.
---

El **Centro de Alertas (Empresas)** permite identificar contratos empresariales que requieren atención.

## Resumen Ejecutivo

Este dashboard presenta 3 categorías de alertas para contratos de tipo `COMPANY`. Cada categoría muestra un conteo y una previsualización de hasta 3 contratos.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/alert_center/company` |
| **Rol requerido** | MANAGER |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (COMPANY), state, start_date, end_date, name |
| `ServiceItem` | value, currency, start_date, end_date |

### Filtros Aplicados

- `type = COMPANY`
- `state IN (ACTIVE, EXPIRING_SOON)`
- `service_items.value > 0`

### Categorías de Alertas

| Categoría | `due_to` | Descripción |
|-----------|----------|-------------|
| **Vencen Próximos (30 días)** | 30 | Contratos con `end_date` entre hoy y los próximos 30 días |
| **Vencen Próximos (60 días)** | 60 | Contratos con `end_date` entre 31 y 60 días |
| **Vigencia Prolongada** | `null` | Contratos con `end_date` posterior a hoy + 60 días |

> **Importante**: La categoría "vigencia prolongada" en el backend significa `end_date > hoy + 60 días`, **no** duración mayor a 24 meses (DATEDIFF > 720 días).

### Respuesta del Endpoint

```json
[
  {
    "label": "VENCEN PROXIMOS 30 DÍAS",
    "color": { "accent": "#ef4444", "bg": "#fef2f2" },
    "due_to": 30,
    "count": 5,
    "items": [
      { "id": 1, "name": "Contrato Acme Corp", "detail": null, "status": "ACTIVE" },
      { "id": 2, "name": "Contrato Beta SA", "detail": null, "status": "EXPIRING_SOON" },
      { "id": 3, "name": "Contrato Gamma Inc", "detail": null, "status": "ACTIVE" }
    ]
  },
  {
    "label": "VENCEN PROXIMOS 60 DÍAS",
    "color": { "accent": "#f59e0b", "bg": "#fffbeb" },
    "due_to": 60,
    "count": 8,
    "items": [...]
  },
  {
    "label": "VIGENCIA PROLONGADA",
    "color": { "accent": "#6b7280", "bg": "#f3f4f6" },
    "due_to": null,
    "count": 12,
    "items": [...]
  }
]
```

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

### Interactividad

| Interacción | Descripción |
|-------------|-------------|
| **Ver detalle de contrato** | Cada item muestra información básica del contrato |

### Funcionalidades NO Implementadas

- Valor en riesgo (suma de valores)
- Barra de progreso
- Drill-down modal completo
- Ordenar por valor
- Exportar CSV
- Acciones rápidas (crear renovación, enviar recordatorio)
- Notificaciones por email
- Filtro por cliente

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Director de Operaciones** | Visibilidad de contratos que requieren acción |
| **Gerente Legal** | Seguimiento de vencimientos |
| **Account Manager** | Gestión de cuenta cliente |

### Decisiones Asociadas

- Asignar recursos para negociación de renovaciones
- Priorizar contratos de alto valor
- Planificar ingresos futuros

### Limitaciones

Este dashboard **no incluye**:
- Suma de valor en riesgo por categoría
- Drill-down a modal con detalle completo
- Ordenamiento por valor
- Exportación de datos
- Notificaciones por email
- Filtros avanzados

> **Nota de alcance**: Esta documentación describe el estado actual del backend.