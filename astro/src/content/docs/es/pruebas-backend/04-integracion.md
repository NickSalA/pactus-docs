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
| dashboard | test_postgres_repo.py | test_dashboard_service.py, test_dashboard_service_rankings.py, test_dashboard_service_area_chart.py, test_dashboard_service_alert_center.py |
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

## Dashboard

### SQLModelDashboardRepository

Archivo: `dashboard/infrastructure/test_postgres_repo.py`

Pruebas del repositorio PostgreSQL para el dashboard.

### DashboardService (Acceso y Límites)

Archivo: `dashboard/application/test_dashboard_service.py`

| Test | Descripción |
|------|-------------|
| `test_manager_can_access_company_dashboard` | MANAGER accede a COMPANY |
| `test_hr_can_access_labor_dashboard` | HR accede a LABOR |
| `test_admin_is_forbidden` | ADMIN denegado |
| `test_worker_is_forbidden` | WORKER denegado |
| `test_recent_contracts_uses_limit_four` | Límite de 4 contratos recientes |
| `test_top_companies_uses_limit_five` | Límite de 5 en rankings |
| `test_alert_center_uses_preview_limit_three` | Límite de 3 en alertas |

### DashboardService (Rankings)

Archivo: `dashboard/application/test_dashboard_service_rankings.py`

| Test | Descripción |
|------|-------------|
| `test_top_companies_uses_volume_sort_by_default` | Orden por volumen por defecto |
| `test_top_companies_passes_currency_and_value_sort` | Filtro por moneda y orden |
| `test_top_companies_serializes_and_rounds_amounts` | Redondeo de montos |
| `test_top_services_uses_volume_sort_by_default` | Ordenamiento de servicios |
| `test_top_services_passes_currency_and_value_sort` | Filtros para servicios |
| `test_top_services_serializes_and_rounds_amounts` | Redondeo de montos de servicios |

### DashboardService (Area Chart)

Archivo: `dashboard/application/test_dashboard_service_area_chart.py`

| Test | Descripción |
|------|-------------|
| `test_area_chart_builds_historical_current_and_forecast_points` | Puntos históricos y forecast |
| `test_area_chart_passes_currency_filter_to_repository_and_response` | Filtro de moneda |
| `test_area_chart_uses_all_currency_when_filter_is_absent` | Moneda ALL por defecto |
| `test_area_chart_builds_y_axis_labels_from_max_amount` | Eje Y dinámico |
| `test_labor_area_chart_uses_labor_copy` | Textos para LABOR |

```python
@pytest.mark.asyncio
async def test_area_chart_builds_historical_current_and_forecast_points():
    repo = AsyncMock()
    repo.get_monthly_amounts.return_value = _monthly_amounts(start_month, [100, 200, 300, 400, 500, 600, 700])
    service = DashboardService(repository=repo)

    response = await service.get_area_chart(current_user=_make_user(), document_type=DocumentType.COMPANY)

    points = response.props.series[0].data
    assert len(points) == AREA_CHART_HISTORY_MONTHS + 1 + AREA_CHART_FORECAST_MONTHS
```

### DashboardService (Alert Center)

Archivo: `dashboard/application/test_dashboard_service_alert_center.py`

| Test | Descripción |
|------|-------------|
| `test_alert_center_builds_critical_warning_and_long_term_buckets` | Categorías de alertas |
| `test_alert_center_uses_expected_date_windows` | Ventanas de fechas (30, 60 días) |
| `test_alert_center_uses_preview_limit_three` | Límite de 3 items |
| `test_alert_center_formats_item_statuses` | Formato de estados |
| `test_labor_alert_items_omit_service_detail_when_contract_detail_is_absent` | Detalle condicional |

```python
@pytest.mark.asyncio
async def test_alert_center_builds_critical_warning_and_long_term_buckets():
    response = await service.get_alert_center(current_user=_make_user(), document_type=DocumentType.COMPANY)

    assert [category.due_to for category in response] == [30, 60, None]
    assert [category.count for category in response] == [2, 1, 3]
    assert response[0].label == "VENCEN PROXIMOS"
    assert response[2].label == "VIGENCIA PROLONGADA"
```

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