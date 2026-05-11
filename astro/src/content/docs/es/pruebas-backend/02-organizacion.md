---
title: "Organización"
description: "Cómo se organizan los archivos de prueba dentro del proyecto."
---

Las pruebas del backend siguen una estructura de directorios paralela al código fuente. Esta organización permite localizar rápidamente las pruebas relacionadas con cada módulo del sistema, facilitando tanto el mantenimiento como la creación de nuevas pruebas.

## Estructura de Directorios

El directorio principal de pruebas se encuentra en `ContractAI-Backend/tests/` y contiene subdirectorios para cada módulo del sistema:

```
tests/
├── conftest.py              # Configuración global de fixtures
├── users/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── documents/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── templates/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── chatbot/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   │   └── agent/
│   └── api/
├── dashboard/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── integration/
│   └── api/
├── organizations/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── notifications/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── integrations/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
└── shared/
    └── infrastructure/
```

Esta organización replica la estructura del código fuente en `src/`, lo que permite mantener una correspondencia clara entre el código y sus pruebas.

## Convencion de Archivos

Los archivos de prueba siguen una convención de nombres consistente:

- `test_*.py`: Archivos que contienen casos de prueba.
- `conftest.py`: Archivos que definen fixtures compartidos.
- `__init__.py`: Archivos que marcan un directorio como paquete Python.

## Listado de Pruebas por Módulo

A continuación se presenta el listado completo de archivos de prueba organizados por módulo:

### Users

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `users/domain/test_entities.py` | domain | Pruebas de entidades User y Role |
| `users/infrastructure/test_postgres_repo.py` | infrastructure | Pruebas del repositorio de usuarios |
| `users/infrastructure/test_jwt_service.py` | infrastructure | Pruebas del servicio JWT |
| `users/application/test_auth_service.py` | application | Pruebas del servicio de autenticación |

### Documents

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `documents/domain/test_entities.py` | domain | Pruebas de entidades Document |
| `documents/infrastructure/test_postgres_repo.py` | infrastructure | Pruebas del repositorio de documentos |
| `documents/infrastructure/test_postgres_repo_access_matching.py` | infrastructure | Pruebas de matching de accesos |
| `documents/infrastructure/test_supabase_storage.py` | infrastructure | Pruebas de almacenamiento en Supabase |
| `documents/infrastructure/test_qdrant_repo.py` | infrastructure | Pruebas del repositorio vectorial |
| `documents/infrastructure/test_llama_parser.py` | infrastructure | Pruebas del parseo de PDFs |
| `documents/infrastructure/test_gemini_structured_extractor.py` | infrastructure | Pruebas del extractor estructurado |
| `documents/application/test_document_service.py` | application | Pruebas del servicio de documentos |
| `documents/api/test_routers.py` | api | Pruebas de los endpoints de documentos |

### Templates

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `templates/domain/test_entities.py` | domain | Pruebas de entidades de plantillas |
| `templates/infrastructure/test_jinja_render.py` | infrastructure | Pruebas del renderizado Jinja |
| `templates/application/test_template_service.py` | application | Pruebas del servicio de plantillas |
| `templates/application/test_template_authoring_service.py` | application | Pruebas del servicio de autoría |
| `templates/application/test_rendered_contract_formatter.py` | application | Pruebas del formateador de contratos |

### Chatbot

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `chatbot/domain/test_entities.py` | domain | Pruebas de entidades conversacionales |
| `chatbot/infrastructure/test_conversation_repo.py` | infrastructure | Pruebas del repositorio de conversaciones |
| `chatbot/infrastructure/test_qdrant_repo.py` | infrastructure | Pruebas del repositorio vectorial del chatbot |
| `chatbot/infrastructure/agent/test_tools.py` | infrastructure | Pruebas de herramientas del agente |
| `chatbot/infrastructure/agent/test_graph.py` | infrastructure | Pruebas del grafo de LangGraph |
| `chatbot/infrastructure/agent/test_access.py` | infrastructure | Pruebas de control de acceso |
| `chatbot/application/test_chatbot_service.py` | application | Pruebas del servicio de chatbot |
| `chatbot/application/test_conversation_service.py` | application | Pruebas del servicio de conversaciones |
| `chatbot/api/test_conversation_router.py` | api | Pruebas del router de conversaciones |

### Dashboard

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `dashboard/domain/test_access_policy.py` | domain | Pruebas de políticas de acceso al dashboard |
| `dashboard/infrastructure/test_postgres_repo.py` | infrastructure | Pruebas del repositorio PostgreSQL |
| `dashboard/integration/test_dashboard_read_models.py` | integration | Pruebas de modelos de lectura |
| `dashboard/application/test_dashboard_service.py` | application | Pruebas del servicio principal |
| `dashboard/application/test_dashboard_service_rankings.py` | application | Pruebas de rankings de empresas y servicios |
| `dashboard/application/test_dashboard_service_area_chart.py` | application | Pruebas del gráfico de área |
| `dashboard/application/test_dashboard_service_alert_center.py` | application | Pruebas del centro de alertas |
| `dashboard/api/test_routers.py` | api | Pruebas de los endpoints HTTP |
| `dashboard/api/test_dashboard_auth_and_params.py` | api | Pruebas de autenticación y parámetros |

### Organizations

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `organizations/domain/test_entities.py` | domain | Pruebas de entidades Organization |
| `organizations/infrastructure/test_postgres_repo.py` | infrastructure | Pruebas del repositorio de organizaciones |
| `organizations/application/test_organization_service.py` | application | Pruebas del servicio de organizaciones |

### Notifications

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `notifications/infrastructure/test_gmail_service.py` | infrastructure | Pruebas del servicio de Gmail |
| `notifications/application/test_email_alert_service.py` | application | Pruebas del servicio de alertas |

### Integrations

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `integrations/application/test_integration_service.py` | application | Pruebas del servicio de integraciones |
| `integrations/api/test_routers.py` | api | Pruebas de los routers de integraciones |
| `integrations/api/test_dependencies.py` | api | Pruebas de las dependencias de API |

### Shared

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `shared/test_config.py` | shared | Pruebas de configuración global |
| `shared/infrastructure/test_secrets_provider.py` | infrastructure | Pruebas del proveedor de secretos |

### Pruebas Globales

| Archivo | Descripción |
|---------|-------------|
| `test_app_setup.py` | Pruebas de configuración de la aplicación |
| `test_chatbot_prompt.py` | Pruebas de los prompts del chatbot |

## Archivo de Configuración Global

El archivo `conftest.py` en la raíz del directorio `tests/` contiene la configuración global de pytest y define fixtures compartidos que pueden utilisé en todas las pruebas del proyecto. Este archivo es el punto central para gestionar el setup y teardown de las pruebas.