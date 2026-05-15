---
title: "Pruebas de Integración"
description: "Pruebas de infraestructura, servicios de aplicación e integración real con dependencias controladas."
---

Las pruebas de esta sección validan cómo interactúan los componentes del backend con repositorios, servicios externos simulados, clientes HTTP, proveedores de almacenamiento, motores de plantillas y bases de datos de prueba.

En este proyecto existen dos tipos principales de pruebas dentro de esta categoría:

1. **Pruebas con mocks**: simulan dependencias externas usando `AsyncMock`, `MagicMock` o clientes falsos. No requieren base de datos real ni servicios externos.
2. **Pruebas de integración real controlada**: usan dependencias reales de prueba, como PostgreSQL temporal levantado con Docker.

## Archivos de Pruebas

Las pruebas se organizan principalmente en los directorios `infrastructure`, `application`, `api` e `integration` de cada módulo.

| Módulo | Infrastructure / Integration | Application / API |
|--------|-------------------------------|-------------------|
| users | `test_postgres_repo.py`, `test_jwt_service.py` | `test_auth_service.py` |
| documents | `test_postgres_repo.py`, `test_postgres_repo_access_matching.py`, `test_qdrant_repo.py`, `test_supabase_storage.py`, `test_llama_parser.py`, `test_gemini_structured_extractor.py` | `test_document_service.py`, `api/test_routers.py` |
| templates | `test_jinja_render.py` | `test_template_service.py`, `test_template_authoring_service.py`, `test_rendered_contract_formatter.py` |
| chatbot | `test_qdrant_repo.py`, `test_conversation_repo.py`, `agent/test_tools.py`, `agent/test_graph.py`, `agent/test_access.py` | `test_chatbot_service.py`, `test_conversation_service.py`, `api/test_conversation_router.py` |
| dashboard | `infrastructure/test_postgres_repo.py`, `integration/test_dashboard_read_models.py` | `test_dashboard_service.py`, `test_dashboard_service_rankings.py`, `test_dashboard_service_area_chart.py`, `test_dashboard_service_alert_center.py`, `api/test_routers.py`, `api/test_dashboard_auth_and_params.py` |
| organizations | `test_postgres_repo.py` | `test_organization_service.py` |
| notifications | `test_gmail_service.py` | `test_email_alert_service.py` |
| integrations | - | `test_integration_service.py`, `api/test_routers.py`, `api/test_dependencies.py` |
| shared | `test_secrets_provider.py` | `test_config.py` |

## Patrón de Testing con Mocks

Muchas pruebas de infraestructura usan mocks para simular sesiones de base de datos o clientes HTTP.

Ejemplo:

```python
def _make_repo() -> tuple[SQLModelUserRepository, AsyncMock]:
    session = AsyncMock()
    repo = SQLModelUserRepository(session=session)
    return repo, session
```

Este patrón permite:

- Ejecutar pruebas sin una base de datos real.
- Controlar las respuestas de dependencias externas.
- Simular errores como timeouts, errores HTTP o fallos de SQLAlchemy.
- Verificar que los métodos correctos fueron llamados.
- Mantener pruebas rápidas y determinísticas.

## Users

### SQLModelUserRepository

Archivo: `users/infrastructure/test_postgres_repo.py`

| Test | Descripción |
|------|-------------|
| `test_returns_user_when_found` | Retorna un usuario cuando existe en la consulta |
| `test_returns_none_when_not_found` | Retorna `None` cuando no existe usuario |
| `test_pool_timeout_raises_service_unavailable` | Convierte timeout de pool en error de servicio no disponible |

### SupabaseAuthService

Archivo: `users/infrastructure/test_jwt_service.py`

| Test | Descripción |
|------|-------------|
| `test_returns_external_user_dto_on_success` | Retorna DTO de usuario externo cuando el token es válido |
| `test_email_is_lowercased_and_stripped` | Normaliza el email eliminando espacios y convirtiendo a minúsculas |
| `test_202_raises_unauthorized` | Trata respuesta 202 como no autorizada |

### AuthService

Archivo: `users/application/test_auth_service.py`

| Test | Descripción |
|------|-------------|
| `test_returns_existing_active_user` | Retorna usuario activo existente |
| `test_rejects_user_when_not_found` | Rechaza usuario no registrado |
| `test_inactive_user_raises_forbidden` | Rechaza usuario inactivo |
| `test_updates_supabase_id_when_missing` | Actualiza Supabase ID cuando falta |
| `test_updates_full_name_when_changed` | Actualiza nombre si cambió |
| `test_no_update_when_data_unchanged` | No modifica datos si no hay cambios |

## Documents

### SQLModelDocumentRepository

Archivo: `documents/infrastructure/test_postgres_repo.py`

| Test | Descripción |
|------|-------------|
| `test_returns_documents_for_query` | Retorna documentos para una consulta |
| `test_applies_service_name_filter_without_duplicate_join_rows` | Aplica filtro por nombre de servicio sin duplicar joins |
| `test_operational_error_raises_unavailable` | Convierte error operacional en error de disponibilidad |
| `test_sqlalchemy_error_raises_database_error` | Convierte error SQLAlchemy en error de base de datos |
| `test_returns_contract_count` | Retorna cantidad de contratos |
| `test_applies_service_id_filter` | Aplica filtro por ID de servicio |
| `test_returns_client_ranking_rows` | Retorna ranking por cliente |
| `test_applies_service_filters_to_ranking_query` | Aplica filtros de servicio al ranking |
| `test_returns_document_services` | Retorna servicios asociados a documentos |
| `test_groups_services_by_document_id` | Agrupa servicios por documento |
| `test_empty_document_ids_returns_empty_mapping` | Retorna mapping vacío sin IDs |
| `test_replaces_services_and_commits` | Reemplaza servicios y confirma transacción |
| `test_sqlalchemy_error_rolls_back` | Hace rollback ante error SQLAlchemy |
| `test_replaces_multiple_services_and_returns_reloaded_rows` | Reemplaza múltiples servicios y recarga resultados |
| `test_returns_services_for_ids` | Retorna servicios por IDs |
| `test_empty_ids_returns_empty_list_without_query` | Evita consulta cuando no hay IDs |
| `test_returns_service_catalog_for_organization` | Retorna catálogo de servicios por organización |

### Access Matching

Archivo: `documents/infrastructure/test_postgres_repo_access_matching.py`

| Test | Descripción |
|------|-------------|
| `test_viable_party_match_accepts_small_name_typo` | Acepta coincidencia con pequeño error tipográfico |
| `test_viable_party_match_rejects_unrelated_name` | Rechaza nombres no relacionados |

### Qdrant Repository

Archivo: `documents/infrastructure/test_qdrant_repo.py`

| Test | Descripción |
|------|-------------|
| `test_deletes_vectors_when_collection_exists` | Elimina vectores si la colección existe |
| `test_skips_delete_when_collection_not_exists` | Omite eliminación si la colección no existe |
| `test_exception_raises_vector_unavailable` | Convierte excepción en error de vector no disponible |
| `test_creates_collection_when_not_exists` | Crea colección cuando no existe |
| `test_skips_creation_when_collection_exists` | Omite creación si la colección ya existe |
| `test_ignores_already_exists_error_on_payload_index` | Ignora error de índice ya existente |
| `test_raises_vector_error_on_unexpected_payload_index_error` | Lanza error ante fallo inesperado de índice |
| `test_add_vectors_sets_chunk_metadata` | Inserta vectores con metadata de chunks |
| `test_add_vectors_calls_delete_first` | Elimina vectores previos antes de insertar |
| `test_add_vectors_threadpool_error_raises_vector_error` | Convierte error de threadpool en error vectorial |
| `test_add_vectors_keeps_sync_client_open_for_batch_reuse` | Mantiene cliente síncrono abierto para reutilización |

### Supabase Storage

Archivo: `documents/infrastructure/test_supabase_storage.py`

| Test | Descripción |
|------|-------------|
| `test_upload_success_returns_path` | Retorna ruta al subir archivo correctamente |
| `test_upload_http_error_raises_storage_error` | Convierte error HTTP en error de storage |
| `test_upload_timeout_raises_unavailable` | Convierte timeout en servicio no disponible |
| `test_upload_request_error_raises_unavailable` | Convierte error de request en servicio no disponible |
| `test_delete_success` | Elimina archivo correctamente |
| `test_delete_not_found_is_silent` | Ignora eliminación de archivo inexistente |
| `test_delete_bad_request_not_found_body_is_silent` | Ignora 400 cuando el cuerpo indica no encontrado |
| `test_delete_server_error_raises_storage_error` | Convierte error de servidor en error de storage |
| `test_delete_timeout_raises_unavailable` | Convierte timeout al eliminar en servicio no disponible |
| `test_returns_full_signed_url` | Retorna URL firmada completa |
| `test_missing_signed_url_in_response_raises` | Lanza error si falta URL firmada |
| `test_http_error_raises_storage_error` | Convierte error HTTP en error de storage |
| `test_timeout_raises_unavailable` | Convierte timeout en servicio no disponible |

### LlamaParse Extractor

Archivo: `documents/infrastructure/test_llama_parser.py`

| Test | Descripción |
|------|-------------|
| `test_extract_returns_documents_with_filename_metadata` | Extrae documentos con metadata de nombre de archivo |
| `test_extract_returns_multiple_documents` | Retorna múltiples documentos parseados |
| `test_extract_parser_error_raises_extraction_error` | Convierte error del parser en error de extracción |
| `test_extract_cleans_up_temp_file_on_success` | Limpia archivo temporal en éxito |
| `test_extract_cleans_up_temp_file_on_error` | Limpia archivo temporal en error |

### Gemini Structured Extractor

Archivo: `documents/infrastructure/test_gemini_structured_extractor.py`

| Test | Descripción |
|------|-------------|
| `test_build_prompt_includes_labor_worker_and_monthly_pay_rules` | Verifica reglas laborales en el prompt |
| `test_build_prompt_includes_service_item_uniqueness_and_completeness_rules` | Verifica reglas de unicidad y completitud de servicios |

### Document Service

Archivo: `documents/application/test_document_service.py`

Este archivo contiene pruebas extensas del servicio de documentos, incluyendo:

- Creación de documentos.
- Autocompletado desde extracción.
- Manejo de contratos laborales y empresariales.
- Validación de servicios asociados.
- Rollback ante errores de storage o vectores.
- Consultas y rankings de contratos.
- Reglas para chatbot sobre estado de contratos.

## Templates

### Jinja Renderer

Archivo: `templates/infrastructure/test_jinja_render.py`

| Test | Descripción |
|------|-------------|
| `test_render_supports_format_date_filter` | Soporta filtro de formato de fecha |
| `test_render_supports_format_date_components` | Soporta componentes de fecha |

### Template Service

Archivo: `templates/application/test_template_service.py`

| Test | Descripción |
|------|-------------|
| `test_generate_contract_uses_explicit_contract_date_mapping_with_custom_field_names` | Usa mapping explícito de fechas con campos personalizados |
| `test_generate_contract_infers_contract_date_mapping_from_template_fields` | Infiere mapping de fechas desde campos de plantilla |
| `test_generate_contract_raises_when_service_items_do_not_expose_contract_dates` | Lanza error si servicios no exponen fechas de contrato |
| `test_generate_contract_keeps_today_fallback_when_there_are_no_service_items` | Mantiene fallback de fecha actual sin servicios |
| `test_generate_contract_raises_when_required_visible_field_is_empty` | Lanza error si campo visible requerido está vacío |
| `test_generate_contract_removes_reference_image_artifacts_from_saved_templates` | Remueve artefactos de imágenes de referencia |

### Template Authoring Service

Archivo: `templates/application/test_template_authoring_service.py`

Este archivo valida generación, normalización y publicación de borradores de plantillas:

- Inyección de cláusulas de fecha.
- Normalización de filtros Jinja.
- Reintentos ante salida inválida.
- Limpieza de artefactos de referencia.
- Inferencia de campos de hora.
- Normalización de montos literales.
- Validación de campos visibles y operacionales.
- Reglas para plantillas laborales y empresariales.

### Rendered Contract Formatter

Archivo: `templates/application/test_rendered_contract_formatter.py`

| Test | Descripción |
|------|-------------|
| `test_formats_company_signature_block` | Formatea bloque de firmas para contratos empresariales |
| `test_removes_legacy_signature_block_before_appending_generated_one` | Remueve bloque legacy antes de agregar uno generado |
| `test_keeps_counterparty_representative_row_even_when_blank` | Mantiene fila de representante aunque esté vacía |
| `test_removes_legacy_signature_block_with_placeholder_lines_before_appending_generated_one` | Remueve bloque legacy con placeholders |
| `test_formats_labor_signature_block_with_worker_label` | Formatea bloque de firmas laboral con etiqueta de trabajador |

## Chatbot

### Qdrant Repository

Archivo: `chatbot/infrastructure/test_qdrant_repo.py`

| Test | Descripción |
|------|-------------|
| `test_build_filters_always_include_organization` | Los filtros siempre incluyen organización |
| `test_build_filters_include_document_ids_when_present` | Incluye IDs de documentos si existen |
| `test_retriever_receives_metadata_filters` | El retriever recibe filtros de metadata |
| `test_formats_document_identifier_in_sources` | Formatea identificador del documento en fuentes |

### Conversation Repository

Archivo: `chatbot/infrastructure/test_conversation_repo.py`

| Test | Descripción |
|------|-------------|
| `test_returns_none_when_conversation_not_found` | Retorna `None` si no encuentra conversación |
| `test_appends_messages_and_commits` | Agrega mensajes y confirma cambios |
| `test_updated_at_is_refreshed` | Actualiza `updated_at` |
| `test_returns_conversations_for_user` | Retorna conversaciones del usuario |
| `test_returns_empty_when_no_conversations` | Retorna lista vacía sin conversaciones |
| `test_returns_owned_conversation` | Retorna conversación propia |
| `test_returns_none_when_conversation_is_not_visible` | Retorna `None` si la conversación no es visible |

### Agent Tools

Archivo: `chatbot/infrastructure/agent/test_tools.py`

| Test | Descripción |
|------|-------------|
| `test_party_lookup_tool_returns_document_types_from_repo_matches` | Retorna tipos de documento desde coincidencias del repositorio |
| `test_party_lookup_tool_returns_no_match_when_repo_finds_nothing` | Retorna sin coincidencias si el repo no encuentra resultados |
| `test_party_lookup_tool_respects_explicit_state` | Respeta estado explícito solicitado |
| `test_bc_tool_uses_active_scope_by_default` | Usa contratos activos por defecto |
| `test_bc_tool_uses_explicit_state_scope_when_requested` | Usa estado explícito cuando se solicita |
| `test_contracts_query_tool_forwards_service_filters` | Reenvía filtros de servicio |

### Agent Access

Archivo: `chatbot/infrastructure/agent/test_access.py`

| Test | Descripción |
|------|-------------|
| `test_evaluate_document_access_denies_company_queries_for_hr` | Deniega consultas empresariales para HR |
| `test_evaluate_document_access_denies_labor_queries_for_manager` | Deniega consultas laborales para MANAGER |
| `test_evaluate_document_access_denies_explicit_company_queries_for_hr` | Deniega consulta empresarial explícita para HR |
| `test_evaluate_document_access_leaves_named_party_queries_unresolved` | Deja consultas por contraparte sin resolver |
| `test_extract_contract_party_candidate_returns_entity_name` | Extrae nombre de entidad |
| `test_extract_contract_party_candidate_supports_job_title_queries` | Soporta consultas por cargo |
| `test_evaluate_document_access_allows_generic_queries_for_restricted_roles` | Permite consultas genéricas para roles restringidos |

### Agent Graph

Archivo: `chatbot/infrastructure/agent/test_graph.py`

Este archivo valida el flujo del agente LangGraph:

- Respuestas tempranas desde A1.
- Manejo de JSON inválido.
- Denegación por contexto de rol inválido.
- Llamada a herramientas para solicitudes permitidas.
- Restricción por tipo de documento.
- Resolución de contratos por contraparte.
- Clarificación cuando hay coincidencias ambiguas.

### Chatbot Service

Archivo: `chatbot/application/test_chatbot_service.py`

| Test | Descripción |
|------|-------------|
| `test_creates_new_conversation_when_no_thread` | Crea conversación nueva sin thread |
| `test_uses_existing_thread_id` | Usa thread existente |
| `test_title_truncated_at_30_chars` | Trunca título a 30 caracteres |
| `test_raises_when_existing_thread_is_not_owned_or_not_found` | Lanza error si thread no pertenece al usuario o no existe |
| `test_raises_when_bot_append_returns_none` | Lanza error si no puede agregar respuesta del bot |

### Conversation Service

Archivo: `chatbot/application/test_conversation_service.py`

| Test | Descripción |
|------|-------------|
| `test_creates_and_returns_conversation` | Crea y retorna conversación |
| `test_returns_conversation_read` | Retorna conversación leída |
| `test_returns_none_when_not_found` | Retorna `None` si no existe |
| `test_returns_list` | Retorna lista de conversaciones |
| `test_returns_empty_list` | Retorna lista vacía |
| `test_returns_updated_conversation` | Retorna conversación actualizada |

## Dashboard

### SQLModelDashboardRepository

Archivo: `dashboard/infrastructure/test_postgres_repo.py`

| Test | Descripción |
|------|-------------|
| `test_normalize_service_names_filters_empty_values` | Normaliza nombres de servicios filtrando valores vacíos |
| `test_serialize_contract_row_from_mapping` | Serializa fila de consulta a resumen de contrato |
| `test_sync_contract_states_calls_database_function_with_organization_id` | Llama función de sincronización con organización |
| `test_count_contracts_due_between_applies_dashboard_scope_filters` | Aplica filtros de alcance del dashboard |
| `test_get_monthly_amounts_applies_currency_and_service_window_filters` | Aplica moneda y ventana de servicio |
| `test_list_top_companies_applies_currency_sort_and_limit` | Aplica moneda, orden y límite a top empresas |
| `test_list_top_services_applies_currency_sort_and_limit` | Aplica moneda, orden y límite a top servicios |
| `test_list_recent_contracts_applies_document_type_and_limit` | Aplica tipo de documento y límite a contratos recientes |

### Dashboard Integration

Archivo: `dashboard/integration/test_dashboard_read_models.py`

Estas pruebas usan PostgreSQL de prueba. Si la base no está levantada en `localhost:5433`, se saltan automáticamente.

| Test | Descripción |
|------|-------------|
| `test_monthly_amounts_sum_active_company_services_by_currency` | Valida suma mensual de servicios activos por moneda |
| `test_top_companies_uses_only_current_organization_active_company_contracts` | Valida ranking de empresas filtrado por organización y contratos activos |
| `test_top_services_aggregates_company_services` | Valida agregación de servicios empresariales |
| `test_recent_contracts_returns_latest_active_contracts_for_type` | Valida contratos recientes por tipo |

Para ejecutar estas pruebas:

```bash
docker compose -f docker-compose.test.yml up -d
uv run pytest tests/dashboard/integration -q
docker compose -f docker-compose.test.yml down -v
```

### DashboardService

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

### DashboardService Rankings

Archivo: `dashboard/application/test_dashboard_service_rankings.py`

| Test | Descripción |
|------|-------------|
| `test_top_companies_uses_volume_sort_by_default` | Orden por volumen por defecto |
| `test_top_companies_passes_currency_and_value_sort` | Filtro por moneda y orden por valor |
| `test_top_companies_serializes_and_rounds_amounts` | Serialización y redondeo de montos |
| `test_top_services_uses_volume_sort_by_default` | Orden por volumen por defecto en servicios |
| `test_top_services_passes_currency_and_value_sort` | Filtro por moneda y orden por valor en servicios |
| `test_top_services_serializes_and_rounds_amounts` | Serialización y redondeo de montos de servicios |

### DashboardService Area Chart

Archivo: `dashboard/application/test_dashboard_service_area_chart.py`

| Test | Descripción |
|------|-------------|
| `test_area_chart_builds_historical_current_and_forecast_points` | Construye puntos históricos, actuales y forecast |
| `test_area_chart_passes_currency_filter_to_repository_and_response` | Propaga filtro de moneda |
| `test_area_chart_uses_all_currency_when_filter_is_absent` | Usa `ALL` cuando no hay moneda |
| `test_area_chart_builds_y_axis_labels_from_max_amount` | Construye etiquetas dinámicas del eje Y |
| `test_labor_area_chart_uses_labor_copy` | Usa textos específicos para dashboard laboral |

### DashboardService Alert Center

Archivo: `dashboard/application/test_dashboard_service_alert_center.py`

| Test | Descripción |
|------|-------------|
| `test_alert_center_builds_critical_warning_and_long_term_buckets` | Construye categorías críticas, warning y vigencia prolongada |
| `test_alert_center_uses_expected_date_windows` | Usa ventanas esperadas de 30 y 60 días |
| `test_alert_center_uses_preview_limit_three` | Usa límite de preview de 3 items |
| `test_alert_center_formats_item_statuses` | Formatea estados de vencimiento |
| `test_labor_alert_items_omit_service_detail_when_contract_detail_is_absent` | Omite detalle laboral cuando no existe |

### Dashboard API

Archivo: `dashboard/api/test_routers.py`

| Test | Descripción |
|------|-------------|
| `test_company_area_chart_returns_200` | Endpoint de gráfico empresarial retorna 200 |
| `test_labor_alert_center_returns_200` | Endpoint de alertas laborales retorna 200 |
| `test_recent_contracts_returns_200` | Endpoint de contratos recientes retorna 200 |
| `test_top_rankings_return_200` | Endpoints de rankings retornan 200 |

Archivo: `dashboard/api/test_dashboard_auth_and_params.py`

| Test | Descripción |
|------|-------------|
| `test_area_chart_accepts_valid_currency_param` | Acepta moneda válida en gráfico |
| `test_top_companies_accepts_currency_and_sort_params` | Acepta moneda y orden en top empresas |
| `test_top_services_accepts_currency_and_sort_params` | Acepta moneda y orden en top servicios |
| `test_invalid_currency_returns_422` | Moneda inválida retorna 422 |
| `test_invalid_sort_by_returns_422` | Orden inválido retorna 422 |
| `test_forbidden_error_returns_403` | Error de permisos retorna 403 |

## Organizations

### SQLModelOrganizationRepository

Archivo: `organizations/infrastructure/test_postgres_repo.py`

| Test | Descripción |
|------|-------------|
| `test_returns_organization_by_name` | Retorna organización por nombre |
| `test_returns_none_when_not_found` | Retorna `None` si no encuentra organización |
| `test_returns_active_organizations` | Retorna organizaciones activas |
| `test_returns_empty_list` | Retorna lista vacía |

### OrganizationService

Archivo: `organizations/application/test_organization_service.py`

| Test | Descripción |
|------|-------------|
| `test_returns_all_organizations` | Retorna todas las organizaciones |
| `test_returns_active_only` | Retorna solo organizaciones activas |
| `test_returns_organization` | Retorna una organización específica |
| `test_raises_not_found_when_missing` | Lanza error si no encuentra organización |

## Notifications

### GmailService

Archivo: `notifications/infrastructure/test_gmail_service.py`

| Test | Descripción |
|------|-------------|
| `test_raises_validation_error_when_no_credentials` | Lanza error de validación sin credenciales |
| `test_send_email_calls_send_sync` | Llama envío síncrono de email |
| `test_send_sync_auth_error_raises_bad_gateway` | Convierte error de autenticación SMTP en Bad Gateway |
| `test_send_sync_smtp_error_raises_bad_gateway` | Convierte error SMTP en Bad Gateway |

### EmailAlertService

Archivo: `notifications/application/test_email_alert_service.py`

| Test | Descripción |
|------|-------------|
| `test_returns_zero_when_no_expiring_contracts` | Retorna cero si no hay contratos por vencer |
| `test_returns_zero_when_no_recipients` | Retorna cero si no hay destinatarios |
| `test_sends_email_to_each_worker` | Envía correo a cada trabajador |
| `test_continues_when_one_email_fails` | Continúa si falla un correo |
| `test_returns_html_string` | Retorna HTML como string |
| `test_empty_contracts_returns_empty_string` | Retorna string vacío sin contratos |
| `test_contains_name_and_total` | Incluye nombre y total en el HTML |

## Integrations

### IntegrationService

Archivo: `integrations/application/test_integration_service.py`

Este archivo valida el flujo de importación e integración de documentos desde servicios externos.

### Integration API

Archivos:

- `integrations/api/test_routers.py`
- `integrations/api/test_dependencies.py`

Estas pruebas validan endpoints y dependencias de integración, incluyendo callbacks, descargas, imports y construcción de servicios con repositorios mockeados.

## Shared

### Config

Archivo: `shared/test_config.py`

| Test | Descripción |
|------|-------------|
| `test_loads_missing_values_from_key_vault` | Carga valores faltantes desde Key Vault |
| `test_prefers_dotenv_values_over_key_vault` | Prioriza `.env` sobre Key Vault |
| `test_raises_runtime_error_when_secret_provider_fails` | Lanza error si falla proveedor de secretos |

### Secrets Provider

Archivo: `shared/infrastructure/test_secrets_provider.py`

| Test | Descripción |
|------|-------------|
| `test_returns_secret_value` | Retorna valor de secreto |
| `test_raises_value_error_when_secret_is_missing` | Lanza error si el secreto no existe |
| `test_raises_runtime_error_on_authentication_failure` | Lanza error ante fallo de autenticación |
| `test_raises_runtime_error_on_unexpected_azure_error` | Lanza error ante error inesperado de Azure |
| `test_raises_value_error_when_secret_has_no_value` | Lanza error si el secreto no tiene valor |

## Características Comunes

Estas pruebas comparten varias características:

1. **Uso de mocks**: Muchas pruebas usan `AsyncMock` o `MagicMock` para simular base de datos, HTTP o servicios externos.
2. **Verificación de llamadas**: Validan que se llamen métodos concretos con argumentos esperados.
3. **Manejo de errores**: Cubren timeouts, errores HTTP, errores SQL y recursos inexistentes.
4. **Transformación de datos**: Verifican conversión entre entidades, DTOs, respuestas HTTP y modelos de lectura.
5. **Integración controlada**: Algunas pruebas, como las del dashboard en `integration/`, pueden usar PostgreSQL temporal de prueba.

Estas pruebas forman una capa intermedia de la pirámide de testing. Complementan las pruebas puramente unitarias del dominio y ayudan a validar la interacción entre componentes sin afectar sistemas reales de producción.
