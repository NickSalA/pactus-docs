---
title: Módulo de Notificaciones
description: Endpoints del módulo de notificaciones para alertas de vencimiento, reglas y envío masivo por correo.
---

El módulo de **Notificaciones** gestiona alertas contractuales, reglas configurables y envío de correos de vencimiento. Opera sobre la organización del usuario autenticado.

## Endpoints

### Listar notificaciones

`GET /notifications`

Devuelve las alertas que aplican al usuario autenticado para el día actual. Cada notificación incluye `id`, `document_id`, `type`, `title`, `description` y `days_remaining`.

```json
[
  {
    "id": "notif_001",
    "document_id": 42,
    "type": "warning",
    "title": "Contrato próximo a vencer",
    "description": "El contrato 'Acme Corp - Soporte TI' vence en 15 días",
    "days_remaining": 15
  },
  {
    "id": "notif_002",
    "document_id": 58,
    "type": "critical",
    "title": "Contrato vencido",
    "description": "El contrato 'Servicios de Limpieza' venció hace 3 días",
    "days_remaining": -3
  }
]
```

Tipos posibles: `info`, `warning`, `critical`.

### Enviar alertas por correo

`POST /notifications/send-email-alerts`

Dispara manualmente el envío consolidado de correos de vencimiento para la organización actual. Requiere rol de administrador.

```json
{
  "emails_sent": 12
}
```

Respuesta `200`:
```json
{
  "emails_sent": 12
}
```

### Envío masivo por cron

`POST /notifications/cron/send-emails`

Ejecuta el envío masivo diario de correos para todas las organizaciones. **No usa JWT** — se protege con el header `X-Cron-Secret`.

```json
{
  "emails_sent": 47,
  "orgs_processed": 12,
  "orgs_skipped": 2
}
```

### Listar reglas de notificación

`GET /notifications/rules`

Lista las reglas de alerta de la organización actual.

```json
[
  {
    "id": 1,
    "organization_id": 2,
    "document_id": 42,
    "days_before_due": 15,
    "is_active": true,
    "created_at": "2026-04-01T09:00:00Z",
    "updated_at": "2026-04-01T09:00:00Z"
  }
]
```

### Crear regla

`POST /notifications/rules`

Crea una nueva regla de notificación. Si `document_id` es `null`, la regla aplica a todos los documentos de la organización.

```json
{
  "days_before_due": 30,
  "is_active": true
}
```

O aplicada a un documento específico:

```json
{
  "document_id": 42,
  "days_before_due": 15,
  "is_active": true
}
```

### Actualizar regla

`PATCH /notifications/rules/{rule_id}`

Actualiza `days_before_due` o `is_active` de una regla existente.

```json
{
  "days_before_due": 7,
  "is_active": false
}
```

### Eliminar regla

`DELETE /notifications/rules/{rule_id}`

Elimina una regla de notificación. Retorna 204.

## Tipos de Notificación

| Tipo | Significado |
|------|-------------|
| `info` | Recordatorio informativo sin urgencia |
| `warning` | Alerta amarilla: contrato próximo a vencer |
| `critical` | Alerta roja: contrato vencido o muy próximo |

## Permisos

- `GET /notifications` — cualquier usuario autenticado
- `POST /notifications/send-email-alerts` — solo administradores
- `POST /notifications/cron/send-emails` — header `X-Cron-Secret` (no JWT)
- CRUD de reglas — solo administradores

## Integración Externa

El envío de correos usa **Gmail** a través de credenciales almacenadas en **Azure Key Vault**.