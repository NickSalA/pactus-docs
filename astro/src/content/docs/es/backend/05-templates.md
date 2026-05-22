---
title: Módulo de Plantillas
description: Endpoints del módulo de plantillas para creación, gestión, previsualización y generación de contratos.
---

El módulo de **Plantillas** permite crear, editar, publicar y archivar plantillas documentales. También ofrece previsualización sin persistencia y generación de documentos finales a partir de una plantilla.

## Endpoints

### Listar plantillas

`GET /templates`

Lista las plantillas disponibles para la organización actual. Soporta filtros por `document_type`, `format_code` y `state`.

Respuesta `200`:
```json
[
  {
    "id": 1,
    "organization_id": 2,
    "name": "Contrato de Management",
    "description": "Plantilla base para contratos de gestión",
    "document_type": "COMPANY",
    "template_format_id": 1,
    "format_code": "management",
    "format_label": "Contrato de Management",
    "content": {
      "body_md": "## CONTRATO DE MANAGEMENT\n\nConste por el presente documento...",
      "fields": [
        { "key": "representante_cargo", "label": "Cargo del representante", "type": "text", "required": true }
      ],
      "operational_fields": [],
      "version": "1.0",
      "contract_date_mapping": {
        "start_date_field": "fecha_inicio_contrato",
        "end_date_field": "fecha_fin_contrato"
      }
    },
    "created_at": "2026-04-01T09:00:00Z",
    "state": "PUBLISHED"
  }
]
```

### Crear plantilla

`POST /templates`

Crea una nueva plantilla en estado `DRAFT`. Requiere `format_code` y `content` (que incluye `body_md` y `fields`).

Request:
```json
{
  "name": "Contrato de Prestación de Servicios",
  "description": "Para servicios profesionales independientes",
  "format_code": "service",
  "document_type": "COMPANY",
  "content": {
    "body_md": "## CONTRATO DE PRESTACIÓN DE SERVICIOS\n\n...",
    "fields": [
      { "key": "nombre_prestador", "label": "Nombre del prestador", "type": "text", "required": true }
    ]
  }
}
```

### Obtener plantilla

`GET /templates/{template_id}`

Devuelve el detalle completo de una plantilla concreta.

### Actualizar plantilla

`PATCH /templates/{template_id}`

Actualiza campos de una plantilla en estado `DRAFT`. Solo `name`, `description` y `content` son editables.

### Formatos disponibles

`GET /templates/formats`

Lista los formatos de plantilla disponibles según el tipo documental del usuario.

```json
[
  {
    "id": 1,
    "document_type": "COMPANY",
    "format_code": "management",
    "label": "Contrato de Management",
    "default_name": "Contrato de Management",
    "default_description": "Plantilla estándar de management"
  }
]
```

### Generar borrador

`POST /templates/drafts`

Genera y persiste un borrador de plantilla a partir de un prompt, archivo PDF, o ambos. Soporta `generation_mode`: `strict` o `adaptive`.

Request (multipart):
```
file: <pdf>
request: {"name": "Mi Contrato", "format_code": "management", "generation_mode": "adaptive"}
```

Respuesta `201`:
```json
{
  "template": { ... },
  "warnings": ["Cláusulas de referencia no preservadas: CUARTA, QUINTA..."],
  "source": {
    "mode": "file_reference",
    "filename": "contrato_001.pdf",
    "generation_mode": "adaptive",
    "detected_document_type": "COMPANY",
    "clause_count": 10
  },
  "usage": {
    "input_tokens": 3268,
    "output_tokens": 9284,
    "total_tokens": 12552
  }
}
```

### Previsualizar plantilla

`POST /templates/preview`

Previsualiza una plantilla sin persistirla. Devuelve el markdown resuelto con los campos completados.

Request:
```json
{
  "format_code": "management",
  "document_type": "COMPANY",
  "content": {
    "body_md": "## CONTRATO\n\nEntre **{{nombre_representante}}** y...",
    "fields": [{ "key": "nombre_representante", "label": "Nombre", "type": "text" }]
  },
  "sample_data": { "nombre_representante": "Juan Pérez" }
}
```

Respuesta:
```json
{
  "markdown": "## CONTRATO\n\nEntre **Juan Pérez** y...",
  "resolved_payload": { "nombre_representante": "Juan Pérez" },
  "warnings": []
}
```

### Generar documento

`POST /templates/{template_id}/generate`

Genera un documento persistido a partir de la plantilla y un payload de `form_data`. Devuelve un `DocumentResponse` completo.

Request:
```json
{
  "form_data": {
    "representante_cargo": "Gerente General",
    "nombre_empresa": "Acme Corp"
  }
}
```

### Publicar plantilla

`POST /templates/{template_id}/publish`

Cambia el estado de la plantilla de `DRAFT` a `PUBLISHED`. Una vez publicada, la plantilla está disponible para generación.

### Archivar plantilla

`POST /templates/{template_id}/archive`

Cambia el estado de la plantilla a `ARCHIVED`. Las plantillas archivadas no pueden usarse para generación.

## Estados de Plantilla

| Estado | Descripción |
|--------|-------------|
| `DRAFT` | Plantilla en edición, no disponible para generación |
| `PUBLISHED` | Plantilla activa, disponible para uso |
| `ARCHIVED` | Plantilla desactivada, solo consulta |

## Dependencias del Módulo

El módulo de plantillas consume internamente:

- **Gemini** — para generación adaptativa de borradores
- **LlamaParse** — para extracción de contenido de PDF source
- **Qdrant** — para recuperación de contexto en generación