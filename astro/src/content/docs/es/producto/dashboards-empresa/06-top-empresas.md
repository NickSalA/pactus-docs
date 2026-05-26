---
title: Top Empresas (Volumen)
description: Ranking de las principales empresas clientes por volumen o valor.
---

El dashboard de **Top Empresas** permite a la directiva identificar de un vistazo cuáles son los clientes estratégicos que sustentan la operativa y rentabilidad del negocio.

Clasifica a las empresas del portafolio comercial según la cantidad de contratos activos (carga operativa) o el valor total facturado, revelando la concentración de la cartera.

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
| `currency` | string | No | Filtra resultados por moneda (PEN, USD, EUR). |
| `sort_by` | string | No | Criterio de clasificación: `volume` (por cantidad de contratos) o `value` (por monto económico acumulado). |

### Lógica de Cálculo
- Filtra las relaciones contractuales corporativas (B2B) actualmente vigentes.
- Agrupa los registros bajo un mismo cliente (empresa matriz).
- Consolida y suma tanto el conteo de contratos únicos como el aporte financiero de los mismos.
- Retorna el top 5 de cuentas más críticas de la organización.

### Respuesta del Endpoint (Ejemplo)
```json
[
  { "name": "Acme Corporation", "contracts": 12, "amount": 450000.00 },
  { "name": "TechStart SA", "contracts": 8, "amount": 320000.00 },
  { "name": "GlobalTech Inc", "contracts": 10, "amount": 280000.00 },
  { "name": "StartUpXYZ", "contracts": 6, "amount": 180000.00 },
  { "name": "DataMaster", "contracts": 5, "amount": 150000.00 }
]
```

## Valor de Negocio

Para un **CEO** o **Director Comercial**, conocer la dependencia económica respecto a ciertas cuentas clave es esencial para la gestión de riesgos (por ejemplo, riesgo de concentración).

Si unas pocas empresas concentran el grueso de los contratos o ingresos, la gerencia puede destinar *Account Managers* dedicados y desarrollar programas de fidelización exclusivos (VIP) para blindar esas cuentas y proteger los flujos futuros de caja.
