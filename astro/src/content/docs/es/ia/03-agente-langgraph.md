---
title: Agente LangGraph
description: Arquitectura multi-agente para chatbot conversacional con control de acceso.
---

El chatbot de ContractAI está implementado como un grafo de LangGraph con tres agentes especializados y nodos de terminación.

## Arquitectura General

```
                    ┌─────────────────┐
                    │      START      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   a1_context    │  Clasifica la intención del usuario
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │ route_after_context         │
              └──────────────┬──────────────┘
       "a2_permissions"     │     "n1_early_response"
              ▼             │             ▼
    ┌─────────────────┐     │     ┌─────────────────┐
    │  a2_permissions │     │     │ n1_early_response│ TERMINAL
    │  Valida acceso   │     │     └─────────────────┘
    └────────┬────────┘     │
              │             │
   ┌──────────┼──────────────┐
   │ route_after_permissions│
   └──────────┼──────────────┘
    "a3_conversation"  │  "n2_denied_response"  "n2_permission_response"
              ▼              ▼                     ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
    │ a3_conversation │ │ n2_denied_response│ │n2_permission_response│
    │  Agente con     │ │     TERMINAL     │ │      TERMINAL       │
    │  herramientas   │ └─────────────────┘ └─────────────────────┘
    └────────┬────────┘
             │
  ┌──────────┴──────────┐
  │route_after_conversation│
  └──────────┬──────────┘
       "tools"    "n3_final_response"
        ▼              ▼
  ┌─────────┐   ┌─────────────────┐
  │  tools  │   │  n3_final_response │
  │ ToolNode│   │     TERMINAL     │
  └───┬─────┘   └─────────────────┘
      │
      │ (loop)
      ▼
┌─────────────────┐
│ a3_conversation │
└─────────────────┘
```

## Agente A1: Context Agent

**Propósito**: Clasificar la intención del mensaje del usuario.

**Entrada**: Mensaje del usuario
**Salida**: Ruta de decisión (`context_route`)

**Ruteo**:
- `a2_permissions` → El mensaje es una consulta sobre contratos (continue al agente de permisos)
- `n1_early_response` → El mensaje es greetings, small talk, o solicitudes fuera del dominio contractual

**Respuestas tempranas** (n1_early_response):
- Saludos y despedidas
- Conversación trivial
- Solicitudes no relacionadas con contratos

## Agente A2: Permission Agent

**Propósito**: Validar el acceso del usuario según su rol y los tipos de documento solicitados.

**Entrada**: Mensaje del usuario + contexto de usuario del backend (user_id, organization_id, role, allowed_document_types)
**Salida**: Ruta de decisión (`permission_route`)

**Ruteo**:
- `a3_conversation` → Acceso concedido, se incluyen `resolved_document_ids` y `resolved_contract_candidates`
- `n2_denied_response` → El usuario no tiene permisos para la información solicitada
- `n2_permission_response` → Se necesitan múltiples contratos candidatos y se pide clarificación al usuario

**Políticas de acceso por rol**:

| Rol | Tipos de documento permitidos |
|-----|-------------------------------|
| HR | LABOR |
| MANAGER | COMPANY |
| WORKER | COMPANY |

**Resolución de contraparte**: Cuando el usuario pregunta por "contrato con [nombre]", el agente busca contratos reales de la organización mediante `party_lookup_tool`. Si hay múltiples matches, pide clarificación.

## Agente A3: Conversation Agent

**Propósito**: Generar respuestas conversacionales usando herramientas de consulta y RAG.

**Entrada**: Mensaje + contexto de permisos resueltos
**Salida**: Respuesta con posibles llamadas a herramientas

**Herramientas disponibles**:
- `bc_tool` — Búsqueda vectorial en contratos
- `company_contracts_query_tool` — Consultas estructuradas de contratos COMPANY
- `labor_contracts_query_tool` — Consultas estructuradas de contratos LABOR
- `dashboard_chart_tool` — Generación de gráficos de dashboard

**Comportamiento**:
- Si el mensaje requiere herramientas → llama a `tools` node
- Si no → pasa a `n3_final_response`

## ToolNode

El nodo `tools` ejecuta las herramientas llamadas por A3. Después de ejecutarlas, vuelve a A3 para procesar el resultado.

**Loop de herramientas**: A3 → tools → A3 → tools → ... → A3 → n3_final_response

## Nodos de Terminación

| Nodo | Condición | Respuesta |
|------|-----------|-----------|
| `n1_early_response` | A1 clasificó como no contractual | Respuesta inmediata (saludo, despedida) |
| `n2_denied_response` | A2 negó acceso | Mensaje de acceso denegado |
| `n2_permission_response` | A2 necesita clarificación | Pregunta al usuario cuál contrato específico |
| `n3_final_response` | A3 completó sin herramientas | Respuesta conversacional final |

## Estado del Agente (AgentState)

```typescript
interface UserContext {
  user_id: number;
  organization_id: number;
  role: 'HR' | 'MANAGER' | 'WORKER';
  full_name: string | null;
  allowed_document_types: string[] | null; // COMPANY y/o LABOR
}

interface AgentState {
  messages: Annotated[list, add_messages];  // Historial con reducer de append
  user_context: UserContext;                 // Contexto del usuario autenticado
  context_route: string;                      // Ruta de A1 ('a2_permissions' | 'n1_early_response')
  early_response: string | null;             // Contenido de respuesta temprana
  permission_route: string;                 // Ruta de A2 ('a3_conversation' | 'n2_denied_response' | 'n2_permission_response')
  permission_response: string | null;        // Mensaje de denegación/clarificación
  resolved_document_ids: number[] | null;   // IDs de documentos resueltos por party_lookup
  resolved_contract_candidates: dict[] | null; // Candidatos para clarificación
}
```

## Checkpointer PostgreSQL

El grafo usa `langgraph.checkpoint.postgres.aio.AsyncPostgresSaver` para persistir el estado de conversación.

**Configuración**:
- Pool de conexiones PostgreSQL configurable (min_size, max_size)
- `search_path`: `checkpoint, public`
- El `thread_id` de conversación se usa como identificador de thread en LangGraph

**Beneficios**:
- Memoria de conversación: múltiples mensajes en la misma sesión comparten estado
- Resumisión: el grafo puede retomar una conversación previamente guardada

## Ver también

- [Prompts y Tools](./03-prompts-tools.md) — Detalle de herramientas y reglas de selección
- [Pipeline RAG](./01-pipeline-rag.md) — Cómo bc_tool realiza búsquedas vectoriales