---
title: "Ejecutar Pruebas"
description: "Comandos para ejecutar las pruebas del backend."
---

Este documento describe los comandos disponibles para ejecutar las pruebas del backend de ContractIA.

## Requisitos Previos

Las pruebas requieren las dependencias de desarrollo instaladas:

```bash
cd ContractAI-Backend
uv sync --group dev
```

Si ya se sincronizaron todas las dependencias del proyecto, también puede usarse:

```bash
uv sync
```

## Ejecución Básica

### Ejecutar Todas las Pruebas

```bash
uv run pytest
```

Si el entorno virtual ya está activado, también puede ejecutarse:

```bash
pytest
```

### Ejecutar Pruebas de un Módulo Específico

```bash
# Usuarios
uv run pytest tests/users/

# Documentos
uv run pytest tests/documents/

# Templates
uv run pytest tests/templates/

# Chatbot
uv run pytest tests/chatbot/

# Dashboard
uv run pytest tests/dashboard/

# Organizations
uv run pytest tests/organizations/

# Notifications
uv run pytest tests/notifications/

# Integrations
uv run pytest tests/integrations/
```

### Ejecutar un Archivo Específico

```bash
uv run pytest tests/users/domain/test_entities.py
uv run pytest tests/documents/api/test_routers.py
uv run pytest tests/dashboard/api/test_dashboard_auth_and_params.py
```

## Opciones de Pytest

### Modo Verbose

```bash
uv run pytest -v
```

### Mostrar Salida Estándar

```bash
uv run pytest -s
```

### Detener en el Primer Error

```bash
uv run pytest -x
```

### Ejecutar Pruebas por Patrón

```bash
uv run pytest -k "test_user"
uv run pytest -k "test_create"
```

### Ejecutar Solo Pruebas que Fallaron

```bash
uv run pytest --lf
```

## Pruebas por Capa

### Pruebas de Dominio

```bash
uv run pytest tests/users/domain tests/documents/domain tests/templates/domain tests/chatbot/domain tests/organizations/domain tests/dashboard/domain
```

### Pruebas de API

```bash
uv run pytest tests/documents/api tests/chatbot/api tests/dashboard/api tests/integrations/api
```

### Pruebas de Dashboard

```bash
uv run pytest tests/dashboard -q
```

### Pruebas de Integración del Dashboard con PostgreSQL de Prueba

Estas pruebas usan una base PostgreSQL temporal definida en `docker-compose.test.yml`. Si PostgreSQL no está levantado en `localhost:5433`, las pruebas se saltan automáticamente.

```bash
docker compose -f docker-compose.test.yml up -d
uv run pytest tests/dashboard/integration -q
docker compose -f docker-compose.test.yml down -v
```

## Cobertura de Código

La cobertura es opcional. Si se desea usar `coverage`, primero debe instalarse como dependencia de desarrollo:

```bash
uv add --dev coverage
```

### Ejecutar con Cobertura

```bash
uv run coverage run -m pytest
```

### Reporte de Cobertura en Terminal

```bash
uv run coverage report
```

### Reporte de Cobertura en HTML

```bash
uv run coverage html
```

Luego se puede abrir:

```text
htmlcov/index.html
```

### Mostrar Líneas Descubiertas

```bash
uv run coverage report --show-missing
```

## Configuración de Pytest

El archivo `pyproject.toml` contiene la configuración de pytest:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

## Scripts de Conveniencia

### Ejecutar Todas las Pruebas Unitarias de Dominio

```bash
uv run pytest tests/users/domain tests/documents/domain tests/templates/domain tests/chatbot/domain tests/organizations/domain tests/dashboard/domain
```

### Ejecutar Todas las Pruebas de API

```bash
uv run pytest tests/documents/api tests/chatbot/api tests/dashboard/api tests/integrations/api
```

### Ejecutar Solo Pruebas que Coincidan con un Nombre

```bash
uv run pytest -k "dashboard"
uv run pytest -k "area_chart"
uv run pytest -k "forbidden"
```

## Integración Continua

El flujo típico de CI/CD puede ser:

```bash
# Instalar dependencias
uv sync --group dev

# Verificar lint
uv run ruff check .

# Ejecutar pruebas
uv run pytest
```

Si se configura cobertura, también podría incluirse:

```bash
uv run coverage run -m pytest
uv run coverage report --fail-under=80
```

## Solución de Problemas

### Error: "No module named 'pytest'"

Instalar dependencias de desarrollo:

```bash
uv sync --group dev
```

### Error: "asyncpg pool limit reached"

Este error puede aparecer si una prueba usa accidentalmente una conexión real a PostgreSQL o si una sesión no se cierra correctamente. Verifica que las pruebas unitarias usen mocks cuando corresponda y que las pruebas de integración usen la base temporal esperada.

### Pruebas de Integración del Dashboard Aparecen como Skipped

Esto es esperado si PostgreSQL de prueba no está levantado.

Para ejecutarlas realmente:

```bash
docker compose -f docker-compose.test.yml up -d
uv run pytest tests/dashboard/integration -q
docker compose -f docker-compose.test.yml down -v
```

### Warnings de Deprecación

```bash
uv run pytest -W ignore::DeprecationWarning
```

## Buenas Prácticas

1. **Ejecutar pruebas antes de commit**: `uv run pytest`.
2. **Ejecutar pruebas específicas durante desarrollo**: usar rutas o `-k` para filtrar.
3. **Mantener pruebas rápidas**: las pruebas unitarias deben ejecutarse en segundos.
4. **Separar integración real de mocks**: las pruebas que requieren PostgreSQL temporal deben mantenerse en directorios `integration/`.
5. **No depender de datos reales**: las pruebas deben usar datos controlados o mocks.
