---
title: Conversaciones IA
description: Chatbot, mensajes, conversaciones persistidas y endpoints reales usados por el frontend.
---

El modulo de IA expone un chatbot y conversaciones persistidas. El frontend usa `ChatRequest`, `ChatResponse`, `Conversation` y `ConversationWithContent`.

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

Si no se envia `thread_id`, el backend puede crear o continuar un hilo segun la logica del servicio.

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
| `Conversation` | Item resumido para historial. |
| `ConversationWithContent` | Conversacion con arreglo de mensajes. |
| `ConversationMessage` | Mensaje con `role`, `content` y `timestamp`. |

El backend expone tambien `organization_id`, `user_id`, `created_at` y `updated_at` en el schema de conversacion.

## Endpoints

| Metodo | Ruta | Uso |
|--------|------|-----|
| `POST` | `/chatbot/` | Enviar mensaje al agente. |
| `GET` | `/conversations/user/{user_id}` | Listar conversaciones del usuario. |
| `GET` | `/conversations/{conversation_id}` | Obtener una conversacion con contenido. |

El frontend consume estos endpoints desde `src/lib/api/chat.ts`.

## Restriccion de Acceso

El backend rechaza la consulta de conversaciones de otro usuario. En `GET /conversations/user/{user_id}`, el `user_id` debe coincidir con el usuario autenticado.

## Relacion Con Contratos

El chatbot esta pensado como interfaz conversacional sobre informacion contractual. El historial persistido permite retomar consultas anteriores y mostrar una barra de conversaciones en la experiencia de IA.
