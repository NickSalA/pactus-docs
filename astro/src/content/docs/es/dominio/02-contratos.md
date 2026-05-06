---
title: Contratos
description: Entidad Document, estados, tipos, servicios asociados, archivos, carpetas y permisos reales de uso.
---

En ContractIA, un contrato se representa como la entidad `Document`. El frontend la consume desde `src/types/api.types.ts` y el backend la expone principalmente por los endpoints `/documents/`.

## Que Es

Un contrato es el registro funcional de un documento contractual dentro de una organizacion. Tiene metadata de negocio, una referencia opcional a archivo, lineas de servicio asociadas y un estado operativo.

## Campos Importantes

| Campo | Uso |
|-------|-----|
| `id` | Identificador del contrato. |
| `name` | Nombre visible del contrato. |
| `client` | Contraparte, cliente o trabajador asociado. |
| `type` | Tipo documental: `COMPANY` o `LABOR`. |
| `start_date` | Fecha de inicio contractual. |
| `end_date` | Fecha de fin contractual. |
| `form_data` | JSON flexible con datos estructurados extraidos o capturados. |
| `state` | Estado operativo del contrato. |
| `service_items` | Lineas economicas asociadas al contrato. |
| `folder_id` | Carpeta opcional donde se organiza el contrato. |
| `file_path` | Ruta tecnica del archivo almacenado. |
| `file_name` | Nombre visible del archivo. |

## Tipos de Contrato

Los tipos estan definidos en frontend como `DocumentType` y en backend como `DocumentType`.

| Tipo | Uso |
|------|-----|
| `COMPANY` | Contratos empresariales, comerciales o institucionales. |
| `LABOR` | Contratos laborales o asociados a gestion de personal. |

## Estados

Los estados estan definidos como `DocumentState`.

| Estado | Significado funcional |
|--------|-----------------------|
| `DRAFT` | Contrato en preparacion. |
| `PENDING_SIGNATURE` | Contrato generado o registrado, pendiente de firma. |
| `ACTIVE` | Contrato vigente. |
| `EXPIRING_SOON` | Contrato vigente dentro de una ventana de alerta. |
| `EXPIRED` | Contrato vencido. |
| `TERMINATED` | Contrato terminado antes de su vencimiento natural. |

El frontend muestra estos estados mediante `DOCUMENT_STATE_OPTIONS` en `src/lib/document.utils.ts`.

## Servicios Asociados

El detalle economico formal no vive como campos planos del contrato. Vive en `service_items`.

Cada item usa esta forma:

```json
{
  "service_id": 1,
  "description": "Servicio mensual",
  "value": 1500,
  "currency": "USD",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

El frontend calcula el valor total con `getDocumentTotalValue()`. Si hay `service_items`, suma sus valores; si no hay, intenta leer `form_data.value`.

## Archivos

El contrato puede tener archivo asociado. El backend guarda referencias como `file_path` y `file_name`, y expone una URL temporal con:

```http
GET /documents/{document_id}/file-url
```

## Permisos Por Rol

Las reglas coinciden entre `src/lib/permissions.ts` y `modules/documents/domain/access_policy.py`.

| Rol | Puede leer | Puede crear/editar/eliminar |
|-----|------------|-----------------------------|
| `ADMIN` | Sin restriccion explicita por tipo | Sin restriccion explicita por tipo |
| `HR` | `LABOR` | `LABOR` |
| `MANAGER` | `COMPANY` | `COMPANY` |
| `WORKER` | `COMPANY` | Ningun tipo |

## Endpoints Relacionados

| Metodo | Ruta | Uso |
|--------|------|-----|
| `GET` | `/documents/` | Listar contratos visibles. |
| `POST` | `/documents/` | Subir contrato con `multipart/form-data`. |
| `GET` | `/documents/{document_id}` | Obtener un contrato. |
| `PATCH` | `/documents/{document_id}` | Actualizar metadata y opcionalmente archivo. |
| `DELETE` | `/documents/{document_id}` | Eliminar contrato. |
| `GET` | `/documents/{document_id}/file-url` | Obtener URL firmada del archivo. |

## Creacion Desde Frontend

El frontend envia contratos con `FormData` desde `uploadDocument()`:

- `file`: archivo binario.
- `document`: JSON serializado con metadata, `form_data`, `folder_id` y `service_items`.
