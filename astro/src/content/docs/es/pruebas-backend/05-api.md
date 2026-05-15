---
title: "Pruebas de API"
description: "Pruebas de endpoints HTTP: routers, dependencias y validación de contratos."
---

Las pruebas de API verifican que los endpoints HTTP funcionen correctamente según los contratos esperados por el backend. Estas pruebas utilizan FastAPI como servidor de prueba y `AsyncClient` con `ASGITransport` para realizar peticiones HTTP sin levantar un servidor real.

## Archivos de Pruebas de API

Las pruebas de API se encuentran en el directorio `api` de cada módulo:

| Módulo | Archivo |
|--------|---------|
| documents | `test_routers.py` |
| chatbot | `test_conversation_router.py` |
| dashboard | `test_routers.py`, `test_dashboard_auth_and_params.py` |
| integrations | `test_routers.py`, `test_dependencies.py` |

## Patrón de Testing

Las pruebas de API utilizan FastAPI con dependencias sobrescritas mediante dependency override:

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

- Probar endpoints sin autenticación real.
- Simular servicios con respuestas controladas.
- Verificar códigos de respuesta HTTP.
- Validar estructura JSON de respuestas.
- Probar errores sin depender de infraestructura externa.

## Documents

Archivo: `documents/api/test_routers.py`

### Listado y Consulta de Documentos

| Test | Descripción |
|------|-------------|
| `test_list_documents_returns_200` | Lista documentos exitosamente |
| `test_list_services_returns_200` | Lista servicios disponibles para documentos |
| `test_get_document_returns_200` | Obtiene un documento existente |
| `test_get_document_not_found_returns_404` | Retorna 404 cuando el documento no existe |

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

### Creación de Documentos

| Test | Descripción |
|------|-------------|
| `test_create_document_returns_201` | Crea documento exitosamente |
| `test_create_document_invalid_json_returns_400` | Retorna 400 cuando el payload JSON es inválido |
| `test_create_document_accepts_missing_document_payload` | Acepta creación cuando falta el payload opcional de documento |

### Eliminación de Documentos

| Test | Descripción |
|------|-------------|
| `test_delete_document_returns_204` | Elimina documento exitosamente |
| `test_delete_document_not_found_returns_404` | Retorna 404 cuando el documento no existe |

### Archivos y Actualización

| Test | Descripción |
|------|-------------|
| `test_get_file_url_returns_200` | Retorna URL firmada del archivo |
| `test_get_file_url_no_file_returns_404` | Retorna 404 cuando el archivo no existe |
| `test_update_document_returns_200` | Actualiza documento exitosamente |
| `test_update_document_not_found_returns_404` | Retorna 404 cuando el documento a actualizar no existe |

## Chatbot

Archivo: `chatbot/api/test_conversation_router.py`

### Conversaciones

| Test | Descripción |
|------|-------------|
| `test_forbids_listing_another_users_conversations` | Impide listar conversaciones de otro usuario |
| `test_lists_only_authenticated_users_conversations` | Lista solo conversaciones del usuario autenticado |
| `test_returns_404_when_conversation_is_not_visible` | Retorna 404 cuando la conversación no existe o no es visible |

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

## Dashboard

Archivo: `dashboard/api/test_routers.py`

### TestDashboardRouter

| Test | Descripción |
|------|-------------|
| `test_company_area_chart_returns_200` | Endpoint de gráfico de área COMPANY retorna 200 |
| `test_labor_alert_center_returns_200` | Endpoint de centro de alertas LABOR retorna 200 |
| `test_recent_contracts_returns_200` | Endpoint de contratos recientes retorna 200 |
| `test_top_rankings_return_200` | Endpoints de rankings de empresas y servicios retornan 200 |

```python
@pytest.mark.asyncio
async def test_company_area_chart_returns_200():
    service = AsyncMock()
    service.get_area_chart.return_value = _area_chart_response()
    app = _make_app(service)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/dashboard/area_chart/company")

    assert response.status_code == 200
    assert response.json()["props"]["title"] == "Ingresos Proyectados"
```

Archivo: `dashboard/api/test_dashboard_auth_and_params.py`

### Permisos, Errores HTTP y Parámetros

| Test | Descripción |
|------|-------------|
| `test_area_chart_accepts_valid_currency_param` | Acepta moneda válida en gráfico de área |
| `test_top_companies_accepts_currency_and_sort_params` | Acepta moneda y orden en top empresas |
| `test_top_services_accepts_currency_and_sort_params` | Acepta moneda y orden en top servicios |
| `test_invalid_currency_returns_422` | Retorna 422 ante moneda inválida |
| `test_invalid_sort_by_returns_422` | Retorna 422 ante criterio de orden inválido |
| `test_forbidden_error_returns_403` | Convierte error de permisos en respuesta 403 |

## Integrations

Archivo: `integrations/api/test_routers.py`

### Importación desde Drive

| Test | Descripción |
|------|-------------|
| `test_import_route_queues_background_job_with_raw_payload` | Encola importación en background con payload completo |
| `test_import_route_accepts_files_without_document_payload` | Acepta archivos sin payload de documento |
| `test_import_route_preserves_empty_document_overrides_as_empty_object` | Preserva overrides vacíos como objeto vacío |
| `test_import_route_drops_null_document_fields_before_background_job` | Elimina campos nulos antes de encolar el trabajo |

```python
@pytest.mark.asyncio
async def test_import_route_queues_background_job_with_raw_payload():
    app = _make_app()
    payload = {
        "token": {"token": "drive-token"},
        "files": [{"file_id": "drive-file-1", "document": {...}}],
    }

    with patch("...process_drive_import_in_background", new_callable=AsyncMock) as mock:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/integrations/import", json=payload)

    assert response.status_code == 200
```

## Integrations - Dependencies

Archivo: `integrations/api/test_dependencies.py`

| Test | Descripción |
|------|-------------|
| `test_closes_task_scoped_resources_after_use` | Cierra recursos scoped al terminar su uso |
| `test_process_import_uses_fresh_background_service_per_file` | Usa servicio fresco por cada archivo importado |
| `test_process_import_stops_batch_when_token_becomes_invalid` | Detiene el lote cuando el token deja de ser válido |

Estas pruebas validan dependencias y flujos auxiliares de integración, incluyendo construcción de servicios, cierre de recursos y procesamiento en background.

## Validación de Contratos

Las pruebas de API ayudan a verificar que el backend cumpla con los contratos esperados por los consumidores HTTP:

1. **Códigos de respuesta correctos**: validan casos como 200, 201, 204, 400, 403, 404 y 422 según el endpoint.
2. **Estructura de respuesta**: verifican que el JSON devuelto tenga los campos esperados.
3. **Validación de parámetros**: comprueban query params, payloads inválidos y rutas con IDs.
4. **Control de permisos**: validan respuestas como 403 cuando el usuario no tiene acceso.
5. **Sobrescritura de dependencias**: simulan usuarios autenticados y servicios de aplicación sin depender de infraestructura real.

## Características Comunes

Las pruebas de API comparten estas características:

1. **AsyncClient**: Cliente HTTP asíncrono para testing.
2. **ASGITransport**: Transporte ASGI para probar FastAPI sin servidor real.
3. **Dependency Override**: Sobrescritura de dependencias de FastAPI.
4. **Verificación de Status**: Asserts sobre códigos HTTP.
5. **Verificación de JSON**: Asserts sobre cuerpo de respuesta.
6. **Mocks de servicios**: Simulación de servicios de aplicación para controlar respuestas y errores.

Estas pruebas constituyen una capa de validación sobre la interfaz HTTP del backend, verificando la integración entre routers, dependencias y servicios simulados.
