---
title: Consumo de API
description: Cliente API centralizado con Axios y módulos de integración
---

El frontend consume el backend a través de un cliente API centralizado basado en **Axios** ubicado en `src/api/`.

## Cliente API

### axiosInstance

Instancia configurada de Axios con interceptors para autenticación y manejo de errores.

```typescript
const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});
```

**Interceptores:**
- **Request:** Adjunta token Bearer del `accessToken` almacenado en localStorage
- **Response:** Parsea errores y retorna solo `response.data`

### Funciones Exportadas

| Función | Uso |
|---------|-----|
| `apiGet<T>(url, config?)` | GET requests |
| `apiPost<T>(url, data?, config?)` | POST requests |
| `apiPatch<T>(url, data?, config?)` | PATCH requests |
| `apiDelete<T>(url, config?)` | DELETE requests |

### Timeouts

| Tipo | Valor | Uso |
|------|-------|-----|
| `AUTH` | 10,000 ms | Login, logout, operaciones de sesión |
| `DEFAULT` | 30,000 ms | Operaciones CRUD y métricas |
| `UPLOAD` | 60,000 ms | Subida de archivos |
| `AI` | 120,000 ms | Interacciones con chatbot |

## Módulos de API

Cada módulo agrupa funciones relacionadas. Todos se exportan desde `src/api/index.ts`.

| Módulo | Ubicación | Descripción |
|--------|-----------|-------------|
| `auth` | `queries/hooks/organizations/queries` | Usuario autenticado |
| `chat` | `queries/hooks/chat/queries` y `mutations` | Mensajes y historial con el agente IA |
| `dashboard` | `queries/hooks/dashboard/queries` | Métricas y analítica |
| `contracts` | `queries/hooks/contracts/queries` y `mutations` | CRUD de documentos, carpetas y servicios |
| `templates` | `queries/hooks/templates/queries` y `mutations` | Gestión de plantillas y generación de contratos |
| `organizations` | `queries/hooks/organizations/queries` y `mutations` | Gestión de organización y miembros |
| `notifications` | `queries/hooks/notifications/queries` y `mutations` | Notificaciones y reglas de alerts |

## Patrón de Uso

Todas las llamadas a API usan **TanStack Query** a través de la capa de queries en `queries/hooks/`. Esta capa provee cache, loading states y error handling automáticos.

```typescript
import { getDocuments } from '@/queries/hooks/contracts/queries';

const { data, isLoading, error } = useQuery({
  queryKey: ['documents'],
  queryFn: () => getDocuments(),
});
```

La documentación de endpoints está en la especificación OpenAPI del backend.

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base del backend |
