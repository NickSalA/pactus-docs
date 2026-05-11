---
title: Servicios más Contratados
description: Ranking de los servicios más contratados por empresas clientes.
---

El dashboard de **Servicios más Contratados** presenta un ranking de los servicios más demandados por las empresas clientes.

## Resumen Ejecutivo

Este dashboard muestra los servicios más contratados por clientes empresariales, discriminando entre volumen (cantidad de contratos) y valor económico.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/top_services` |
| **Rol requerido** | MANAGER |

### Parámetros de Consulta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `currency` | string | No | Filtra por moneda (PEN, USD, EUR) |
| `sort_by` | string | No | Criterio de ordenamiento: `volume` (default) o `value` |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, type (COMPANY), state |
| `ServiceItem` | service_id, description, value, currency |

### Filtros Aplicados

- `type = COMPANY`
- `state IN (ACTIVE, EXPIRING_SOON)`
- `service_items.value > 0`

### Lógica de Cálculo

- **quantity**: Cantidad de contratos distintos asociados al servicio
- **amount**: Suma de `service_items.value`
- Retorna **máximo 5 servicios**
- Ordenado por `sort_by` (volume o value)

### Respuesta del Endpoint

```json
[
  { "name": "Cloud Hosting", "quantity": 15, "amount": 45000.00 },
  { "name": "Desarrollo Web", "quantity": 12, "amount": 36000.00 },
  { "name": "Ciberseguridad", "quantity": 8, "amount": 28000.00 },
  { "name": "Consultoría Legal", "quantity": 5, "amount": 15000.00 },
  { "name": "Mantenimiento", "quantity": 3, "amount": 9000.00 }
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
| **Ranking de 5 servicios** | Lista ordenada por volumen o valor |
| **Columna cantidad** | Número de contratos distintos por servicio |
| **Columna monto** | Valor total acumulado del servicio |

### Interactividad

| Interacción | Descripción |
|-------------|-------------|
| **Ordenar por volumen** | Ver servicios por cantidad de contratos |
| **Ordenar por valor** | Ver servicios por facturación total |
| **Filtro por moneda** | Ver solo servicios en PEN, USD o EUR |

### Funcionalidades NO Implementadas

- Top 10 (solo Top 5)
- Últimos 12 meses móviles
- Tendencia vs. período anterior
- Valor promedio por contrato
- Cambio de período
- Click para filtrar contratos
- Gráfico de doble eje
- Exportar CSV

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **Director comercial** | Identificar servicios estrellas |
| **Product Manager** | Decisiones sobre desarrollo de servicios |
| **CFO** | Distribución de ingresos por línea |

### Decisiones Asociadas

- Desarrollo de nuevos servicios
- Ajuste de precios por servicio
- Asignación de presupuesto de marketing

### Limitaciones

Este dashboard **no incluye**:
- Períodos históricos configurables
- Tendencias temporales
- Comparación entre períodos
- Gráficos visuales
- Exportación de datos

> **Nota de alcance**: Esta documentación describe el estado actual del backend.