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
| `DEFAULT` | 30,000 ms (30 seg) | Operaciones CRUD y Métricas de Dashboard |
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

La autenticación principal del frontend ya no se resuelve mediante un `POST /login` contra FastAPI. El flujo actual vive en **Supabase Auth** y el backend participa a través del token Bearer que recibe en cada request protegido.

Desde la perspectiva del consumo HTTP, el endpoint relevante para la capa de frontend es:

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/user/me` | Obtener perfil autenticado | AUTH |

```typescript
export async function getCurrentUser(): Promise<CurrentUser> {
  return fetchAPI<CurrentUser>('/user/me', { method: 'GET' }, TIMEOUTS.AUTH);
}

export function logout(): void {
  localStorage.removeItem('access_token');
}
```

### Usuarios

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/user/me` | Obtener usuario autenticado | AUTH |

```typescript
export async function getCurrentUser(): Promise<CurrentUser> {
  return fetchAPI<CurrentUser>('/user/me', {
    method: 'GET',
  }, TIMEOUTS.AUTH);
}
```

### Chatbot

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/chatbot` | Enviar mensaje | AI |

```typescript
export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>('/chatbot', {
    method: 'POST',
    body: JSON.stringify(data),
  }, TIMEOUTS.AI);
}
```

### Conversaciones

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/conversations/user/{user_id}` | Listar conversaciones del usuario | DEFAULT |
| GET | `/conversations/{conversation_id}` | Obtener historial | DEFAULT |

```typescript
export async function getConversations(userId: number): Promise<Conversation[]> {
  return fetchAPI<Conversation[]>(`/conversations/user/${userId}`, {
    method: 'GET',
  }, TIMEOUTS.DEFAULT);
}

export async function getConversationById(conversationId: number): Promise<ConversationWithContent> {
  return fetchAPI<ConversationWithContent>(`/conversations/${conversationId}`, {
    method: 'GET',
  }, TIMEOUTS.DEFAULT);
}
```
### Dashboard (Analítica y Métricas)

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/dashboard/area_chart/company` | Datos de tendencias comerciales (Manager) | DEFAULT |
| GET | `/dashboard/area_chart/labor` | Datos de tendencias de RRHH (HR) | DEFAULT |
| GET | `/dashboard/alert_center/company` | Alertas críticas comerciales | DEFAULT |
| GET | `/dashboard/alert_center/labor` | Alertas críticas laborales | DEFAULT |
| GET | `/dashboard/top_companies` | Ranking de empresas por VOL/VALOR | DEFAULT |
| GET | `/dashboard/top_services` | Ranking de servicios más utilizados | DEFAULT |
| GET | `/dashboard/recent_contracts/*` | Últimos movimientos por sector | DEFAULT |


```typescript
export interface AreaChartResponse {
  props: {
    title: string;
    series: Array<{
      name: string;
      data: Array<{ x: string; y: number; is_forecast: boolean }>;
    }>;
    y_axis: { format: string; labels: number[] };
  };
}

// Rankings y Alertas
export interface TopCompanyResponse {
  name: string;
  contracts: number;
  amount: number;
}

export interface AlertCategory {
  label: string;
  count: number;
  color: { accent: string; bg: string };
  items: Array<{ id: number; name: string; status: string }>;
}
```

### Documentos

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/documents` | Crear documento | UPLOAD |
| GET | `/documents` | Listar todos | DEFAULT |
| GET | `/documents/{id}` | Obtener por ID | DEFAULT |
| GET | `/documents/{id}/file-url` | URL firmada del archivo | DEFAULT |
| PATCH | `/documents/{id}` | Actualizar | UPLOAD |
| DELETE | `/documents/{id}` | Eliminar | AUTH |


```typescript
export async function uploadDocument(data: DocumentCreateRequest): Promise<Document> {
  const formData = new FormData();
  formData.append('file', data.file);

  formData.append('document', JSON.stringify(data.document));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.UPLOAD);

  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('access_token') 
    : null;

  const response = await fetch(`${API_BASE_URL}/documents`, {
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
  return fetchAPI<Document[]>('/documents', { method: 'GET' }, TIMEOUTS.DEFAULT, false);
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

  documentsInFlight = fetchAPI<Document[]>('/documents', { method: 'GET' })
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
export type MessageRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  title: string;
  organization_id: number;
  user_id: number;
  created_at: string;
}

export interface ConversationWithContent extends Conversation {
  content: ConversationMessage[];
  updated_at: string;
}

// Documentos
export type DocumentType = 'COMPANY' | 'LABOR';
export type DocumentState = 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TERMINATED';
export type CurrencyType = 'PEN' | 'USD' | 'EUR';

export interface DocumentServiceItem {
  id?: number;
  service_id: number;
  description?: string | null;
  value: number;
  currency: CurrencyType;
  start_date: string;
  end_date: string;
}

export interface DocumentDraftPayload {
  name?: string | null;
  client?: string | null;
  type?: DocumentType | null;
  start_date?: string | null;
  end_date?: string | null;
  form_data: Record<string, unknown>;
  state?: DocumentState | null;
  folder_id?: number | null;
  template_id?: string | null;
  service_items?: DocumentServiceItem[];
}

export interface Document {
  id: number;
  name?: string | null;
  client?: string | null;
  type?: DocumentType | null;
  start_date?: string | null;
  end_date?: string | null;
  form_data: Record<string, unknown>;
  state?: DocumentState | null;
  folder_id?: number | null;
  file_path?: string | null;
  file_name?: string | null;
  service_items: DocumentServiceItem[];
  created_at: string;
  updated_at: string;
}

export interface DocumentCreateRequest {
  file: File;
  document: DocumentDraftPayload;
}
```
### Plantillas (Templates)

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/templates` | Listar plantillas disponibles | DEFAULT |
| GET | `/templates/{id}` | Obtener detalles de una plantilla | DEFAULT |
| POST | `/templates` | Crear nueva plantilla | DEFAULT |
| PATCH | `/templates/{id}` | Actualizar plantilla existente | DEFAULT |
| DELETE | `/templates/{id}` | Eliminar o archivar plantilla | AUTH |

### Administración y Configuración

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/admin/users` | Listar usuarios y roles de la organización | DEFAULT |
| PATCH | `/admin/users/{id}/role` | Actualizar rol de un usuario | AUTH |
| GET | `/admin/catalogs` | Obtener catálogos del sistema (servicios, carpetas) | DEFAULT |
| POST | `/admin/notifications/rules` | Configurar reglas del centro de alertas | DEFAULT |

```typescript
// Plantillas (Templates)
export type TemplateState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TemplateFieldType = 'text' | 'number' | 'date' | 'time' | 'boolean';
export type TemplateGenerationMode = 'adaptive' | 'strict';

export interface TemplateField {
  key: string;
  type: TemplateFieldType;
  label: string;
  required: boolean;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string; // Contenido en Markdown
  state: TemplateState;
  generation_mode: TemplateGenerationMode;
  fields: TemplateField[];
  created_at: string;
  updated_at: string;
}

```
## Manejo de Estados en la UI

Cada petición debe reflejar su estado en la interfaz:

| Estado | Indicador Visual | Comportamiento                                 |
|--------|------------------|------------------------------------------------|
| `idle` | Ninguno | Estado inicial, UI lista                       |
| `loading` | Skeletons especializados para gráficos | Carga visual progresiva de widgets analíticos  |
| `success` | Toast verde | Mostrar datos                                  |
| `error` | Toast rojo / Banner | Mostrar mensaje, permitir reintentar           |

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
