---
title: Contratos Recientes (Trabajadores)
description: Lista de los últimos contratos laborales actualizados.
---

El dashboard de **Contratos Recientes (Trabajadores)** presenta un registro de los últimos contratos laborales modificados.

## Resumen Ejecutivo

Este dashboard muestra los contratos de tipo `LABOR` más recientemente actualizados, ordenados por fecha de modificación.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/recent_contracts/labor` |
| **Rol requerido** | HR |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, name, client, type (LABOR), state, start_date, end_date, created_at, updated_at |
| `ServiceItem` | service_id (para lista de servicios) |

### Filtros Aplicados

- `type = LABOR`
- `state IN (ACTIVE, EXPIRING_SOON)`
- **NO** incluye contratos PENDING_SIGNATURE

### Lógica de Cálculo

- Retorna **máximo 4 contratos**
- Ordenado por `updated_at DESC`, luego `created_at DESC`
- Cada item incluye: `id`, `title`, `services`, `name`, `dates`

### Respuesta del Endpoint

```json
[
  {
    "id": 52,
    "title": "Contrato Tiempo Completo - Juan Pérez",
    "services": ["Desarrollo Frontend"],
    "name": "Juan Pérez",
    "dates": "2026-05-01 - 2027-05-01"
  },
  {
    "id": 48,
    "title": "Contrato Servicios - María García",
    "services": ["Diseño UX"],
    "name": "María García",
    "dates": "2026-04-15 - 2026-10-15"
  },
  {
    "id": 45,
    "title": "Contrato Medio Tiempo - Carlos López",
    "services": ["Soporte Técnico"],
    "name": "Carlos López",
    "dates": "2026-04-01 - 2027-04-01"
  },
  {
    "id": 41,
    "title": "Contrato Tiempo Completo - Ana Torres",
    "services": ["Backend Development"],
    "name": "Ana Torres",
    "dates": "2026-03-15 - 2027-03-15"
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
| **Lista de 4 contratos** | Los más recientemente actualizados |
| **Título** | Nombre del contrato |
| **Servicios** | Array de nombres de servicios asociados |
| **Trabajador** | Nombre del trabajador |
| **Fechas** | Período del contrato (start - end) |

### Funcionalidades NO Implementadas

- Altas recientes en 30 días como KPI separado
- Distribución por modalidad (pie chart)
- Inversión en nuevas altas
- Tasa de contratación
- Modalidad predominante
- Últimos 100 contratos o 90 días (solo 4)
- Metas vs. real
- Filtros por modalidad, fecha
- Búsqueda por nombre
- Exportar CSV
- Comparación de períodos
- Notificaciones

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Gerente de RRHH** | Visibilidad de contratos recientes |
| **Director de RRHH** | Seguimiento de contrataciones |
| **Gerente de Finanzas** | Control de gasto laboral |

### Limitaciones

Este dashboard **no incluye**:
- Métricas de altas recientes
- Distribución por modalidad
- Comparación con períodos anteriores
- Filtros o búsqueda
- Exportación de datos

> **Nota de alcance**: Esta documentación describe el estado actual del backend.