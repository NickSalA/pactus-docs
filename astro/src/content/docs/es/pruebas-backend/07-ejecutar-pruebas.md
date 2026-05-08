---
title: "Ejecutar Pruebas"
description: "Comandos para ejecutar las pruebas del backend."
---

Este documento describe los comandos disponibles para ejecutar las pruebas del backend de ContractIA.

## Requisitos Previos

Las pruebas requieren las dependencias de desarrollo instaladas:

```bash
cd ContractAI-Backend
uv sync
```

O alternativamente:

```bash
uv sync --group dev
```

## Ejecución Básica

### Ejecutar Todas las Pruebas

```bash
pytest
```

### Ejecutar Pruebas de un Módulo Específico

```bash
# Usuarios
pytest tests/users/

# Documentos
pytest tests/documents/

# Templates
pytest tests/templates/

# Chatbot
pytest tests/chatbot/

# Organizations
pytest tests/organizations/

# Notifications
pytest tests/notifications/

# Integrations
pytest tests/integrations/
```

### Ejecutar un Archivo Específico

```bash
pytest tests/users/domain/test_entities.py
pytest documents/api/test_routers.py
```

## Opciones de Pytest

### Modo Verbose

```bash
pytest -v
```

### Mostrar Salida Estándar

```bash
pytest -s
```

### Detener en el Primer Error

```bash
pytest -x
```

### Ejecutar Pruebas por Patrón

```bash
pytest -k "test_user"
pytest -k "test_create"
```

### Mostrar Diff en Fallos

```bash
pytest --lf  # Ejecutar solo pruebas que fallaron
```

## Cobertura de Código

### Instalar Coverage

```bash
pip install coverage
```

### Ejecutar con Cobertura

```bash
coverage run -m pytest
```

### Reporte de Cobertura en Terminal

```bash
coverage report
```

### Reporte de Cobertura en HTML

```bash
coverage html
# Abrir htmlcov/index.html en el navegador
```

### Mostrar Líneas Descubiertas

```bash
coverage report --show-missing
```

## Configuración de Pytest

El archivo `pyproject.toml` contiene la configuración de pytest:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

## Scripts de Conveniencia

### Ejecutar Todas las Pruebas Unitarias

```bash
pytest tests/ -k "domain"
```

### Ejecutar Todas las Pruebas de API

```bash
pytest tests/ -k "api"
```

### Ejecutar con Timeout

```bash
pytest --timeout=30
```

## Integración Continua

Las pruebas se ejecutan automáticamente en CI/CD. El flujo típico es:

```bash
# Instalar dependencias
uv sync

# Verificar con lint
ruff check .

# Ejecutar pruebas
pytest

# Verificar cobertura (si está configurado)
coverage report --fail-under=80
```

## Solución de Problemas

### Error: "No module named 'pytest'"

```bash
uv sync --group dev
```

### Error: "asyncpg pool limit reached"

Las pruebas de integración utilizan mocks. Si ves este error, revise que los mocks estén configurados correctamente.

### Warnings de Deprecación

```bash
pytest -W ignore::DeprecationWarning
```

## Buenas Prácticas

1. **Ejecutar pruebas antes de commit**: `pytest`
2. **Verificar cobertura regularmente**: `coverage report`
3. **Ejecutar pruebas específicas**: pytest con `-k` para filtrar
4. **Mantener pruebas rápidas**: Las pruebas unitarias deben ejecutarse en segundos