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
- `/integrations`
- `/services`
- `/folders`
- `/organizations`
- `/notifications`
- `/templates`
- `/user`

Aunque la configuración del backend define `GLOBAL_PREFIX`, ese prefijo no se aplica hoy sobre los routers montados por la aplicación.

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

- `GET /integrations/drive/auth-url`
  Devuelve la URL de autorización de Google Drive.

- `GET /integrations/drive/callback`
  Recibe el `code` OAuth y devuelve el token autenticado.

- `POST /integrations/drive/download/{file_id}`
  Descarga el binario de un archivo de Drive a partir de un token válido.

- `POST /integrations/drive/import`
  Encola la importación en segundo plano de uno o varios archivos de Google Drive hacia el pipeline documental del sistema.

El payload de importación permite adjuntar metadata documental rica, porque cada entrada de `files[]` reutiliza el modelo de documento en borrador del backend.

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
