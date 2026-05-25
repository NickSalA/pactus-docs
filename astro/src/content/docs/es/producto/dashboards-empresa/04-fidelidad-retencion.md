---
title: Fidelidad (Retención)
description: Dashboard de métricas de permanencia y retención de clientes empresariales.
---

El dashboard de **Fidelidad y Retención B2B** analiza la recurrencia contractual y longevidad de nuestras relaciones con empresas clientes (contrapartes de tipo COMPANY).

Este módulo es fundamental para el equipo comercial, ya que permite identificar de forma rápida qué cuentas comerciales tienen relaciones estables, cuáles son clientes de legado, y cuáles presentan riesgo de abandono (Churn).

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/loyalty/company` |
| **Rol requerido** | MANAGER, WORKER |

### Lógica de Cálculo
- **Tasa de Retención Activa:** Clientes B2B con >1 contrato / Total de clientes
- **Socios de Legado (Key Accounts):** Cuentas con 4 o más contratos acumulados
- **Riesgo (Churn):** Evalúa la diferencia entre `latest_contract_end` y hoy.

### Respuesta del Endpoint (Ejemplo)
```json
{
  "kpis": {
    "active_retention_rate": 66.67,
    "total_unique_clients": 12,
    "avg_contracts_per_client": 2.83
  },
  "tenure_distribution": [
    { "contracts_count": 1, "clients_count": 4 },
    { "contracts_count": 4, "clients_count": 2 }
  ],
  "renewal_trend": [
    { "month": "Abr 26", "renewal_rate": 85.71, "total_expired": 7, "total_renewed": 6 }
  ],
  "details": [
    {
      "client_name": "Globex Corporation",
      "ruc": "20556677881",
      "contracts_count": 6,
      "first_contract_start": "2023-01-15",
      "latest_contract_end": "2026-12-31"
    }
  ]
}
```

## Métricas y KPIs Clave

El dashboard presenta un panel superior con indicadores del estado general del portafolio comercial:

| KPI | Descripción |
|-----|-------------|
| **Tasa de Retención Activa** | Porcentaje de clientes activos que tienen múltiples contratos firmados con la empresa. Representa la solidez de las renovaciones. |
| **Clientes Únicos** | Cantidad total de clientes recurrentes dentro del portafolio analizado. |
| **Contratos Promedio por Cliente** | Promedio de contratos generados por cada contraparte B2B. |

## Distribución de Permanencia (Cohortes)

El sistema clasifica la madurez de cada cliente según la cantidad de contratos consecutivos que mantienen con la empresa.
A través de un gráfico especializado (por ejemplo, gráfico de barras apiladas o embudo), el equipo comercial puede visualizar el volumen de cuentas en cada fase.

Los clientes con **4 o más contratos** son automáticamente catalogados por el sistema como **"Socios de Legado"** (Key Accounts), facilitando estrategias de fidelización VIP.

## Semáforo de Riesgo (Churn Risk)

El dashboard cuenta con un listado interactivo de todas las cuentas comerciales que expone el nivel de riesgo de pérdida (churn) a través de un semáforo visual:

- 🟢 **Verde (Activo):** El último contrato del cliente caduca en más de 60 días. La relación comercial se considera estable.
- 🟡 **Ámbar (En Riesgo de Vencer):** El contrato finalizará dentro de los próximos 60 días. Se activa una **alerta preventiva** para que el Account Manager inicie el proceso de renovación inmediata.
- 🔴 **Rojo (Inactivo):** El contrato ha expirado sin una renovación inmediata. Representa una cuenta potencialmente perdida.

## Valor de Negocio

La implementación de este dashboard otorga al equipo directivo y comercial una herramienta predictiva para proteger el flujo de ingresos. Permite cambiar de una postura reactiva a una **gestión proactiva** enfocada en prolongar el ciclo de vida del cliente B2B y maximizar su valor (LTV).
