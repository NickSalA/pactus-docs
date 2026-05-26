---
title: Contratos Recientes (Trabajadores)
description: Lista de los últimos contratos laborales actualizados.
---

El dashboard de **Contratos Recientes (Trabajadores)** funge como un log operativo del reclutamiento y mantenimiento de personal, exponiendo los registros laborales recién formalizados o renovados.

Aporta visibilidad constante de la rotación y el flujo de talento dentro del sistema, sin necesidad de realizar búsquedas filtradas.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/recent_contracts/labor` |
| **Rol requerido** | HR |

### Lógica de Cálculo
- Filtra todos los acuerdos en estado de borrador o pendientes de aceptación.
- Obtiene los registros estrictamente laborales (LABOR) que están activos.
- Los organiza bajo un criterio cronológico estricto, priorizando los que han sufrido modificaciones en el periodo más reciente.
- Despliega información resumen de los últimos 4 eventos contractuales.

### Respuesta del Endpoint (Ejemplo)
```json
[
  {
    "id": 52,
    "title": "Contrato Tiempo Completo - Juan Pérez",
    "services": ["Desarrollo Frontend"],
    "name": "Juan Pérez",
    "dates": "05/01/26 - 05/01/27"
  },
  {
    "id": 48,
    "title": "Contrato Servicios - María García",
    "services": ["Diseño UX"],
    "name": "María García",
    "dates": "04/15/26 - 10/15/26"
  }
]
```

## Valor de Negocio

Para un **Especialista en Atracción de Talento** o un **Gerente de RRHH**, este dashboard confirma que los *onboardings* recientes, como nuevas contrataciones o firmas de ascensos y adendas, han culminado su proceso y ya forman parte del universo activo de la empresa.

Ofrece una visión general de dónde se está inyectando capital de talento recientemente y qué perfiles acaban de incorporarse a sus nuevas funciones.
