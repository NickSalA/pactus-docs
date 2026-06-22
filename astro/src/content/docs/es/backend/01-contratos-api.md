---
title: Contratos API
description: Definición formal de los contratos HTTP entre el frontend y el backend implementado en FastAPI.
---

Los contratos API de **Pactus** describen cómo se comunican el frontend y el backend en términos concretos: qué ruta existe, qué método HTTP utiliza, qué body acepta, qué respuesta devuelve y qué restricciones de acceso aplica.

En la práctica, este contrato evita ambigüedades entre equipos. El frontend no debería adivinar payloads ni respuestas, y el backend no debería exponer formatos distintos a los que han quedado documentados.

## Fuente de Verdad

La fuente de verdad de la API vive en dos capas complementarias:

- el backend real en `Pactus-Backend/src/pactus_backend/modules/*/api/routers*.py`
- la especificación OpenAPI del repositorio en `docs/openapi.yaml` y `docs/modules/**/*.yaml`
- el bundle para visualizadores Swagger/OpenAPI en `openapi.bundle.yaml`

El objetivo de esta documentación es que esas capas queden alineadas. Para consumo en Swagger o herramientas que no resuelven referencias locales, debe usarse `openapi.bundle.yaml`.

## Estructura General de la API

La aplicación FastAPI monta actualmente sus rutas directamente en raíz. Es decir, los endpoints reales parten de prefijos como:

- `/chatbot`
- `/documents`
- `/conversations`
- `/dashboard`
- `/integrations`
- `/services`
- `/folders`
- `/organizations`
- `/notifications`
- `/templates`
- `/user`
- `/billing`
- `/audit`

Aunque la configuración del backend define `GLOBAL_PREFIX`, ese prefijo no se aplica hoy sobre los routers montados por la aplicación.

### Endpoints Raíz

El backend expone algunos endpoints directamente en la raíz, sin prefijo de módulo:

- `GET /`
  Endpoint de verificación. Devuelve un mensaje de bienvenida y la versión de la aplicación.

  ```json
  {
    "message": "¡Bienvenido a Pactus!",
    "version": "0.5.0"
  }
  ```

- `GET /perf-test-data`
  Endpoint de prueba de rendimiento sin base de datos ni autenticación. Devuelve datos mock para medir latencia.

- `POST /perf-render-template`
  Simula el renderizado de una plantilla sustituyendo variables. Acepta un payload JSON con campos como `company`, `client`, `value`, `currency`.

## Contratos Vigentes

### Usuario autenticado

- `GET /user/me`
  Devuelve el perfil del usuario autenticado a partir del token Bearer validado contra Supabase.

Respuesta típica:

```json
{
  "id": 19,
  "organization_id": 2,
  "supabase_user_id": "7d7c0d7e-4d4f-4e6f-9c08-6f20b4f17d4c",
  "email": "ana@empresa.com",
  "full_name": "Ana Torres",
  "avatar_url": null,
  "role": "ADMIN",
  "receives_notifications": true,
  "is_active": true,
  "created_at": "2026-04-05T10:00:00Z",
  "updated_at": "2026-04-05T10:00:00Z"
}
```

El router `/login` existe en la aplicación, pero actualmente no expone endpoints propios documentables.

### Chatbot

- `POST /chatbot`
  Recibe `ChatRequest` y devuelve `ChatResponse`.

Request JSON:

```json
{
  "message": "Resume las cláusulas de renovación",
  "thread_id": 12
}
```

Response `200`:

```json
{
  "response": "La cláusula establece una prórroga automática de 12 meses.",
  "thread_id": 12
}
```

### Documentos

El módulo documental es uno de los contratos más importantes del sistema. Su comportamiento real ya no coincide con la estructura histórica que exponía campos planos como `value`, `currency` o `licenses` al nivel raíz.

- `POST /documents`
  Crea un documento nuevo usando `multipart/form-data`.

El body real contiene:

- `file`: archivo binario
- `document`: string JSON serializado con el payload documental

Ejemplo conceptual del campo `document`:

```json
{
  "name": "Contrato Marco 2026",
  "client": "Acme Corp",
  "type": "COMPANY",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "form_data": {
    "value": 15000,
    "currency": "USD"
  },
  "folder_id": 3,
  "service_items": [
    {
      "service_id": 5,
      "description": "Administración integral",
      "value": 15000,
      "currency": "USD",
      "start_date": "2026-01-01",
      "end_date": "2026-12-31"
    }
  ]
}
```

- `GET /documents`
  Devuelve la lista de documentos visibles para el usuario autenticado dentro de su organización.

- `GET /documents/{document_id}`
  Devuelve el detalle completo de un documento.

- `PATCH /documents/{document_id}`
  Actualiza un documento existente. Utiliza también `multipart/form-data`, con un campo `document` serializado y un archivo opcional `file`.

- `DELETE /documents/{document_id}`
  Elimina el documento y sus recursos asociados.

- `GET /documents/{document_id}/file-url`
  Devuelve una URL firmada temporal para acceder al archivo almacenado en Supabase Storage.

Response típica de documento:

```json
{
  "id": 33,
  "name": "Contrato Marco 2026",
  "client": "Acme Corp",
  "type": "COMPANY",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "form_data": {
    "value": 15000,
    "currency": "USD"
  },
  "state": "ACTIVE",
  "folder_id": 3,
  "file_path": "orgs/2/company/docs/33/contrato_marco_2026.pdf",
  "file_name": "Contrato Marco 2026.pdf",
  "service_items": [
    {
      "id": 97,
      "service_id": 5,
      "description": "Administración integral",
      "value": 15000,
      "currency": "USD",
      "start_date": "2026-01-01",
      "end_date": "2026-12-31"
    }
  ],
  "created_at": "2026-04-12T14:20:00Z",
  "updated_at": "2026-04-12T14:20:00Z"
}
```

### Conversaciones

- `GET /conversations/user/{user_id}`
  Lista las conversaciones de un usuario concreto. El backend valida que `user_id` coincida con el usuario autenticado.

- `GET /conversations/{conversation_id}`
  Devuelve el detalle de una conversación concreta.

- `PATCH /conversations/{conversation_id}`
  Actualiza el título de una conversación existente.

  Request JSON:

  ```json
  {
    "title": "Nuevo título de la conversación"
  }
  ```

- `DELETE /conversations/{conversation_id}`
  Elimina una conversación existente. Responde con código 204 sin contenido.

La respuesta real del historial conversacional utiliza mensajes con esta estructura:

```json
[
  {
    "role": "user",
    "content": "¿Cuáles son las cláusulas principales?",
    "timestamp": "2026-04-10T10:00:00Z"
  },
  {
    "role": "bot",
    "content": "Las cláusulas principales son...",
    "timestamp": "2026-04-10T10:00:02Z"
  }
]
```

### Integraciones con Google Drive

El frontend utiliza **Google Picker API** para la selección visual de archivos. El flujo de autenticación es mediante **Google Identity Services (GIS)** con popup OAuth y scope `https://www.googleapis.com/auth/drive.file`, no redirects tradicionales.

**Flujo actual:**
1. Frontend abre Google Picker con `DocsView` y `MULTISELECT_ENABLED`
2. Usuario autoriza acceso limitado a archivos seleccionados con `drive.file`
3. Usuario selecciona archivos (carpetas excluidas)
4. Google retorna `access_token` + `expires_in` directamente al frontend
5. Frontend envía `POST /integrations/drive/import` con el token

**Endpoints:**

- `GET /integrations/drive/auth-url`
  Genera URL de autorización OAuth (flujo legacy, no usado por frontend actual)

- `GET /integrations/drive/callback`
  Intercambia código OAuth por token (flujo legacy, no usado por frontend actual)

- `POST /integrations/drive/import`
  Encola importación en segundo plano. El payload incluye metadata documental reutilizando el modelo de documento en borrador.

  Payload ejemplo:
  ```json
  {
    "token": {
      "token": "ya29.a0AfH6...",
      "scopes": ["https://www.googleapis.com/auth/drive.file"]
    },
    "files": [
      {
        "file_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
        "document": {
          "name": "Contrato 2026",
          "contract_type": "COMPANY",
          "company_contract": { "client": "Acme S.A.C.", "ruc": "20600000001" },
          "form_data": { "value": 1200, "currency": "PEN" }
        }
      }
    ]
  }
  ```

  Respuesta:
  ```json
  {
    "message": "La importación ha comenzado en segundo plano.",
    "queued_files": 1,
    "index_name": "drive_contracts_index",
    "job_id": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

- `GET /integrations/drive/import/{job_id}/events`
  Stream SSE para seguir progreso de importación. Requiere autenticación Bearer.

  Eventos:
  - `initial_state`: Estado inicial del job
  - `file_update`: Actualización por archivo (fases: PENDING → DATABASE → KNOWLEDGE_BASE → COMPLETED)
  - `job_complete`: Job finalizado
  - `ping`: Keep-alive

### Dashboard

El módulo de dashboard expone endpoints analíticos para visualizar métricas contractuales. Se divide en vistas para empresa (COMPANY) y laborales (LABOR). Todos requieren autenticación Bearer JWT.

- `GET /dashboard/area_chart/company`
  Devuelve datos del gráfico de áreas para contratos de empresa.

- `GET /dashboard/area_chart/labor`
  Devuelve datos del gráfico de áreas para contratos laborales.

- `GET /dashboard/alert_center/company`
  Devuelve categorías de alertas para contratos de empresa.

- `GET /dashboard/alert_center/labor`
  Devuelve categorías de alertas para contratos laborales.

- `GET /dashboard/recent_contracts/company`
  Lista contratos de empresa recientemente actualizados.

- `GET /dashboard/recent_contracts/labor`
  Lista contratos laborales recientemente actualizados.

- `GET /dashboard/top_companies`
  Ranking de empresas contratistas. Acepta parámetros `currency` y `sort_by` (VOLUME o VALUE).

- `GET /dashboard/top_services`
  Ranking de servicios contratados. Acepta parámetros `currency` y `sort_by`.

- `GET /dashboard/retention/labor`
  Dashboard de retención laboral.

- `GET /dashboard/origin/labor`
  Distribución de origen de contratos laborales.

- `GET /dashboard/loyalty/company`
  Dashboard de fidelidad de clientes empresa.

### Catálogo de Servicios

- `GET /services`
  Lista el catálogo de servicios de la organización actual.

- `POST /services`
  Crea un nuevo servicio de catálogo.

- `PATCH /services/{service_id}`
  Actualiza un servicio existente.

- `DELETE /services/{service_id}`
  Elimina un servicio del catálogo.

### Carpetas

- `GET /folders`
  Lista las carpetas visibles para el usuario autenticado.

- `POST /folders`
  Crea una carpeta en el ámbito del rol actual.

- `PATCH /folders/{folder_id}`
  Actualiza una carpeta existente.

- `DELETE /folders/{folder_id}`
  Elimina una carpeta si no tiene contratos asociados y si el usuario puede administrarla.

### Miembros de la Organización

- `GET /organizations/me/members`
  Lista los miembros de la organización del usuario actual.

- `POST /organizations/me/members`
  Crea un nuevo miembro dentro de la organización actual.

- `PATCH /organizations/me/members/{member_id}/role`
  Actualiza el rol de un miembro.

- `PATCH /organizations/me/members/{member_id}/notifications`
  Actualiza si un miembro debe recibir alertas contractuales.

### Facturación (Billing)

El módulo de facturación gestiona suscripciones, pagos y límites operativos por organización.

- `POST /billing/paypal/subscriptions/confirm`
  Confirma una suscripción aprobada en PayPal. Crea una organización placeholder y registra como ADMIN al correo usado en el checkout. Endpoint público (no requiere JWT).

  Request:
  ```json
  {
    "subscription_id": "I-0A1B2C3D4E5F",
    "email": "admin@empresa.com"
  }
  ```

  Response `201`:
  ```json
  {
    "organization_id": 15,
    "admin_email": "admin@empresa.com",
    "paypal_subscription_id": "I-0A1B2C3D4E5F"
  }
  ```

- `GET /billing/subscriptions`
  Devuelve la suscripción actual de la organización del usuario autenticado. Requiere rol ADMIN.

  Response `200`:
  ```json
  {
    "id": 1,
    "organization_id": 2,
    "paypal_subscription_id": "I-0A1B2C3D4E5F",
    "status": "ACTIVE",
    "plan_tier": "PRO",
    "current_period_start": "2026-06-01T00:00:00Z",
    "current_period_end": "2026-07-01T00:00:00Z"
  }
  ```

- `POST /billing/subscriptions/cancel`
  Cancela la suscripción activa de la organización. Requiere rol ADMIN.

- `GET /billing/limits`
  Devuelve los límites operativos actuales de la organización del usuario autenticado.

  Response `200`:
  ```json
  {
    "max_users": 25,
    "max_documents": 1000,
    "max_storage_mb": 2000,
    "max_file_size_mb": 25,
    "max_monthly_ai_queries": 2000,
    "notify_at_percentage": 80
  }
  ```

- `PATCH /billing/limits`
  Actualiza los límites operativos de una organización. Solo accesible por SUPERADMIN.

### Notificaciones

- `GET /notifications`
  Devuelve las alertas que aplican al usuario autenticado para el día actual.

- `POST /notifications/send-email-alerts`
  Dispara manualmente el envío consolidado de correos de vencimiento para la organización actual. Requiere permisos de administrador.

- `POST /notifications/cron/send-emails`
  Ejecuta el envío masivo diario de correos para todas las organizaciones. Este endpoint no usa JWT: se protege con el header `X-Cron-Secret`.

- `GET /notifications/rules`
  Lista las reglas de alerta de la organización actual.

- `POST /notifications/rules`
  Crea una nueva regla de alerta.

- `PATCH /notifications/rules/{rule_id}`
  Actualiza una regla existente.

- `DELETE /notifications/rules/{rule_id}`
  Elimina una regla.

El tipo real de notificación se devuelve en minúsculas, porque ese valor se alinea con el frontend:

- `info`
- `warning`
- `critical`

### Plantillas

El módulo de plantillas expone hoy más rutas de las que tenía documentadas originalmente.

- `GET /templates`
  Lista las plantillas disponibles para la organización actual.

- `POST /templates`
  Crea una plantilla nueva.

- `GET /templates/{template_id}`
  Devuelve el detalle de una plantilla concreta.

- `PATCH /templates/{template_id}`
  Actualiza una plantilla en borrador.

- `POST /templates/{template_id}/generate`
  Genera un documento persistido a partir de una plantilla y un payload de `form_data`.

- `GET /templates/formats`
  Lista los formatos de plantilla disponibles según rol y tipo documental.

- `POST /templates/drafts`
  Genera y persiste un borrador de plantilla desde prompt, archivo o ambos.

- `POST /templates/preview`
  Previsualiza una plantilla sin persistirla.

- `POST /templates/{template_id}/publish`
  Publica una plantilla.

- `POST /templates/{template_id}/archive`
  Archiva una plantilla.

La respuesta de `generate` no es un objeto simplificado ad hoc. El backend devuelve un documento persistido con el mismo shape base del módulo documental.

### Auditoría

El módulo de auditoría registra la actividad del sistema. Todos los endpoints requieren rol `ADMIN`.

- `GET /audit/contracts`
  Lista la actividad sobre contratos. Solo accesible por administradores.

- `GET /audit/users`
  Lista la actividad de usuarios. Solo accesible por administradores.

- `GET /audit/templates`
  Lista la actividad sobre plantillas. Solo accesible por administradores.

- `GET /audit/chatbot`
  Lista la actividad del chatbot. Solo accesible por administradores.

## Reglas de Seguridad Relevantes

Aunque OpenAPI define la API a nivel formal, hay tres reglas prácticas que esta documentación debe reflejar siempre:

1. La mayoría de endpoints usa autenticación Bearer JWT validada contra Supabase.
2. `GET /integrations/drive/auth-url` y `GET /integrations/drive/callback` son públicos.
3. `POST /notifications/cron/send-emails` se protege con `X-Cron-Secret`, no con JWT.

## Regla de Gobierno

En este proyecto, un cambio de integración no debería empezar en el frontend, sino en el contrato:

1. Primero se actualiza el backend o se confirma el comportamiento real.
2. Después se alinea `docs/openapi.yaml` y sus módulos.
3. Luego se actualiza la documentación narrativa de `astro`.
4. Finalmente el frontend consume el contrato resultante.

De este modo, la documentación no actúa como adorno, sino como una representación fiel del sistema en producción.
