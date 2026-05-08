---
title: "Pruebas de API"
description: "Pruebas de endpoints HTTP: routers, dependencias y validación de contratos."
---

Las pruebas de API verifican que los endpoints HTTP funcionen correctamente según los contratos definidos en OpenAPI. Estas pruebas utilizan FastAPI como servidor de prueba y AsyncClient para realizar peticiones HTTP.

## Archivos de Pruebas de API

Las pruebas de API se encuentran en el directorio `api` de cada módulo:

| Módulo | Archivo |
|--------|---------|
| documents | test_routers.py |
| chatbot | test_conversation_router.py |
| integrations | test_routers.py, test_dependencies.py |

## Patrón de Testing

Las pruebas de API utilizan FastAPI con dependencias sobrescritas (dependency override):

```python
def _make_app(mock_service=None) -> FastAPI:
    app = FastAPI()
    app.include_router(router, prefix="/documents")
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, organization_id=1)

    if mock_service is not None:
        app.dependency_overrides[get_document_service] = lambda: mock_service

    return app
```

Este patrón permite:
- Probar endpoints sin autenticación real
- Simular servicios con respuestas controladas
- Verificar códigos de respuesta HTTP

## Documents

Archivo: `documents/api/test_routers.py`

### TestListDocuments

| Test | Descripción |
|------|-------------|
| `test_list_documents_returns_200` | Lista documentos exitosamente |
| `test_list_documents_filter_by_type` | Filtro por tipo |
| `test_list_documents_pagination` | Paginación |

```python
@pytest.mark.asyncio
async def test_list_documents_returns_200():
    docs = [_make_doc(1), _make_doc(2)]
    mock_query_service = AsyncMock()
    mock_query_service.get_documents.return_value = docs

    app = _make_app(mock_query_service=mock_query_service)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/documents")

    assert response.status_code == 200
```

### TestCreateDocument

| Test | Descripción |
|------|-------------|
| `test_create_document_returns_201` | Crea documento exitosamente |
| `test_create_document_validation_error` | Error de validación |
| `test_create_document_unauthorized` | Sin autorización |

### TestDeleteDocument

| Test | Descripción |
|------|-------------|
| `test_delete_document_returns_204` | Elimina exitosamente |
| `test_delete_document_not_found` | Documento no encontrado |

## Chatbot

Archivo: `chatbot/api/test_conversation_router.py`

### TestListConversations

| Test | Descripción |
|------|-------------|
| `test_forbids_listing_another_users_conversations` | Control de acceso |
| `test_lists_only_authenticated_users_conversations` | Solo propias |

```python
@pytest.mark.asyncio
async def test_forbids_listing_another_users_conversations():
    service = AsyncMock()
    current_user = SimpleNamespace(id=1, organization_id=1)
    app = _make_app(current_user=current_user, service=service)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/conversations/user/2")

    assert response.status_code == 403
    service.list_user_conversations.assert_not_awaited()
```

### TestGetConversation

| Test | Descripción |
|------|-------------|
| `test_returns_404_when_conversation_is_not_visible` | No visible |
| `test_returns_conversation_when_visible` | Visible |

## Integrations

Archivo: `integrations/api/test_routers.py`

### TestImportDriveFiles

| Test | Descripción |
|------|-------------|
| `test_import_route_queues_background_job_with_raw_payload` | Importación en background |
| `test_import_validates_payload` | Validación de payload |
| `test_import_returns_200` | Respuesta exitosa |

```python
@pytest.mark.asyncio
async def test_import_route_queues_background_job_with_raw_payload():
    app = _make_app()
    payload = {
        "token": {"token": "drive-token"},
        "files": [{"file_id": "drive-file-1", "document": {...}}}],
    }

    with patch("...process_drive_import_in_background", new_callable=AsyncMock) as mock:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/integrations/drive/import", json=payload)

    assert response.status_code == 200
    mock.assert_awaited_once_with(token, files_payload, org_id, user_id)
```

### TestDriveAuthUrl

| Test | Descripción |
|------|-------------|
| `test_returns_auth_url` | URL de autorización |
| `test_requires_authentication` | Requiere autenticación |

## Integraciones - Dependencies

Archivo: `integrations/api/test_dependencies.py`

Pruebas para las dependencias compartidas de API como autenticación, logging, y validación.

## Validación de Contratos

Las pruebas de API verifican que el backend cumpla con los contratos definidos en OpenAPI:

1. **Códigos de respuesta correctos**: 200, 201, 204, 400, 401, 403, 404, 500
2. **Estructura de respuesta**: El JSON coincide con el schema definido
3. **Validación de headers**: Content-Type, autenticación
4. **Parámetros requeridos**: Se validan correctamente

## Características Comunes

Las pruebas de API comparten estas características:

1. **AsyncClient**: Cliente HTTP asíncrono para testing.
2. **ASGITransport**: Transport de FastAPI para testing.
3. **Dependency Override**: Sobrescritura de dependencias.
4. **Verificación de Status**: Asserts en códigos HTTP.
5. **Verificación de JSON**: Asserts en cuerpo de respuesta.

Estas pruebas constituyen la tercera capa de la pirámide de testing, verificando la integración entre componentes a través de la capa HTTP.