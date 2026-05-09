---
title: "Cron Jobs"
description: "Endpoints de cron jobs para notificaciones periódicas y warmup de la aplicación."
---

ContractIA utiliza **Vercel Cron** para ejecutar tareas programadas, como el envío de notificaciones de contratos próximos a vencer. Estos endpoints son protegidos y se comunican con el backend.

## Cron Jobs Disponibles

| Endpoint | Descripción | Programación |
|----------|-------------|-------------|
| `/api/cron/send-emails` | Envío de alertas de contratos por vencer | 8:00 AM Lima (0 13 * * * UTC) |
| `/api/cron/warmup` | Warmup de la aplicación | 12:00 AM Lima (0 5 * * * UTC) |

## send-emails

### Propósito

El endpoint `/api/cron/send-emails` envía notificaciones por email a los usuarios sobre contratos próximos a vencer. Se ejecuta diariamente a las 8:00 AM (hora de Lima).

### Programación

```cron
# Vercel Cron
0 13 * * *  # UTC = 8:00 AM Lima (UTC-5)
```

### Flujo

```
Vercel Cron → GET /api/cron/send-emails 
→ Valida CRON_SECRET 
→ POST /notifications/cron/send-emails (Backend)
→ Backend envía emails via Gmail
```

### Implementación

```typescript
// src/app/api/cron/send-emails/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Valida que la petición venga de Vercel
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Reenvía al backend con X-Cron-Secret
  const response = await fetch(`${apiUrl}/notifications/cron/send-emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cron-Secret": cronSecret,
    },
  });

  return NextResponse.json(await response.json());
}
```

## warmup

### Propósito

El endpoint `/api/cron/warmup` mantiene las funciones Lambda "calientes" para evitar cold starts. Realiza un ping al backend para despertar el contenedor.

### Programación

```cron
# Vercel Cron
0 5 * * *  # UTC = 12:00 AM Lima (UTC-5)
```

### Implementación

```typescript
// src/app/api/cron/warmup/route.ts
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Valida que la petición venga de Vercel
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);

    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
    const response = await fetch(`${baseUrl}/`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return NextResponse.json({ ok: true, status: response.status });
  } catch {
    // Un error o timeout aquí no es crítico — el contenedor igual se despertó
    return NextResponse.json({ ok: true, warmed: false });
  }
}
```

## Seguridad

### Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `CRON_SECRET` | Secreto compartido entre Vercel y la app |
| `NEXT_PUBLIC_API_URL` | URL del backend FastAPI |

### Validación

Cada cron job valida el header `Authorization`:

```typescript
if (authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
```

###-header X-Cron-Secret

El frontend reenvía el secreto al backend mediante el header `X-Cron-Secret`, permitiendo que el backend autorice sin JWT.

## Configuración en Vercel

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "0 13 * * *"
    },
    {
      "path": "/api/cron/warmup",
      "schedule": "0 5 * * *"
    }
  ]
}
```

## Diferencias con Otros Endpoints

| Característica | Endpoints Normales | Cron Jobs |
|---------------|-------------------|----------|
| Autenticación | JWT (Bearer) | CRON_SECRET |
| Programación | Bajo demanda | Programada |
| Timeout | Default | maxDuration: 60s |
| Propósito | Interacción usuario | Tareas automate |

## Errores Comunes

| Error | Causa | Solución |
|-------|------|----------|
| 401 Unauthorized | CRON_SECRET incorrecto | Verificar variable en Vercel |
| 500 Backend error | Fallo en el backend | Revisar logs del backend |
| Timeout | Función fría | Usar warmup |

## Mejores Prácticas

1. **No exposing secrets**: El CRON_SECRET nunca se expone al cliente
2. **Retry logic**: Configurar reintentos en Vercel para fallos
3. **Logging**: Registrar ejecuciones en el backend
4. **Monitoring**: Alertas si el cron falla
