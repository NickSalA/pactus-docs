---
title: Verificación con Google Cloud
description: Cómo se autentica y verifica el backend con cada servicio de Google y cuál es la arquitectura de integración.
---

El backend de **Pactus** no está desplegado en Google Cloud Platform, pero consume **tres servicios de Google** como parte de su operación. Cada uno usa un mecanismo de autenticación distinto y verifica las credenciales en momentos diferentes del ciclo de vida.

| Servicio | Propósito | Mecanismo de Autenticación |
|---|---|---|
| **Gemini** | Generación de lenguaje del chatbot y borradores de plantillas | API key vía `x-goog-api-key` |
| **Google Drive** | Importación de documentos desde Drive del usuario | OAuth 2.0 (authorization code flow) |
| **Gmail** | Envío de alertas por correo electrónico | SMTP con App Password |

---

## Google Gemini

### Configuración

La clave de API se define en la clase `Settings` de `Pactus-Backend/src/pactus_backend/shared/config.py`:

```python
GEMINI_API_KEY: str = Field(default=...)
```

La validación ocurre al arrancar la aplicación: si la variable `GEMINI_API_KEY` no está presente en `.env` o en el entorno, `pydantic-settings` lanza un `ValidationError` e impide que el servidor inicie.

### Inicialización del Cliente

El cliente de Gemini se construye en `modules/chatbot/infrastructure/agent/llm.py`:

```python
def get_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL_NAME,
        api_key=settings.GEMINI_API_KEY,
        temperature=settings.MODEL_TEMPERATURE,
    )
```

La verificación de la clave es **lazy**: la librería `langchain-google-genai` envía la clave como header `x-goog-api-key` en la primera llamada real (`ainvoke()`). No existe un health check ni validación proactiva al iniciar la aplicación.

### Puntos de Falla

| Situación | Comportamiento |
|---|---|
| Clave inválida | El primer `ainvoke()` falla con error HTTP 403. `LLMInitializationError` se propaga al chat |
| Cuota excedida | HTTP 429. El adapter del chatbot lo detecta y eleva `LLMQuotaExceededError` |
| Modelo no disponible | El error se captura como `Exception` genérica y se envuelve en `LLMInitializationError` |

### Limitaciones

- La clave es estática en `.env`. No hay rotación automática ni refresco.

---

## Google Drive (OAuth 2.0)

El flujo OAuth 2.0 es el mecanismo más complejo de verificación con Google en el proyecto. Permite que el usuario autorice al backend a leer archivos específicos de su Drive.

### Alcance Solicitado

```
https://www.googleapis.com/auth/drive.file
```

Es el alcance más restrictivo: solo da acceso a archivos que la aplicación crea o que el usuario selecciona explícitamente.

### Flujo de Verificación

```
Frontend                  Backend                        Google
   |                         |                              |
   |--- GET /auth-url -------|                              |
   |                         |--- Construye consent URL ---|
   |                         |<-- URL ---------------------|
   |<-- URL -----------------|                              |
   |                                                       |
   |--- Usuario autoriza ---------------------------------|
   |<-- Código OAuth -------------------------------------|
   |                                                       |
   |--- GET /callback?code --|                             |
   |                         |--- POST /token -------------|
   |                         |<-- token_dict --------------|
   |<-- token_dict ----------|                             |
   |                                                       |
   |--- POST /import(token, files)                         |
   |                         |--- GET /drive/v3/files ----|
```

### Puntos de Verificación

**1. Generación de URL (`GET /integrations/drive/auth-url`)**

No hay verificación con Google en este paso. El backend construye la URL de consentimiento con `google_auth_oauthlib.flow.Flow.authorization_url()`. La URL incluye `access_type=offline` para obtener un refresh token.

```python
auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline")
```

**2. Intercambio de Código (`GET /integrations/drive/callback?code=...`)**

El backend envía el código de autorización a `https://oauth2.googleapis.com/token` mediante `flow.fetch_token(code=...)`. Google valida el código y devuelve un token dict con `access_token`, `refresh_token`, `scopes` y metadatos del cliente.

Si el código es inválido o expiró, el backend responde con `InvalidCloudTokenError` (HTTP 401).

**3. Llamadas a la API de Drive**

Cada operación (listar, descargar, obtener metadatos) reconstruye un objeto `Credentials` desde el token dict y ejecuta el llamado REST contra `https://www.googleapis.com/drive/v3/files`.

```python
creds = Credentials(**token)
service = build("drive", "v3", credentials=creds)
```

Errores posibles:

| Código HTTP de Google | Error Interno |
|---|---|
| 401 / 403 | `InvalidCloudTokenError` |
| 404 | `CloudFileNotFoundError` |
| Otros | `CloudStorageIntegrationError` |

### Token Lifecycle

- El `access_token` tiene una validez de **1 hora** (por defecto de Google).
- Aunque se solicita `access_type=offline` y Google devuelve un `refresh_token`, el backend **no implementa refresco automático**. Cuando el access token expira, la siguiente llamada a Drive falla con `InvalidCloudTokenError`.
- Los tokens no se persisten en base de datos. El backend los recibe desde el frontend en cada request de importación.

### Limitaciones Conocidas

| Limitación | Impacto |
|---|---|
| Sin refresh automático de token | La importación falla si el token expiró (1 hora) |
| Sin persistencia server-side | El frontend debe almacenar y reenviar el token |
| Sin validación proactiva | No se verifica el token hasta el primer uso |

---

## Gmail SMTP

### Configuración

```python
GMAIL_SENDER: str | None = Field(default=None)
GMAIL_APP_PASSWORD: str | None = Field(default=None)
```

Ambos campos son opcionales. Si no están configurados, el envío de alertas por correo no estará disponible.

### Verificación

El backend usa `smtplib.SMTP_SSL` para conectarse a `smtp.gmail.com:465`. La verificación ocurre en `server.login(sender, password)` al momento de enviar cada correo.

```python
with smtplib.SMTP_SSL(_GMAIL_HOST, _GMAIL_PORT) as server:
    server.login(self.sender, self.password)
    server.send_message(msg)
```

Si la contraseña de aplicación es incorrecta, `smtplib` lanza `SMTPAuthenticationError` y el backend lo traduce a `BadGatewayError`.

### Limitaciones

- La verificación es **por envío**: si las credenciales son inválidas, el error se descubre al enviar la primera alerta, no al iniciar el servidor.

---

## Variables de Entorno Relacionadas

| Variable | Servicio | Requerida |
|---|---|---|
| `GEMINI_API_KEY` | Gemini | Sí |
| `GOOGLE_CLIENT_ID` | Drive OAuth | Sí |
| `GOOGLE_CLIENT_SECRET` | Drive OAuth | Sí |
| `GOOGLE_REDIRECT_URI` | Drive OAuth | Sí |
| `GMAIL_SENDER` | Gmail SMTP | No |
| `GMAIL_APP_PASSWORD` | Gmail SMTP | No |

Todas se definen en `Pactus-Backend/.env` y se leen desde la clase `Settings` en `shared/config.py`.

---

## Arquitectura de Integración

Cada servicio de Google está encapsulado en un módulo separado, siguiendo la arquitectura de capas del backend:

| Servicio | Módulo | Provider / Infraestructura |
|---|---|---|
| Google Drive | `modules/integrations/` | `infrastructure/google_drive_provider.py` → `GoogleDriveProvider` implementa `ICloudIntegrationProvider` |
| Gemini | `modules/chatbot/` y `modules/templates/` | `infrastructure/agent/llm.py` y `infrastructure/gemini_draft_generator.py` |
| Gmail | `modules/notifications/` | `infrastructure/gmail_service.py` → `GmailService` |

### Provider Pattern (Google Drive)

La integración con Drive sigue el patrón **Provider** con una interfaz abstracta `ICloudIntegrationProvider` que define las operaciones de almacenamiento en la nube:

```
ICloudIntegrationProvider (interfaz)
  └── GoogleDriveProvider (implementación concreta)
       ├── get_auth_url()
       ├── exchange_code_for_token()
       ├── list_files()
       ├── get_file_metadata()
       └── download_file()
```

El `IntegrationService` en la capa de aplicación orquesta el flujo: obtiene la URL de autorización, intercambia códigos, y coordina la importación en segundo plano con notificaciones vía SSE.

### Gemini (Uso Directo)

Gemini no usa provider pattern. La librería `langchain-google-genai` se instancia directamente en los módulos que la necesitan:

- `modules/chatbot/infrastructure/agent/llm.py` → LLM del agente conversacional
- `modules/templates/infrastructure/gemini_draft_generator.py` → Generación de borradores

Ambos comparten la misma configuración (`GEMINI_API_KEY`, `GEMINI_MODEL_NAME`) desde `Settings`.

### Gmail (SMTP Directo)

El envío de correos usa `smtplib` de la biblioteca estándar de Python, sin dependencias externas de Google. No hay SDK ni cliente especializado.

---

## Resumen de Verificación

| Servicio | Momento de Verificación | ¿Proactivo? |
|---|---|---|
| Gemini | Primer llamado a `ainvoke()` | No |
| Drive (auth code) | `fetch_token()` en `/callback` | Sí |
| Drive (API calls) | Cada request a Drive REST API | Sí (por request) |
| Gmail | Cada `server.login()` al enviar | No |

Ninguno de los tres servicios valida sus credenciales al arrancar la aplicación. Las fallas se descubren en el primer uso, no en el deploy.
