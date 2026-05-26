---
title: Contratos Recientes (B2B)
description: Lista de los últimos contratos empresariales actualizados.
---

El dashboard de **Contratos Recientes (B2B)** ofrece un resumen en tiempo real de la actividad contractual más reciente en la organización. 

Al presentar los documentos empresariales recién aprobados o modificados, actúa como un panel de control operativo para monitorizar la ejecución continua de los negocios.

## Ficha Técnica

### Endpoint

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Path** | `/dashboard/recent_contracts/company` |
| **Rol requerido** | MANAGER |

### Lógica de Cálculo
- Excluye los contratos que aún se encuentran en borradores o pendientes de firma.
- Selecciona los acuerdos comerciales activos ordenándolos descendentemente por su fecha de última modificación (y luego por su fecha de creación).
- Retorna la información clave de los 4 contratos más recientes.

### Respuesta del Endpoint (Ejemplo)
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
  }
]
```

## Valor de Negocio

Proporciona al **Gerente de Operaciones** y al **Director Legal** visibilidad directa sobre qué negocios acaban de cerrarse. Permite accionar procesos de *onboarding* de clientes de manera ágil sin tener que indagar en la sección completa de gestión documental. Es un pulso de actividad inmediata para la empresa.
