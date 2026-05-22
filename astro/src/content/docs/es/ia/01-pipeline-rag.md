---
title: Pipeline RAG
description: Arquitectura del pipeline de retrieval augmentation generation del chatbot de ContractIA.
---

El chatbot de **ContractIA** implementa un pipeline **RAG (Retrieval Augmentation Generation)** basado en LangGraph con múltiples agentes especializados. El pipeline recupera contexto documental y lo usa para generar respuestas contextualizadas.

## Arquitectura General

El agente conversa ejecutaa un grafo LangGraph con **tres sub-agentes**:

```
Mensaje → A1_Context (clasificación) → A2_Permissions (control de acceso) → A3_Conversation (RAG)
```

Cada agente es un nodo del grafo con su propio prompt del sistema y capacidad de decisión.

## Agente A1 — Clasificación de Contexto

**Responsabilidad**: Clasificar la intención del mensaje del usuario.

**Lógica**:
- Si el usuario pide información sobre contratos → envía a `a2_permissions`
- Si es conversación social, tema no relacionado, o solicitud de acción → envía a `n1_early_response`

**Routing**: Usa un LLM dedicado para clasificar sin costo de herramientas.

## Agente A2 — Permisos y Acceso

**Responsabilidad**: Validar que el usuario tenga acceso al tipo documental solicitado.

**Matriz de permisos por rol**:

| Rol | Acceso |
|-----|--------|
| `ADMIN` | COMPANY + LABOR |
| `HR` | LABOR únicamente |
| `MANAGER` | COMPANY únicamente |
| `WORKER` | COMPANY únicamente |

El agente usa `party_lookup_tool` para resolver контрагент (contraparte) por nombre y devuelve un JSON con `route` y `response` (aprobación o denegación).

## Agente A3 — Ejecución RAG

**Responsabilidad**: Ejecutar retrieval y generar respuestas.

**Flujo interno**:
1. El LLM decide si usar una tool o generar texto
2. Si llama a `bc_tool` → retrieval vectorial en Qdrant
3. Si llama a `contracts_query_tool` → consulta estructurada a la base de datos
4. Si genera respuesta → envía a `n3_final_response`

**Verificación estricta**: Toda respuesta es confirmada contra la evidencia recuperada. No se genera información sin fuente.

## Gestión de Estado

El estado del grafo (`AgentState`) persiste en PostgreSQL mediante un **checkpointer** (`AsyncPostgresSaver`), lo que permite continuar conversaciones en hilos (threads) identificados por `thread_id`.

```python
AgentState:
  messages           # historial de mensajes
  user_context      # {user_id, organization_id, role, allowed_document_types}
  context_route     # decisión de A1
  permission_route  # decisión de A2
  resolved_document_ids   # IDs de contratos filtrados por permisos
```

## Tools Disponibles

### bc_tool (RAG retrieval)

Recupera texto de contratos desde Qdrant.

```
query: str       — consulta semántica
limit: int = 5  — máximo de fragmentos
document_ids    — filtrado opcional por documento
```

### contracts_query_tool (Consulta estructurada)

Ejecuta consultas SQL parametrizadas sobre contratos.

```
operation: str          — count, list, ranking
client, contract_name  — filtros por nombre
service_name           — filtro por servicio
min_value, max_value   — rango de monto
currency              — filtro por moneda
state                — estado del contrato
document_type        — COMPANY o LABOR
period_start/end     — rango de fechas
currently_active     — solo activos
sort_by, limit        — ordenamiento y límite
```

### party_lookup_tool (Resolución de contraparte)

Ayuda a `a2_permissions` a resolver contratos por nombre de empresa contraparte.

## Indexación Documental

Los documentos PDF pasan por:

1. **LlamaParse** — extracción OCR de markdown (español optimizado)
2. **SentenceWindowNodeParser** — fragmentación con ventana de 3 oraciones
3. **MetadataEnricher** — añade `organization_id`, `source_provider`, `source_file_id`
4. **Qdrant** — ingestión con dimensión 1536 (OpenAI `text-embedding-3-small`)

El collection de Qdrant indexa en payload: `filename`, `document_id`, `organization_id`, `source_provider`, `source_file_id`.

## Configuración Relevante

| Parámetro | Valor |
|-----------|-------|
| Modelo de embedding | `text-embedding-3-small` (1536 dims) |
| Colección contracts | `contracts_index` |
| Colección Drive | `drive_contracts_index` |
| Distance | COSINE |
| Checkpointer | PostgreSQL async |