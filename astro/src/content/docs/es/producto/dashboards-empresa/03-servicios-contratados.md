---
title: Servicios más Contratados
description: Ranking de los servicios más contratados por empresas clientes.
---

El dashboard de **Servicios más Contratados** presenta un ranking dinámico que identifica los productos y servicios más demandados por el portafolio de clientes empresariales.

Permite a los analistas discriminar entre los servicios con mayor volumen de adopción y aquellos que representan el mayor valor económico facturado.

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
| `currency` | string | No | Filtra resultados por moneda (PEN, USD, EUR). |
| `sort_by` | string | No | Criterio de ordenamiento: `volume` (por defecto) o `value`. |

### Lógica de Cálculo
- Analiza todos los ítems de servicio asociados a contratos B2B vigentes.
- Agrupa los registros por el tipo de servicio contratado, sumando tanto la cantidad total de contratos como el monto acumulado.
- Retorna el top 5 absoluto según el criterio de ordenamiento solicitado.

### Respuesta del Endpoint (Ejemplo)
```json
[
  { "name": "Cloud Hosting", "quantity": 15, "amount": 45000.00 },
  { "name": "Desarrollo Web", "quantity": 12, "amount": 36000.00 },
  { "name": "Ciberseguridad", "quantity": 8, "amount": 28000.00 },
  { "name": "Consultoría Legal", "quantity": 5, "amount": 15000.00 },
  { "name": "Mantenimiento", "quantity": 3, "amount": 9000.00 }
]
```

## Valor de Negocio

Para un **Director Comercial** o **Product Manager**, entender cuáles servicios lideran en tracción o facturación es vital para definir estrategias de marketing, asignar presupuesto de ventas y tomar decisiones sobre el desarrollo o retiro de ciertos productos.

Si un servicio presenta alta adopción (volumen) pero baja contribución (valor), se pueden aplicar estrategias de optimización de precios. Por el contrario, los servicios de alto valor con bajo volumen representan oportunidades para realizar campañas de *cross-selling* y maximizar la rentabilidad de clientes existentes.
