---
title: Contratos API
description: Definición formal de los contratos HTTP entre el frontend desplegado en Vercel y el backend implementado en FastAPI.
---

Los contratos API de **ContractIA** son la definición formal de cómo se comunican el frontend y el backend. En términos prácticos, establecen qué petición puede enviar el cliente desplegado en **Vercel**, qué parámetros y cuerpos acepta **FastAPI**, qué código HTTP devuelve el servidor y qué estructura debe tener cada respuesta.

Este contrato evita ambigüedades entre equipos: el frontend no "adivina" payloads y el backend no responde con formatos improvisados. Ambos implementan exactamente lo que quedó descrito en OpenAPI.

## Fuente de Verdad

La fuente oficial de estos contratos vive en los archivos YAML del proyecto:

- `docs/openapi.yaml`: índice principal de rutas, seguridad y tags.
- `docs/modules/*/paths.yaml` y `docs/modules/*/paths/*.yaml`: definición de endpoints por módulo.
- `docs/modules/*/schemas/schema.yaml`: definición de request y response bodies.
- `docs/schemas/errors.yaml`: contrato común de errores.

## Qué Fija un Contrato API

Cada contrato deja por escrito cinco elementos:

1. La ruta y el método HTTP, por ejemplo `POST /chatbot`.
2. Los parámetros obligatorios, ya sea en `path`, `query` o headers.
3. El tipo de body permitido, como `application/json` o `multipart/form-data`.
4. La forma exacta del JSON de respuesta y sus códigos HTTP.
5. Los errores esperados, como `400`, `401`, `404` o `500`.

En **ContractIA**, además, la API declara autenticación global mediante `BearerAuth`, por lo que el frontend debe enviar el token JWT cuando el endpoint lo requiera.

## Contratos Vigentes

### Chatbot

- `POST /chatbot` (`sendChatMessage`)
  Recibe `ChatRequest` y devuelve `ChatResponse`.
  Request JSON:

```json
{
  "message": "Resume las clausulas de renovacion",
  "thread_id": 12
}
```

  Response `200`:

```json
{
  "response": "La clausula de renovacion establece una prorroga automatica de 12 meses.",
  "thread_id": 12
}
```

  Errores documentados: `400`, `401`, `413`, `429`, `500`, `502`, `503`, `504`.

### Usuarios

- `POST /user` (`createUser`)
  Recibe `UserCreateRequest` y devuelve `UserResponse`.

```json
{
  "email": "ana@example.com",
  "password": "securePassword123",
  "role": "admin"
}
```

  Response `201`:

```json
{
  "id": 14,
  "email": "ana@example.com",
  "role": "admin"
}
```

- `GET /user` (`listUsers`)
  Devuelve `UserListResponse`, es decir, un arreglo de usuarios.

- `GET /user/{id}` (`getUser`)
  Requiere el parámetro de ruta `id` y devuelve `UserResponse`.

- `PATCH /user/{id}` (`updateUser`)
  Requiere `id` y recibe `UserUpdateRequest`.
  Response `200`: `UserResponse`.

- `DELETE /user/{id}` (`deleteUser`)
  Requiere `id`.
  Response `204`: sin body.

### Documentos

- `POST /documents` (`createDocument`)
  Este endpoint es una excepción importante: no usa JSON, sino `multipart/form-data`.
  El contrato `DocumentCreateRequest` exige:

  - `file`
  - `name`
  - `client`
  - `type`
  - `start_date`
  - `end_date`
  - `value`
  - `currency`
  - `licenses`

  Response `201`: `DocumentResponse`.

- `GET /documents` (`getAllDocuments`)
  Devuelve `DocumentListResponse`, una lista de documentos con campos como `id`, `name`, `client`, `type`, `start_date`, `end_date`, `value`, `currency`, `licenses` y `state`.

- `DELETE /documents/{id}` (`deleteDocument`)
  Requiere `id`.
  Response `204`: sin body.

### Conversaciones

- `GET /conversations` (`getAllConversations`)
  Devuelve `ConversationListResponse`, una lista de conversaciones del usuario autenticado.

- `GET /conversations/{id}` (`getConversationHistory`)
  Requiere `id` y devuelve `ConversationResponse`.
  La respuesta incluye `id`, `title`, `created_at` y `content`, donde `content` es un arreglo de mensajes con `sender` y `message`.

### Integraciones con Google Drive

- `GET /integrations/drive/auth-url` (`getDriveAuthUrl`)
  Devuelve `AuthURLResponse`.

```json
{
  "url": "https://accounts.google.com/o/oauth2/auth?..."
}
```

- `GET /integrations/drive/callback` (`exchangeDriveCode`)
  Requiere el query param `code`.
  Response `200`: `TokenResponse`.

```json
{
  "token": "ya29.a0AfH6S...",
  "refresh_token": "1//0gExample",
  "token_uri": "https://oauth2.googleapis.com/token",
  "client_id": "google-client-id",
  "client_secret": "google-client-secret",
  "scopes": [
    "https://www.googleapis.com/auth/drive.readonly"
  ]
}
```

- `POST /integrations/drive/import` (`importDriveFiles`)
  Recibe `ImportRequest` y devuelve `ImportResponse`.

```json
{
  "token": {
    "access_token": "ya29.a0AfH6S..."
  },
  "files": [
    {
      "file_id": "1AbCdEfGh",
      "document": {
        "name": "Contrato Marco 2026",
        "type": "SERVICIOS"
      }
    }
  ]
}
```

  Response `200`:

```json
{
  "message": "Importacion iniciada",
  "queued_files": 1,
  "index_name": "organization-12"
}
```

### Notificaciones

- `GET /notifications` (`listNotifications`)
  Devuelve un arreglo de `NotificationResponse`.

```json
[
  {
    "id": "notif-001",
    "document_id": 7,
    "type": "WARNING",
    "title": "Contrato proximo a vencer",
    "description": "El contrato con Acme Corp vence en 15 dias.",
    "days_remaining": 15
  }
]
```

- `POST /notifications` (`sendNotificationAlerts`)
  No declara request body en el contrato actual.
  Response `200`:

```json
{
  "emails_sent": 24
}
```

### Plantillas y Generacion de Contratos

- `GET /templates` (`listTemplates`)
  Devuelve una lista de `TemplateResponse`.

- `GET /templates/{template_id}` (`getTemplate`)
  Requiere `template_id` y devuelve `TemplateResponse`.

```json
{
  "id": 3,
  "name": "Contrato de prestacion de servicios",
  "description": "Plantilla base corporativa",
  "content": {
    "body_md": "# Contrato\n\nEntre las partes..."
  }
}
```

- `POST /templates/{template_id}/generate` (`generateTemplateDocument`)
  Requiere `template_id`.
  El contrato actual acepta `application/json` con un body tipado como `object`.
  Response `201`: `GeneratedDocumentResponse`.

```json
{
  "id": 81,
  "name": "Contrato Acme Corp 2026",
  "file_url": "https://files.contractia.dev/contracts/81.pdf",
  "client": "Acme Corp"
}
```

## Contrato Unificado de Errores

Cuando FastAPI devuelve un error, el frontend no debería procesarlo como texto libre, sino como un objeto estructurado. El archivo `docs/schemas/errors.yaml` define contratos comunes como `ValidationError`, `AuthenticationError`, `NotFoundError` e `InternalServerError`.

Ejemplo de error de validacion:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Uno o mas campos no son validos.",
  "details": {},
  "traceId": "req-7f9c2a1b",
  "type": "validation_error",
  "fieldErrors": [
    {
      "field": "email",
      "message": "El campo email es obligatorio."
    }
  ]
}
```

## Observaciones del Contrato Actual

Los YAML ya dejan cerrados los nombres de rutas, métodos, códigos de respuesta y la mayoría de esquemas principales. Sin embargo, hay contratos que todavía tienen tipado abierto y deberían endurecerse si se busca una integración completamente estricta:

1. `POST /templates/{template_id}/generate` acepta un body `type: object`, pero aún no define propiedades obligatorias.
2. `POST /integrations/drive/import` define `token` como un `object` genérico, sin una estructura interna cerrada.
3. `POST /notifications` no declara request body, por lo que actualmente el contrato solo fija la respuesta.

Mientras estos puntos no se detallen en OpenAPI, el acuerdo entre Vercel y FastAPI en esos casos seguirá siendo parcial.

## Regla de Gobierno

En este proyecto, un cambio de integración no debería empezar en el código, sino en el contrato:

1. Primero se actualiza el YAML de OpenAPI.
2. Después se adapta FastAPI para cumplirlo.
3. Luego el frontend en Vercel consume exactamente ese esquema.
4. Finalmente se valida el contrato con Redocly para asegurar consistencia.

De este modo, los archivos YAML no son documentación decorativa: son el acuerdo técnico que controla la comunicación entre ambas capas del sistema.
