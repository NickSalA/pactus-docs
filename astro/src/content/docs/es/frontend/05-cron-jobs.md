---
title: "Cron Jobs"
description: "Endpoints de cron jobs para notificaciones periódicas y warmup de la aplicación."
---

ContractIA utiliza **Vercel Cron** para ejecutar tareas programadas. Estos endpoints actúa como proxy seguro entre Vercel y el backend FastAPI.

## Cron Jobs Disponibles

| Endpoint | Descripción | Programación |
|----------|-------------|-------------|
| `/api/cron/send-emails` | Envío de alertas de contratos por vencer | `0 13 * * *` UTC (8:00 AM Lima) |
| `/api/cron/warmup` | Warmup del contenedor backend | `0 5 * * *` UTC (12:00 AM Lima) |

## send-emails

**Propósito:** Proxy que reenvía la petición al backend para enviar alertas por email sobre contratos próximos a vencer.

**Flujo:**
1. Vercel Cron invoca el endpoint con `Authorization: Bearer {CRON_SECRET}`
2. El route valida el secret
3. Si es válido, reenvía `POST /notifications/cron/send-emails` al backend con header `X-Cron-Secret`

**Backend:** `POST {NEXT_PUBLIC_API_URL}/notifications/cron/send-emails`

**Seguridad:**
- Valida `Authorization: Bearer {CRON_SECRET}` contra `CRON_SECRET` de env
- Reenvía el secret al backend via header `X-Cron-Secret` para autorización sin JWT

## warmup

**Propósito:** Mantiene el contenedor del backend en Azure Container Apps "caliente" para evitar cold starts.

**Flujo:**
1. Vercel Cron invoca el endpoint con `Authorization: Bearer {CRON_SECRET}`
2. El route valida el secret
3. Si es válido, envía un GET a la raíz del backend (`/`)
4. Timeout de 8 segundos con AbortController

**Backend:** `GET {baseUrl}/` (raíz del API, no `/api/`)

**Manejo de errores:**
- Si ocurre error o timeout, retorna `{ ok: true, warmed: false }` — no es crítico

## Configuración

### vercel.json

```json
{
  "crons": [
    { "path": "/api/cron/warmup", "schedule": "0 5 * * *" },
    { "path": "/api/cron/send-emails", "schedule": "0 13 * * *" }
  ]
}
```

Vercel ejecuta automáticamente estos jobs según la programación especificada.

### Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `CRON_SECRET` | Secreto compartido entre Vercel y el frontend para validación |
| `NEXT_PUBLIC_API_URL` | URL base del backend FastAPI |

## Errores Comunes

| Error | Causa | Solución |
|-------|------|----------|
| 401 Unauthorized | `CRON_SECRET` incorrecto o ausente | Verificar variable en Vercel |
| 500 Backend error | Fallo en el backend | Revisar logs del backend |
| 500 API URL no configurada | `NEXT_PUBLIC_API_URL` no definida | Agregar variable en Vercel |
