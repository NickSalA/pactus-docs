---
title: Prompts y Tools
description: Definición de los prompts del sistema y las tools disponibles para el agente LangGraph.
---

El agente LangGraph de ContractIA usa **prompts del sistema estructurados** para cada sub-agente y un conjunto de **tools** que el agente A3 puede invocar durante la ejecución del pipeline RAG.

## Prompts del Sistema

Los tres prompts principales están definidos en `prompts.py`.

### A1 — Context Agent (líneas 4-26)

**Objetivo**: Clasificar la intención del mensaje y decidir si el usuario solicita información contractual.

**Reglas de routing**:

| Si el mensaje es... | Envia a |
|--------------------|---------|
| Solicitud de info sobre contratos | `a2_permissions` |
| Conversación social, off-topic, o acción directa | `n1_early_response` |

El agente NO ejecuta tools — solo clasifica.

### A2 — Permission Agent (líneas 29-79)

**Objetivo**: Verificar que el usuario tenga acceso al tipo documental solicitado.

**Matriz de acceso**:

| Rol | COMPANY | LABOR |
|-----|---------|-------|
| ADMIN | ✅ | ✅ |
| HR | ❌ | ✅ |
| MANAGER | ✅ | ❌ |
| WORKER | ✅ | ❌ |

**Uso de party_lookup_tool**: Cuando el usuario menciona una контрагент (empresa contraparte) por nombre, el agente invoca `party_lookup_tool` para resolver los `document_ids` asociados.

**Formato de salida**:
```json
{
  "route": "authorized" | "denied" | "clarification_needed",
  "response": "Mensaje explicativo",
  "document_type": "COMPANY" | "LABOR",
  "resolved_document_ids": [int] | null,
  "resolved_contract_candidates": [dict] | null
}
```

### A3 — Conversation Agent (líneas 82-172)

**Objetivo**: Ejecutar retrieval y generar respuestas fondadas en evidencia.

**Reglas de uso de tools**:

| Operación | Tool a usar |
|----------|------------|
| Conteos, rankings, listados | `contracts_query_tool` |
| Evidencia textual (firmantes, cláusulas, obligaciones) | `bc_tool` |
| Búsqueda por контрагент | `party_lookup_tool` (vía A2) |

**Formato de respuestas según tipo**:

- **Conteo**: `"Según los contratos encontrados, hay X contratos que cumplen los criterios."`
- **Listado**: Tabla con columnas relevantes
- **Ranking**: Lista ordenada por criterio
- **Cláusulas**: Excerpts con referencia a fuente
- **Resumen**: Párrafo estructurado citing evidence

**Regla de fuentes**: Solo se incluyen fuentes si están fundamentadas en evidencia de `bc_tool`.

## Tools

### bc_tool

**Propósito**: Retrieval vectorial de fragmentos textuales de contratos.

**Parámetros**:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `query` | `str` | — | Consulta semántica |
| `limit` | `int` | 5 | Máx. fragmentos a recuperar |
| `document_ids` | `list[int]` | `None` | Filtrar por documento |

**Retorna**: String formateado con `[Fuente: filename | Documento: id]` y el texto del fragmento.

---

### contracts_query_tool

**Propósito**: Consulta estructurada a la base de datos de contratos.

**Parámetros**:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `operation` | `str` | — | `count`, `list`, `ranking` |
| `client` | `str` | `None` | Filtro por nombre de контрагент |
| `contract_name` | `str` | `None` | Filtro por nombre del contrato |
| `service_name` | `str` | `None` | Filtro por nombre de servicio |
| `min_value` | `float` | `None` | Mínimo monto del contrato |
| `max_value` | `float` | `None` | Máximo monto |
| `currency` | `str` | `None` | Código de moneda (USD, PEN, etc.) |
| `state` | `str` | `None` | Estado del contrato |
| `document_type` | `str` | `None` | `COMPANY` o `LABOR` |
| `period_start` | `date` | `None` | Fecha inicio período |
| `period_end` | `date` | `None` | Fecha fin período |
| `currently_active` | `bool` | `None` | Solo contratos activos |
| `sort_by` | `str` | `None` | Campo de ordenamiento |
| `limit` | `int` | 10 | Límite de resultados |

**Retorna**: Resultados estructurados según `operation`:
- `count`: entero
- `list`: lista de contratos
- `ranking`: lista ordenada

---

### party_lookup_tool

**Propósito**: Resolver IDs de contratos por nombre de контрагент. Usado por A2 en la fase de permisos.

**Parámetros**:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `party_name` | `str` | — | Nombre de la empresa contraparte |
| `limit` | `int` | 5 | Máx. resultados |
| `state` | `str` | `None` | Filtrar por estado del contrato |

**Retorna**: Lista de diccionarios con `document_id`, `name`, `state` de cada contrato matcheado.

## Detección de Estados en Texto

Los tools reconocen estados documentales a partir de texto libre:

```
PENDING_SIGNATURE → "pendiente de firma", "por firmar", "pending signature"
EXPIRING_SOON    → "por vencer", "expira(n) pronto", "expiring soon"
EXPIRED          → "vencido", "expirado", "expired"
TERMINATED       → "terminado", "resuelto", "terminated"
DRAFT            → "borrador", "draft"
ACTIVE           → "active", "vigente"
```

Esto permite que los usuarios escriban estados en español e inglés sin necesidad de API keys de categorización.

## Modelo de Lenguaje

El agente usa **Azure OpenAI** configurado en `llm.py`:

```python
AzureChatOpenAI(
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT,
    api_version="2024-12-01-preview",
    temperature=settings.MODEL_TEMPERATURE,  # default 0.7
)
```

El modelo de chat es el deployment `AZURE_OPENAI_DEPLOYMENT` (nombre configurado en Azure). La temperatura de 0.7 balancea creatividad y precisión en respuestas técnicas.