---
title: Notificaciones
description: Alertas de vencimiento, reglas, tipos, envio manual y cron segun el backend actual.
---

Las notificaciones representan alertas sobre contratos proximos a vencer. El backend las calcula a partir de contratos, reglas activas y preferencias de usuario.

## Notificacion

El frontend usa el tipo `Notification`.

| Campo | Uso |
|-------|-----|
| `id` | Clave estable, por ejemplo `contract-{doc_id}-{days}`. |
| `document_id` | Contrato asociado. |
| `type` | Severidad: `critical`, `warning` o `info`. |
| `title` | Titulo visible. |
| `description` | Mensaje mostrado al usuario. |
| `days_remaining` | Dias restantes para el vencimiento. |

## Tipos

El backend resuelve severidad segun dias restantes:

| Condicion | Tipo |
|-----------|------|
| `days_remaining <= 3` | `critical` |
| `days_remaining <= 7` | `warning` |
| Mayor a 7 | `info` |

## Reglas de Notificacion

Una regla se representa como `NotificationRule`.

| Campo | Uso |
|-------|-----|
| `id` | Identificador de la regla. |
| `organization_id` | Organizacion propietaria. |
| `document_id` | Contrato especifico o `null` para regla organizacional. |
| `days_before_due` | Dia previo al vencimiento en que se dispara la alerta. |
| `is_active` | Permite activar o desactivar la regla. |

Si no hay reglas activas, el backend usa dias por defecto:

```text
15, 7, 3
```

## Calculo de Alertas

El servicio de notificaciones:

1. Sincroniza estados de contratos con `contracts.sync_document_states`.
2. Obtiene contratos vigentes o por vencer de la organizacion.
3. Aplica reglas especificas por contrato si existen.
4. Si no existen, aplica reglas por defecto de organizacion.
5. Si tampoco existen, usa `15`, `7`, `3`.
6. Filtra eventos segun rol y preferencia `receives_notifications`.

## Endpoints

| Metodo | Ruta | Uso |
|--------|------|-----|
| `GET` | `/notifications/` | Listar alertas visibles para el usuario actual. |
| `GET` | `/notifications/rules` | Listar reglas. |
| `POST` | `/notifications/rules` | Crear regla. |
| `PATCH` | `/notifications/rules/{rule_id}` | Actualizar regla. |
| `DELETE` | `/notifications/rules/{rule_id}` | Eliminar regla. |
| `POST` | `/notifications/send-email-alerts` | Enviar alertas manualmente. |
| `POST` | `/notifications/cron/send-emails` | Ejecutar envio por cron con `X-Cron-Secret`. |

## Envio de Correos

El envio manual requiere permisos de administrador. El cron usa un secreto en header y registra envios diarios para evitar duplicados por organizacion y fecha.
