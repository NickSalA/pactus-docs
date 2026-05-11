---
title: "Pruebas Unitarias"
description: "Pruebas unitarias del dominio: entidades y reglas de negocio."
---

Las pruebas unitarias se enfocan en validar las entidades del dominio y sus reglas de negocio. Estas pruebas son independientes de cualquier infraestructura externa y verifican que las entidades se comporten correctamente bajo diferentes condiciones.

## Archivos de Pruebas Unitarias

Las pruebas unitarias se encuentran en el directorio `domain` de cada módulo:

- `users/domain/test_entities.py`
- `documents/domain/test_entities.py`
- `templates/domain/test_entities.py`
- `chatbot/domain/test_entities.py`
- `organizations/domain/test_entities.py`

## Users

El archivo `users/domain/test_entities.py` contiene pruebas para las entidades `UserTable` y el value object `UserRole`.

### Pruebas de UserTable

| Test | Descripción |
|------|-------------|
| `test_user_default_role_is_worker` | Verifica que el rol por defecto sea WORKER |
| `test_user_default_is_active` | Verifica que el usuario activos por defecto |
| `test_user_all_roles_accepted` | Verifica que todos los roles sean aceptados |
| `test_user_optional_fields_default_none` | Verifica campos opcionales por defecto en None |

```python
def test_user_default_role_is_worker():
    user = UserTable(organization_id=1, email="user@example.com")
    assert user.role == UserRole.WORKER
```

## Documents

El archivo `documents/domain/test_entities.py` contiene pruebas extensas para las entidades del módulo de documentos, incluyendo validaciones de reglas de negocio.

### Pruebas de DocumentTable

| Test | Descripción |
|------|-------------|
| `test_creates_valid_document` | Crea documento válido |
| `test_end_date_before_start_date_raises` | Valida rango de fechas |
| `test_blank_name_raises` | Valida nombre no vacío |
| `test_form_data_must_be_json_object` | Valida estructura de form_data |
| `test_default_state_is_none` | Estado por defecto es None |
| `test_all_document_types_are_accepted` | Todos los tipos aceptados |
| `test_all_document_states_can_be_set` | Todos los estados aceptados |
| `test_nullable_top_level_fields_are_allowed` | Campos opcionales permitidos |

### Pruebas de DocumentServiceTable

| Test | Descripción |
|------|-------------|
| `test_creates_valid_document_service` | Crea servicio válido |
| `test_negative_value_raises` | Valor debe ser positivo |
| `test_non_positive_service_id_raises` | ID de servicio debe ser positivo |
| `test_end_date_before_start_date_raises` | Valida rango de fechas |

### Pruebas de Reglas de Negocio

| Test | Descripción |
|------|-------------|
| `test_currency_alignment_raises_for_mixed_currencies` | Moneda uniforme en servicios |
| `test_service_periods_raise_outside_document_range` | Fechas de servicio dentro del contrato |

```python
def test_currency_alignment_raises_for_mixed_currencies():
    items = [
        _make_service_item(currency=CurrencyType.USD),
        _make_service_item(service_id=3, currency=CurrencyType.PEN),
    ]
    with pytest.raises(DocumentValidationError, match="misma moneda"):
        validate_service_currency_alignment(items)
```

## Templates

El archivo `templates/domain/test_entities.py` contiene pruebas para las entidades de plantillas.

### Pruebas de TemplateTable

| Test | Descripción |
|------|-------------|
| `test_creates_valid_template` | Crea plantilla válida |
| `test_name_stored_as_is` | Nombre se almacena correctamente |
| `test_invalid_content_type_raises` | тип validado |
| `test_content_missing_required_fields_raises` | Campos requeridos validados |

### Pruebas de TemplateField

| Test | Descripción |
|------|-------------|
| `test_default_type_is_text` | Tipo por defecto es text |
| `test_default_required_is_false` | Required por defecto es False |
| `test_infers_placeholder_from_common_field_patterns` | Inferencia de placeholder |
| `test_infers_date_placeholder_from_field_type` | Placeholder para fechas |
| `test_infers_time_placeholder_from_field_type` | Placeholder para horas |
| `test_preserves_custom_placeholder` | Placeholder personalizado |
| `test_replaces_instructional_placeholder_with_example` | Reemplaza placeholder instructivo |
| `test_infers_literal_placeholder_for_textual_amounts` | Placeholder para montos en letras |

### Pruebas de TemplateContent

| Test | Descripción |
|------|-------------|
| `test_default_version` | Versión por defecto 1.0 |
| `test_accepts_contract_date_mapping` | Mapping de fechas de contrato |
| `test_accepts_operational_fields` | Campos operacionales |

### Pruebas de TemplateContractDateMapping

| Test | Descripción |
|------|-------------|
| `test_rejects_same_field_for_both_dates` | Fechas inicio y fin deben ser diferentes |

## Chatbot

El archivo `chatbot/domain/test_entities.py` contiene pruebas para las entidades conversacionales.

### Pruebas de ConversationTable

| Test | Descripción |
|------|-------------|
| `test_creates_valid_conversation` | Crea conversación válida |
| `test_positive_ids_accepted` | IDs positivos aceptados |

### Pruebas de Message

| Test | Descripción |
|------|-------------|
| `test_creates_message_with_defaults` | Crea mensaje con valores por defecto |
| `test_message_roles` | Roles válidos (user, bot, system) |

```python
def test_creates_message_with_defaults():
    msg = Message(role="user", content="Hola")
    assert msg.role == "user"
    assert msg.content == "Hola"
    assert msg.timestamp is not None
```

## Organizations

Las pruebas de organizaciones suivent le même patrón d'entités jednost.

## Dashboard

El archivo `dashboard/domain/test_access_policy.py` contiene pruebas para las políticas de acceso al dashboard. El acceso depende del rol del usuario y del tipo de documento.

### Pruebas de ensure_dashboard_access

| Test | Descripción |
|------|-------------|
| `test_manager_can_access_company_dashboard` | MANAGER puede acceder al dashboard COMPANY |
| `test_hr_can_access_labor_dashboard` | HR puede acceder al dashboard LABOR |
| `test_manager_cannot_access_labor_dashboard` | MANAGER no puede acceder a LABOR |
| `test_hr_cannot_access_company_dashboard` | HR no puede acceder a COMPANY |
| `test_admin_and_worker_cannot_access_dashboard` | ADMIN y WORKER no pueden acceder |

```python
def test_manager_can_access_company_dashboard():
    ensure_dashboard_access(current_user=_make_user(UserRole.MANAGER), document_type=DocumentType.COMPANY)


def test_hr_cannot_access_company_dashboard():
    with pytest.raises(ForbiddenError):
        ensure_dashboard_access(current_user=_make_user(UserRole.HR), document_type=DocumentType.COMPANY)
```

## Características Comunes

Todas las pruebas unitarias comparten las siguientes características:

1. **Sin dependencias externas**: No requieren base de datos ni servicios externos.
2. **Rápidas de ejecutar**: Ejecución en milisegundos.
3. **Determinísticas**: Mismo resultado en cada ejecución.
4. **Fáciles de mantener**: Cambios limitados al dominio.

Estas pruebas forman la base de la pirámide de testing y deben ser las más numerosas del proyecto.