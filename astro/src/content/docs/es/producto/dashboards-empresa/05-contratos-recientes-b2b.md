---
title: Contratos Recientes (B2B)
description: Lista de los últimos contratos empresariales actualizados.
---

El dashboard de **Contratos Recientes (B2B)** presenta un registro de los últimos contratos empresariales modificados.

## Resumen Ejecutivo

Este dashboard muestra los contratos de tipo `COMPANY` más recientemente actualizados, ordenados por fecha de modificación.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/recent_contracts/company` |
| **Rol requerido** | MANAGER |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, name, client, type (COMPANY), state, start_date, end_date, created_at, updated_at |
| `ServiceItem` | service_id (para lista de servicios) |

### Filtros Aplicados

- `type = COMPANY`
- `state IN (ACTIVE, EXPIRING_SOON)`
- `name IS NOT NULL`
- `client IS NOT NULL`
- **NO** incluye contratos PENDING_SIGNATURE

### Lógica de Cálculo

- Retorna **máximo 4 contratos**
- Ordenado por `updated_at DESC`, luego `created_at DESC`
- Cada item incluye: `id`, `title`, `services`, `name`, `dates`

### Respuesta del Endpoint

```json
[
  {
    "id": 42,
    "title": "Contrato Marco - Acme Corp",
    "services": ["Cloud Hosting", "Desarrollo Web"],
    "name": "Acme Corporation",
    "dates": "01/15/26 - 01/15/27"
  },
  {
    "id": 38,
    "title": "SLA - TechStart",
    "services": ["Ciberseguridad"],
    "name": "TechStart SA",
    "dates": "02/01/26 - 02/01/27"
  },
  {
    "id": 35,
    "title": "Contrato Marco - GlobalTech",
    "services": ["Consultoría", "Infraestructura"],
    "name": "GlobalTech Inc",
    "dates": "12/01/25 - 12/01/26"
  },
  {
    "id": 29,
    "title": "Amendment - Innova",
    "services": ["Mantenimiento"],
    "name": "Innova Solutions",
    "dates": "11/15/25 - 11/15/26"
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
| **Cliente** | Nombre del cliente/empresa |
| **Fechas** | Período del contrato (start - end) |

### Interactividad

| Interacción | Descripción |
|-------------|-------------|
| **Ver detalle** | Consultar información completa del contrato |

### Funcionalidades NO Implementadas

- Últimos 100 contratos o 90 días (solo 4)
- Polling en tiempo real cada 30 segundos
- Contratos pendientes PENDING_SIGNATURE
- Valor firmado en 30 días
- Tiempo promedio de firma
- Tasa de conversión
- Tipos de contrato (SLA, Marco, Adenda, Amendment)
- Filtros por tipo, estado, cliente
- Búsqueda por nombre
- Exportar CSV
- Agrupación por cliente
- Notificaciones

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Gerente de Operaciones** | Visibilidad de contratos recientes |
| **Director Legal** | Seguimiento de contratos |
| **Gerente Comercial** | Actividad reciente del negocio |

### Limitaciones

Este dashboard **no incluye**:
- Paginación
- Ordenamiento por columnas
- Métricas de valor firmado
- Tipos específicos de contrato
- Filtros o búsqueda
- Exportación de datos

> **Nota de alcance**: Esta documentación describe el estado actual del backend.
