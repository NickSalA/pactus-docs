---
title: Agente LangGraph
description: Arquitectura y funcionamiento del agente conversacional basado en LangGraph.
---

El agente conversacional de ContractIA está implementado como un **CompiledStateGraph** de LangGraph. Es un grafo de estados con nodos especializados, cada uno con su propio prompt del sistema, capaz de invocar tools y tomar decisiones de enrutamiento.

## Estructura del Grafo

El grafo se define en `infrastructure/agent/graph.py` y tiene la siguiente arquitectura de nodos:

```
                    ┌─────────────────┐
                    │  __start__      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  a1_context    │ ← Clasifica la intención del usuario
                    └────────┬────────┘
                             │
              ┌─────────────┴─────────────┐
              │                           │
     ┌────────▼────────┐          ┌───────▼───────┐
     │ a2_permissions │          │ n1_early_resp │ ← Respuesta temprana (no contract)
     └────────┬────────┘          └──────────────┘
              │
     ┌────────▼────────┐
     │  a3_conversation│ ← RAG tool execution
     └────────┬────────┘
              │
     ┌───────┴───────┐
     │             │
┌────▼────┐ ┌──────▼──────┐
│ tools   │ │n3_final_resp│ ← Respuesta final
└────────┘ └──────────────┘
```

## Nodos del Grafo

### `a1_context` (A1 Context Agent)

**Prompt**: `prompts.py` líneas 4-26

Determina si el mensaje del usuario es:
- Una solicitud de información sobre contratos → routing a `a2_permissions`
- Otra cosa (social, off-topic, solicitud de acción directa) → routing a `n1_early_response`

### `a2_permissions` (A2 Permission Agent)

**Prompt**: `prompts.py` líneas 29-79

Evalúa el acceso del usuario según su rol (`ADMIN`, `HR`, `MANAGER`, `WORKER`) contra los tipos documentales (`COMPANY`, `LABOR`). Usa `party_lookup_tool` para resolver контрагент por nombre.

Devuelve JSON estructurado:
```json
{
  "route": "authorized" | "denied",
  "response": "Mensaje de aprobación o denegación",
  "document_type": "COMPANY" | "LABOR",
  "resolved_document_ids": [12, 45] // si party_lookup devolvió resultados
}
```

### `a3_conversation` (A3 Conversation Agent)

**Prompt**: `prompts.py` líneas 82-172

Es el núcleo RAG. Decide dinámicamente entre:
- `tools` — invocation de bc_tool o contracts_query_tool
- `n3_final_response` — generación de texto final

Reglas:
- `contracts_query_tool` → conteos, listados, rankings, filtros, asociación de servicios
- `bc_tool` → evidencia textual: firmantes, representantes, cláusulas, obligaciones, penalidades
- Toda respuesta debe estar fundamentada en la evidencia recuperada

### `tools`

Nodo especial que ejecuta las tools registradas. Las tools disponibles son:
- `bc_tool` — retrieval vectorial
- `contracts_query_tool` — consulta estructurada de contratos
- `party_lookup_tool` — resolución de контрагент

### `n1_early_response` / `n3_final_response`

Nodos de salida que convierten el texto generado en mensaje final del asistente.

## Estado del Agente (AgentState)

TypedDict definido en `state.py`:

```python
AgentState:
  messages: Annotated[list, add_messages]       # historial (funcion add_messages acumula)
  user_context: UserContext                       # {user_id, organization_id, role, allowed_document_types}
  context_route: str                              # "authorized" | "denied" (A1 → A2)
  early_response: str | None                     # respuesta de n1 si existe
  permission_route: str                          # "authorized" | "clarification_needed" (A2)
  permission_response: str | None               # mensaje de denegación/clarificación (A2)
  resolved_document_ids: list[int] | None       # IDs resueltos por party_lookup
  resolved_contract_candidates: list[dict]     # candidatos para clarificación
```

## Checkpointer y Persistencia

El checkpointer (`infrastructure/agent/checkpointer.py`) usa **PostgreSQL** (`AsyncPostgresSaver`) para persistir el estado entre requests. Esto habilita:

- Conversaciones multi-turno con memoria de largo plazo
- Resumen de hilos conversacionales (`thread_id`)
- Continuidad sin pérdida de contexto

## Adaptador FastAPI

`LangGraphLLMAdapter` (`adapter.py`) envuelve el grafo compilado para integrarse con FastAPI:

- Recibe `user_context` y `messages` del request HTTP
- Ejecuta el grafo con el estado inicial
- Retorna el mensaje final del asistente

## Decisiones Estructuradas

Los esquemas Pydantic para decisiones intermedias están en `decisions.py`:
- `ContextDecision` — salida de A1
- `PermissionDecision` — salida de A2
- `ConversationDecision` — salida de A3

## Access Control

`access.py` evalúa los permisos efectivos de un usuario contra los tipos documentales solicitados, basándose en la matriz de roles definida en el dominio de usuarios.