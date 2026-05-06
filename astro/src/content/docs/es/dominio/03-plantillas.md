---
title: Plantillas
description: Entidad Template, contenido, formatos, estados y flujo real de generacion documental.
---

Una plantilla se representa como `Template`. Sirve para construir contratos a partir de contenido Markdown, campos variables y reglas de renderizado.

## Que Es

Una plantilla es un modelo reutilizable asociado a una organizacion y a un tipo documental (`COMPANY` o `LABOR`). Puede crearse manualmente, generarse como borrador con IA, previsualizarse, publicarse y usarse para generar contratos.

## Campos Importantes

| Campo | Uso |
|-------|-----|
| `id` | Identificador de la plantilla. |
| `organization_id` | Organizacion propietaria. |
| `name` | Nombre visible. |
| `description` | Descripcion funcional. |
| `document_type` | Tipo documental de los contratos que genera. |
| `template_format_id` | Formato base opcional asociado. |
| `format_code` | Codigo tecnico del formato. |
| `format_label` | Nombre visible del formato. |
| `content` | Cuerpo y campos de la plantilla. |
| `state` | Estado de ciclo de vida. |

## Contenido de Plantilla

`TemplateContent` contiene:

| Campo | Uso |
|-------|-----|
| `body_md` | Markdown principal que se renderiza como contrato. |
| `fields` | Campos que normalmente completa el usuario. |
| `operational_fields` | Campos adicionales que usa el backend aunque no aparezcan directamente en el cuerpo. |
| `version` | Version funcional del contenido. |
| `contract_date_mapping` | Mapeo de campos que representan fecha de inicio y fin. |

Ejemplo simplificado:

```json
{
  "body_md": "# Contrato\n\nEntre {{cliente_nombre}} y la empresa...",
  "fields": [
    {
      "key": "cliente_nombre",
      "label": "Cliente",
      "type": "text",
      "required": true
    }
  ],
  "operational_fields": [],
  "version": "1.0",
  "contract_date_mapping": {
    "start_date_field": "contrato_fecha_inicio",
    "end_date_field": "contrato_fecha_fin"
  }
}
```

## Estados

| Estado | Uso |
|--------|-----|
| `DRAFT` | Plantilla editable. |
| `PUBLISHED` | Plantilla disponible para generar contratos. |
| `ARCHIVED` | Plantilla fuera de uso. |

El backend solo permite generar documentos desde plantillas `PUBLISHED`.

## Formatos

Los formatos se consultan con:

```http
GET /templates/formats
```

El backend filtra formatos segun rol y tipo documental. `HR` trabaja con `LABOR`, `MANAGER` con `COMPANY`, `WORKER` no gestiona plantillas y `ADMIN` no tiene restriccion explicita por tipo.

## Flujo Real

| Paso | Endpoint | Resultado |
|------|----------|-----------|
| Listar formatos | `GET /templates/formats` | Formatos disponibles para el rol. |
| Crear borrador con IA | `POST /templates/drafts` | `PersistedTemplateDraftResponse`. |
| Crear manualmente | `POST /templates/` | Plantilla en `DRAFT`. |
| Previsualizar | `POST /templates/preview` | Markdown renderizado y warnings. |
| Actualizar | `PATCH /templates/{template_id}` | Solo si esta en `DRAFT`. |
| Publicar | `POST /templates/{template_id}/publish` | Cambia a `PUBLISHED`. |
| Archivar | `POST /templates/{template_id}/archive` | Cambia a `ARCHIVED`. |
| Generar contrato | `POST /templates/{template_id}/generate` | Crea un `Document`. |

## Generacion de Contrato

Cuando se genera un contrato desde una plantilla, el backend:

1. Valida que la plantilla exista y pertenezca a la organizacion.
2. Exige estado `PUBLISHED`.
3. Verifica permisos de escritura para el `document_type`.
4. Renderiza `body_md` con datos del formulario, datos de organizacion y datos de fecha/firma.
5. Genera PDF.
6. Guarda un `Document` con estado inicial `PENDING_SIGNATURE`.

Para plantillas `COMPANY`, el backend toma `service_items` del payload de generacion cuando existen.
