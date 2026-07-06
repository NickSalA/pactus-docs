---
title: Agente IA
description: Chat con agente IA, historial de conversaciones y componentes relacionados
---

La página del Agente IA (`/ai-agent`) permite a los usuarios interactuar con un agente basado en RAG para consultar información sobre contratos y servicios.

## Estructura de la Página

Ubicado en `features/aiAgent/components/page/AIAgentPageContent.tsx`. Compuesto por:

| Componente | Descripción |
|------------|-------------|
| `ChatHistorySidebar` | Sidebar con historial de conversaciones |
| `ChatContainer` | Área de mensajes con el agente IA |
| `ChatInput` | Campo de entrada para nuevos mensajes |

## ChatHistorySidebar

Ubicado en `features/aiAgent/components/widgets/ChatHistorySidebar.tsx`.

Sidebar que muestra el historial de conversaciones del usuario. Proporciona acceso rápido a conversaciones anteriores y acciones CRUD.

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `activeConversationId?` | `number` | ID de la conversación actualmente seleccionada |
| `conversations` | `ApiConversationList[]` | Lista de conversaciones del usuario |
| `isLoading` | `boolean` | Estado de carga |
| `onSelectConversation` | `(conversationId: number) => void` | Callback al seleccionar una conversación |
| `onToggle` | `() => void` | Toggle para mostrar/ocultar el sidebar |
| `showHistory` | `boolean` | Si el historial está visible |
| `onNewConversation` | `() => void` | Callback para crear nueva conversación |
| `onUpdateConversation` | `(id: number, title: string) => void` | Callback para actualizar título |
| `onDeleteConversation` | `(id: number) => void` | Callback para eliminar conversación |

### Estados de la Lista

| Estado | Descripción |
|--------|-------------|
| `isLoading` | Muestra "Cargando conversaciones..." |
| `empty` | Muestra "No hay conversaciones anteriores" |
| `withItems` | Renderiza lista de conversaciones |

### Acciones por Item

Cada conversación en la lista permite:

| Acción | Trigger | Comportamiento |
|--------|---------|----------------|
| **Seleccionar** | Click en el item | Carga el historial de mensajes |
| **Editar título** | Click en icono lápiz | Inline edit con `input`; Enter guarda, Escape cancela |
| **Eliminar** | Click en icono papelera | Abre `AlertDialog` de confirmación antes de eliminar |

## Hook Principal

### useAIAgentPage

Ubicado en `features/aiAgent/hooks/useAIAgentPage.ts`. Gestiona el estado completo de la página.

#### Estado

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `messages` | `ChatMessage[]` | Mensajes actuales en el chat |
| `inputValue` | `string` | Valor del input de mensaje |
| `isLoading` | `boolean` | Si hay una operación en curso |
| `activeConversationId` | `number \| undefined` | Conversación activa |
| `showHistory` | `boolean` | Visibilidad del sidebar de historial |
| `currentThreadId` | `number \| undefined` | Thread ID para continuar conversación |

#### Acciones

| Acción | Descripción |
|--------|-------------|
| `handleSendMessage()` | Envía mensaje; si no hay `activeConversationId`, crea nueva |
| `handleSelectConversation(id)` | Selecciona conversación y carga su historial |
| `handleNewConversation()` | Resetea estado para nueva conversación |
| `handleUpdateConversation(id, title)` | Actualiza título de conversación via `useUpdateConversation()` |
| `handleDeleteConversation(id)` | Elimina conversación via `useDeleteConversation()` |

## Flujo de Datos

```
User sends message
       │
       ▼
useSendMessage() mutation
       │
       ├── Si no hay activeConversationId → POST /chatbot/ { message }
       │                                     Crea nueva conversación
       │
       └── Si hay activeConversationId → POST /chatbot/ { message, thread_id }
                                          Continúa conversación existente
                          │
                          ▼
              response: { response, thread_id, chart? }
                          │
                          ▼
              Invalidates ["conversations"]
                          │
                          ▼
              useConversations() actualiza la lista
```

## Integración API

| Operación | Endpoint | Hook |
|-----------|----------|------|
| Listar conversaciones | `GET /conversations/user/{userId}` | `useConversations(userId)` |
| Obtener conversación | `GET /conversations/{id}` | `useConversation(id)` |
| Enviar mensaje | `POST /chatbot/` | `useSendMessage()` |
| Actualizar título | `PATCH /conversations/{id}` | `useUpdateConversation()` |
| Eliminar conversación | `DELETE /conversations/{id}` | `useDeleteConversation()` |

## Accesibilidad

La página está disponible para todos los roles autenticados:

| Rol | Ruta |
|-----|------|
| HR | `/hr/ai-agent` |
| Manager | `/manager/ai-agent` |
| Worker | `/worker/ai-agent` |