---
title: Conversaciones IA
description: Chatbot, mensajes, conversaciones persistidas y endpoints reales usados por el frontend.
---

El modulo de IA expone un chatbot y conversaciones persistidas. El frontend usa `ChatRequest`, `ChatResponse`, `ConversationList` y `ConversationRead`.

## Chatbot

El chatbot recibe un mensaje y opcionalmente un `thread_id`.

```json
{
  "message": "Resume los contratos activos",
  "thread_id": 12
}
```

La respuesta contiene texto generado, el hilo asociado y opcionalmente una visualizacion:

```json
{
  "response": "Tienes 3 contratos activos...",
  "thread_id": 12,
  "chart": {
    "type": "bar",
    "layout": "vertical",
    "title": "Contratos por Estado",
    "config": {
      "categoryKey": "estado",
      "series": [
        { "dataKey": "cantidad", "name": "Contratos", "color": "#10b981" }
      ]
    },
    "data": [
      { "estado": "Activos", "cantidad": 3 },
      { "estado": "Pendientes", "cantidad": 1 },
      { "estado": "Vencidos", "cantidad": 0 }
    ]
  }
}
```

Si no se envia `thread_id`, el backend crea una nueva conversacion y devuelve el `thread_id` asignado.

Cuando el usuario solicita un grafico (dashboard chart), el campo `chart` contiene un objeto `ChartData` con la informacion para renderizar la visualizacion.

## Agente LangGraph

El chatbot esta implementado como un grafo de LangGraph con tres agentes especializados:

```
START → a1_context → a2_permissions → a3_conversation → (tools loop) → n3_final_response
```

| Agente | Proposito |
|--------|-----------|
| A1: Context | Clasifica si el mensaje es una consulta contractual o una respuesta inmediata (saludo, despedida) |
| A2: Permissions | Valida el acceso segun el rol del usuario (HR→LABOR, MANAGER/WORKER→COMPANY) y resuelve contratos por nombre |
| A3: Conversation | Genera respuestas usando herramientas de consulta y busqueda vectorial |

El flujo atraviesa nodos de terminacion en casos de respuesta temprana, acceso denegado, o clarificacion requerida.

Ver [Agente LangGraph](../ia/03-agente-langgraph.md) para el diagrama completo y detalle de cada nodo.

## Visualizaciones Dinamicas

El chatbot puede devolver graficos dinamicos junto con la respuesta de texto. El tipo `ApiChartData` define la estructura de cada visualizacion:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `type` | `bar` \| `line` \| `pie` | Tipo de grafico a renderizar |
| `layout` | `vertical` \| `horizontal` \| `centric` | Orientacion del grafico |
| `title` | `string` | Titulo de la visualizacion |
| `config.categoryKey` | `string` | Clave para el eje de categorias |
| `config.series` | `Array<{dataKey, name, color?}>` | Series de datos con colores opcionales |
| `data` | `Record<string, string\|number>[]` | Datos a visualizar |

El frontend renderiza los charts usando `ChartRenderer` en `src/features/aiAgent/components/widgets/`, que hace dispatch segun el tipo:
- `bar` → `BarChartWidget`
- `line` → `LineChartWidget`
- `pie` → `PieChartWidget`

El componente `ChatMessageList` renderiza condicionalmente `{message.chart && <ChartRenderer chart={message.chart} />}` despues del contenido markdown cuando existe un chart.

## Conversacion

Una conversacion pertenece a un usuario y una organizacion. En frontend se maneja como:

| Tipo | Uso |
|------|-----|
| `ChatRequest` | Envio de mensaje `{ message, thread_id? }` |
| `ChatResponse` | Respuesta del agente `{ response, thread_id, chart? }` |
| `ConversationList` | Item resumido para historial |
| `ConversationRead` | Conversacion completa con mensajes |

El backend expone tambien `organization_id`, `user_id`, `created_at` y `updated_at` en el schema de conversacion.

## Endpoints

| Metodo | Ruta | Uso |
|--------|------|-----|
| `POST` | `/chatbot/` | Enviar mensaje al agente (timeout 120s). |
| `GET` | `/conversations/user/{user_id}` | Listar conversaciones del usuario. |
| `GET` | `/conversations/{conversation_id}` | Obtener una conversacion con contenido. |
| `PATCH` | `/conversations/{conversation_id}` | Actualizar titulo de conversacion. |
| `DELETE` | `/conversations/{conversation_id}` | Eliminar una conversacion. |

El frontend consume estos endpoints desde `src/api/chat.ts`.

## Restriccion de Acceso

El backend rechaza la consulta de conversaciones de otro usuario. En `GET /conversations/user/{user_id}`, el `user_id` debe coincidir con el usuario autenticado.

## Relacion Con Contratos

El chatbot esta pensado como interfaz conversacional sobre informacion contractual. El historial persistido permite retomar consultas anteriores y mostrar una barra de conversaciones en la experiencia de IA.

El agente tiene acceso a herramientas de consulta estructurada (company_contracts_query_tool, labor_contracts_query_tool) y busqueda vectorial (bc_tool). Ver [Prompts y Tools](../ia/03-prompts-tools.md) para el detalle de herramientas disponibles.