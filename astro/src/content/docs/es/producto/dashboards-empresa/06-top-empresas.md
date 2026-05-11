---
title: Top Empresas (Volumen)
description: Ranking de las principales empresas clientes por volumen o valor.
---

El dashboard de **Top Empresas (Volumen)** presenta un ranking de los clientes empresariales más importantes.

## Resumen Ejecutivo

Este dashboard ranking clasifica a los clientes de tipo `COMPANY` según su volumen de contratos o valor total de facturación.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/top_companies` |
| **Rol requerido** | MANAGER |

### Parámetros de Consulta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `currency` | string | No | Filtra por moneda (PEN, USD, EUR) |
| `sort_by` | string | No | Criterio: `volume` (default) o `value` |

### Origen de Datos

| Entidad | Campos Utilizados |
|---------|-------------------|
| `Document` | id, client, type (COMPANY), state |
| `ServiceItem` | value, currency |

### Filtros Aplicados

- `type = COMPANY`
- `state IN (ACTIVE, EXPIRING_SOON)`
- `name IS NOT NULL`
- `client IS NOT NULL`

### Lógica de Cálculo

- **contracts**: Cantidad de contratos distintos por cliente
- **amount**: Suma de `service_items.value`
- Retorna **máximo 5 empresas**
- Si `sort_by = volume`: ordena por `contracts` descendente
- Si `sort_by = value`: ordena por `amount` descendente

### Respuesta del Endpoint

```json
[
  { "name": "Acme Corporation", "contracts": 12, "amount": 450000.00 },
  { "name": "TechStart SA", "contracts": 8, "amount": 320000.00 },
  { "name": "GlobalTech Inc", "contracts": 10, "amount": 280000.00 },
  { "name": "StartUpXYZ", "contracts": 6, "amount": 180000.00 },
  { "name": "DataMaster", "contracts": 5, "amount": 150000.00 }
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
| **Ranking de 5 empresas** | Lista ordenada por volumen o valor |
| **Columna contratos** | Cantidad de contratos distintos |
| **Columna monto** | Valor total acumulado |

### Interactividad

| Interacción | Descripción |
|-------------|-------------|
| **Ordenar por volumen** | Ver empresas por cantidad de contratos |
| **Ordenar por valor** | Ver empresas por facturación total |
| **Filtro por moneda** | Ver solo empresas en PEN, USD o EUR |

### Funcionalidades NO Implementadas

- Top 20 (solo Top 5)
- Carga operativa compuesta
- Cantidad de servicios activos
- Promedio por contrato
- Sparklines de tendencia
- Badge de riesgo
- Comparar clientes
- Detalle individual del cliente
- Exportar CSV

## Valor de Negocio

### Stakeholder Objetivo

| Rol | Necesidad |
|-----|-----------|
| **CEO** | Identificar clientes más importantes |
| **Director Comercial** | Gestión de cuentas clave |
| **CFO** | Concentración de ingresos |

### Decisiones Associadas

- Asignación de Account Managers a cuentas clave
- Identificación de riesgo por concentración
- Desarrollo de programas de fidelización

### Limitaciones

Este dashboard **no incluye**:
- Más de 5 empresas
- Métricas de tendencia histórica
- Comparación entre clientes
- Detalle de contratos por empresa
- Exportación de datos

> **Nota de alcance**: Esta documentación describe el estado actual del backend.
