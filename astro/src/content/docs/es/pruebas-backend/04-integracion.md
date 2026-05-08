---
title: "Pruebas de Integración"
description: "Pruebas de integración: repositorios, servicios externos y mocks."
---

Las pruebas de integración verifican que los componentes del sistema interactúen correctamente con dependencias externas como bases de datos, servicios REST y otros sistemas. Estas pruebas utilizan mocks para simular dichas dependencias sin afectar sistemas reales.

## Archivos de Pruebas de Integración

Las pruebas de integración se encuentran en el directorio `infrastructure` y `application` de cada módulo:

| Módulo | Repositorios | Servicios |
|--------|-------------|----------|
| users | test_postgres_repo.py | test_jwt_service.py |
| documents | test_postgres_repo.py, test_qdrant_repo.py, test_supabase_storage.py, test_llama_parser.py, test_gemini_structured_extractor.py | test_document_service.py |
| templates | test_jinja_render.py | test_template_service.py, test_template_authoring_service.py, test_rendered_contract_formatter.py |
| chatbot | test_qdrant_repo.py, test_conversation_repo.py | test_chatbot_service.py, test_conversation_service.py |
| organizations | test_postgres_repo.py | test_organization_service.py |
| notifications | test_gmail_service.py | test_email_alert_service.py |
| integrations | | test_integration_service.py |
| shared | test_secrets_provider.py | test_config.py |

## Patrón de testing

Las pruebas de integración utilizan el patrón de **mocking** donde se simula el comportamiento de las dependencias externas:

```python
def _make_repo() -> tuple[SQLModelUserRepository, AsyncMock]:
    session = AsyncMock()
    repo = SQLModelUserRepository(session=session)
    return repo, session
```

Este patrón permite:
- Ejecutar pruebas sin base de datos real
- Controlar el comportamiento de las respuestas
- Verificar que se llamen los métodos correctos

## Users

### SQLModelUserRepository

Archivo: `users/infrastructure/test_postgres_repo.py`

| Test | Descripción |
|------|-------------|
| `test_returns_user_when_found` | Retorna usuario cuando existe |
| `test_pool_timeout_raises_service_unavailable` | Timeout de pool lanza error |

```python
@pytest.mark.asyncio
async def test_returns_user_when_found():
    repo, session = _make_repo()
    result_mock = MagicMock()
    user = _make_user()
    result_mock.first.return_value = user
    session.exec.return_value = result_mock

    result = await repo.get_by_email("worker@example.com")

    assert result == user
    session.exec.assert_called_once()
```

### SupabaseAuthService

Archivo: `users/infrastructure/test_jwt_service.py`

| Test | Descripción |
|------|-------------|
| `test_returns_external_user_dto_on_success` | Retorna usuario en éxito |
| `test_email_is_lowercased_and_stripped` | Email normalizado |
| `test_202_raises_unauthorized` | Código 202 es no autorizado |

```python
@pytest.mark.asyncio
async def test_returns_external_user_dto_on_success():
    payload = {"id": uid, "email": "user@example.com", "user_metadata": {...}}
    mock_client = AsyncMock()
    mock_client.get.return_value = _mock_response(200, payload)

    svc = _make_service(client=mock_client)
    result = await svc.get_authenticated_user("valid-token")

    assert result.email == "user@example.com"
```

## Documents

### SQLModelDocumentRepository

Archivo: `documents/infrastructure/test_postgres_repo.py`

| Test | Descripción |
|------|-------------|
| `test_returns_documents_for_query` | Búsqueda de documentos |
| `test_create_document` | Crear documento |
| `test_update_document` | Actualizar documento |
| `test_delete_document` | Eliminar documento |
| `test_search_returns_empty_when_not_found` | Sin resultados |
| `test_transaction_rollback_on_error` | Rollback en error |

### QdrantRepository

Archivo: `documents/infrastructure/test_qdrant_repo.py`

| Test | Descripción |
|------|-------------|
| `test_upsert_vectors` | Insertar vectores |
| `test_search_returns_matches` | Búsqueda de vectores |
| `test_delete_vectors` | Eliminar vectores |

### SupabaseStorage

Archivo: `documents/infrastructure/test_supabase_storage.py`

| Test | Descripción |
|------|-------------|
| `test_upload_file` | Subir archivo |
| `test_download_file` | Descargar archivo |
| `test_delete_file` | Eliminar archivo |

### LlamaParser

Archivo: `documents/infrastructure/test_llama_parser.py`

| Test | Descripción |
|------|-------------|
| `test_parse_pdf_to_markdown` | Convierte PDF a Markdown |
| `test_extract_tables_from_pdf` | Extrae tablas |

### GeminiStructuredExtractor

Archivo: `documents/infrastructure/test_gemini_structured_extractor.py`

| Test | Descripción |
|------|-------------|
| `test_extract_structured_data` | Extrae datos estructurados |
| `test_handle_parse_error` | Manejo de errores |

## Templates

### JinjaRenderer

Archivo: `templates/infrastructure/test_jinja_render.py`

| Test | Descripción |
|------|-------------|
| `test_render_simple_template` | Renderizado simple |
| `test_render_with_variables` | Renderizado con variables |
| `test_render_with_conditionals` | Condicionales |
| `test_render_with_loops` | Ciclos |

### TemplateService

Archivo: `templates/application/test_template_service.py`

| Test | Descripción |
|------|-------------|
| `test_create_template` | Crear plantilla |
| `test_update_template` | Actualizar plantilla |
| `test_list_templates` | Listar plantillas |

## Chatbot

### QdrantRepository (Chatbot)

Archivo: `chatbot/infrastructure/test_qdrant_repo.py`

| Test | Descripción |
|------|-------------|
| `test_upsert_conversation_vectors` | Insertar vectores de conversación |
| `test_search_similar_messages` | Buscar mensajes similares |

### ConversationRepository

Archivo: `chatbot/infrastructure/test_conversation_repo.py`

| Test | Descripción |
|------|-------------|
| `test_save_conversation` | Guardar conversación |
| `test_get_conversation_history` | Obtener historial |
| `test_append_message` | Agregar mensaje |

### ChatbotService

Archivo: `chatbot/application/test_chatbot_service.py`

| Test | Descripción |
|------|-------------|
| `test_create_conversation` | Crear conversación |
| `test_send_message` | Enviar mensaje |
| `test_get_conversation` | Obtener conversación |

## Organizations

### OrganizationRepository

Archivo: `organizations/infrastructure/test_postgres_repo.py`

| Test | Descripción |
|------|-------------|
| `test_create_organization` | Crear organización |
| `test_get_organization` | Obtener organización |
| `test_update_organization` | Actualizar organización |

## Notifications

### GmailService

Archivo: `notifications/infrastructure/test_gmail_service.py`

| Test | Descripción |
|------|-------------|
| `test_send_email` | Enviar email |
| `test_send_email_with_attachment` | Enviar con adjunto |

## Shared

### SecretsProvider

Archivo: `shared/infrastructure/test_secrets_provider.py`

| Test | Descripción |
|------|-------------|
| `test_get_secret` | Obtener secreto |
| `test_get_secret_not_found` | Secreto no encontrado |

## Características Comunes

Las pruebas de integración comparten estas características:

1. **Uso de AsyncMock**: Simulan sesiones de base de datos y clientes HTTP.
2. **Verificación de llamadas**: Asserts sobre qué métodos fueron llamados.
3. **Manejo de errores**: Prueban scenarios de error (timeouts, no encontrado).
4. **DTOs de entrada/salida**: Verifican la transformación de datos.

Estas pruebas constituyen la segunda capa de la pirámide de testing, después de las pruebas unitarias.