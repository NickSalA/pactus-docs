---
title: Consumo de API
description: Cliente API centralizado, endpoints implementados y manejo de estados en la UI
---

El frontend de ContractIA consume el backend a través de un **cliente API centralizado** ubicado en `src/lib/api.ts`, que encapsula toda la lógica de comunicación HTTP.

## Arquitectura de Comunicación

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  UI Component   │ -> │   API Client    │ -> │    Backend      │ -> │    Response     │
│                 │    │   (fetch)       │    │   (Railway)     │    │     (JSON)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Configuración del Cliente

### Variable de Entorno

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// Desarrollo: http://localhost:8000
// Producción: https://api.contractia.railway.app
```

### Timeouts por Operación

| Tipo | Timeout | Uso |
|------|---------|-----|
| `AUTH` | 10,000 ms (10 seg) | Login/logout |
| `DEFAULT` | 30,000 ms (30 seg) | Operaciones CRUD |
| `UPLOAD` | 60,000 ms (60 seg) | Subida de archivos PDF |
| `AI` | 120,000 ms (2 min) | Interacciones con chatbot |

```typescript
export const TIMEOUTS = {
  AUTH: 10000,
  DEFAULT: 30000,
  UPLOAD: 60000,
  AI: 120000,
};
```

## Función Fetch Base

```typescript
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = TIMEOUTS.DEFAULT,
  includeAuth: boolean = true
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const token = includeAuth && typeof window !== 'undefined' 
    ? localStorage.getItem('access_token') 
    : null;
    
  const headers = new Headers(options.headers ?? {});
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Error en la petición');
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La petición excedió el tiempo límite');
    }
    throw error;
  }
}
```

## Endpoints Implementados

### Autenticación

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/login` | Iniciar sesión | AUTH |

```typescript
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetchAPI<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }, TIMEOUTS.AUTH);

  if (response.access_token) {
    localStorage.setItem('access_token', response.access_token);
  }

  return response;
}

export function logout(): void {
  localStorage.removeItem('access_token');
}
```

### Usuarios

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/user` | Crear usuario | DEFAULT |
| GET | `/user` | Listar usuarios | DEFAULT |
| GET | `/user/{id}` | Obtener por ID | DEFAULT |
| PATCH | `/user/{id}` | Actualizar | DEFAULT |
| DELETE | `/user/{id}` | Eliminar | AUTH |

```typescript
export async function createUser(data: UserCreateRequest): Promise<User> {
  return fetchAPI<User>('/user', {
    method: 'POST',
    body: JSON.stringify(data),
  }, TIMEOUTS.DEFAULT);
}

export async function getUsers(): Promise<User[]> {
  return fetchAPI<User[]>('/user', { method: 'GET' }, TIMEOUTS.DEFAULT);
}

export async function getUserById(id: number): Promise<User> {
  return fetchAPI<User>(`/user/${id}`, { method: 'GET' }, TIMEOUTS.DEFAULT);
}

export async function updateUser(id: number, data: UserUpdateRequest): Promise<User> {
  return fetchAPI<User>(`/user/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, TIMEOUTS.DEFAULT);
}

export async function deleteUser(id: number): Promise<void> {
  return fetchAPI<void>(`/user/${id}`, { method: 'DELETE' }, TIMEOUTS.AUTH);
}
```

### Chatbot

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/chatbot/` | Enviar mensaje | AI |

```typescript
export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>('/chatbot/', {
    method: 'POST',
    body: JSON.stringify(data),
  }, TIMEOUTS.AI);
}
```

### Conversaciones

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/conversations` | Listar todas | DEFAULT |
| GET | `/conversations/{id}` | Obtener historial | DEFAULT |

```typescript
export async function getConversations(): Promise<Conversation[]> {
  return fetchAPI<Conversation[]>('/conversations', {
    method: 'GET',
  }, TIMEOUTS.DEFAULT);
}

export async function getConversationById(id: number): Promise<ConversationWithContent> {
  return fetchAPI<ConversationWithContent>(`/conversations/${id}`, {
    method: 'GET',
  }, TIMEOUTS.DEFAULT);
}
```

### Documentos

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/documents/` | Subir documento | UPLOAD |
| GET | `/documents/` | Listar todos | DEFAULT |
| GET | `/documents/{id}` | Obtener por ID | DEFAULT |
| GET | `/documents/{id}/file-url` | URL firmada del PDF | DEFAULT |
| PATCH | `/documents/{id}` | Actualizar | UPLOAD |
| DELETE | `/documents/{id}` | Eliminar | AUTH |

```typescript
export async function uploadDocument(data: DocumentCreateRequest): Promise<Document> {
  const formData = new FormData();
  formData.append('file', data.file);
  
  const documentData = {
    name: data.name,
    client: data.client,
    type: data.type,
    start_date: data.start_date,
    end_date: data.end_date,
    value: data.value,
    currency: data.currency,
    licenses: data.licenses,
  };
  formData.append('document', JSON.stringify(documentData));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.UPLOAD);

  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('access_token') 
    : null;

  const response = await fetch(`${API_BASE_URL}/documents/`, {
    method: 'POST',
    body: formData,
    signal: controller.signal,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  clearTimeout(timeoutId);
  return response.json();
}

export async function getDocuments(): Promise<Document[]> {
  return fetchAPI<Document[]>('/documents/', { method: 'GET' }, TIMEOUTS.DEFAULT, false);
}

export async function getDocumentById(id: number): Promise<Document> {
  return fetchAPI<Document>(`/documents/${id}`, { method: 'GET' }, TIMEOUTS.DEFAULT);
}

export async function getDocumentFileUrl(id: number): Promise<string> {
  const response = await fetchAPI<DocumentFileUrlResponse>(
    `/documents/${id}/file-url`,
    { method: 'GET' },
    TIMEOUTS.DEFAULT
  );
  return response.url;
}

export async function deleteDocument(id: number): Promise<void> {
  return fetchAPI<void>(`/documents/${id}`, { method: 'DELETE' }, TIMEOUTS.AUTH);
}
```

## Caché de Documentos

Se implementa un caché simple para evitar peticiones redundantes:

```typescript
const DOCUMENTS_CACHE_TTL_MS = 15_000; // 15 segundos

let documentsCache: { data: Document[]; timestamp: number } | null = null;
let documentsInFlight: Promise<Document[]> | null = null;

export async function getDocuments(): Promise<Document[]> {
  // Retornar caché si es válido
  if (documentsCache && Date.now() - documentsCache.timestamp < DOCUMENTS_CACHE_TTL_MS) {
    return documentsCache.data;
  }

  // Evitar peticiones duplicadas
  if (documentsInFlight) {
    return documentsInFlight;
  }

  documentsInFlight = fetchAPI<Document[]>('/documents/', { method: 'GET' })
    .then((documents) => {
      documentsCache = { data: documents, timestamp: Date.now() };
      return documents;
    })
    .finally(() => {
      documentsInFlight = null;
    });

  return documentsInFlight;
}
```

## Tipos TypeScript

```typescript
// src/types/api.types.ts

// Chatbot
export interface ChatRequest {
  message: string;
  thread_id?: number;
}

export interface ChatResponse {
  response: string;
  thread_id: number;
}

// Conversaciones
export type MessageSender = 'user' | 'bot';

export interface ConversationMessage {
  sender: MessageSender;
  message: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export interface ConversationWithContent extends Conversation {
  content: ConversationMessage[];
}

// Documentos
export type DocumentType = 'SERVICIOS' | 'LICENCIAS' | 'SOPORTE';
export type DocumentState = 'ACTIVO' | 'POR_VENCER' | 'EXPIRADO';

export interface Document {
  id: number;
  name: string;
  client: string;
  type: DocumentType;
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  licenses: number;
  state: DocumentState;
  file_path?: string | null;
  file_name?: string | null;
}

export interface DocumentCreateRequest {
  file: File;
  name: string;
  client: string;
  type: DocumentType;
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  licenses: number;
}
```

## Manejo de Estados en la UI

Cada petición debe reflejar su estado en la interfaz:

| Estado | Indicador Visual | Comportamiento |
|--------|------------------|----------------|
| `idle` | Ninguno | Estado inicial, UI lista |
| `loading` | Spinner / Skeleton | Deshabilitar botones |
| `success` | Toast verde | Mostrar datos |
| `error` | Toast rojo / Banner | Mostrar mensaje, permitir reintentar |

```typescript
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
}
```

## Manejo de Errores HTTP

| Código | Acción en UI | Mensaje |
|--------|--------------|---------|
| 400 | Mostrar error de validación | "Por favor verifica los datos ingresados" |
| 401 | Redirigir a login | "Tu sesión ha expirado" |
| 403 | Mostrar mensaje | "No tienes permisos para esta acción" |
| 404 | Mostrar mensaje | "El recurso no fue encontrado" |
| 500 | Mostrar error con reintento | "Error del servidor, intenta de nuevo" |
| Timeout | Mostrar error con reintento | "La petición excedió el tiempo límite" |
