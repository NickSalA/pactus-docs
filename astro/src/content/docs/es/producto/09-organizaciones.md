---
title: Organizaciones
description: Gestión de organizaciones, miembros y roles en ContractIA.
---

En ContractIA, cada organización funciona como un **tenant aislado**. Todos los recursos del sistema — contratos, plantillas, servicios, carpetas y reglas de notificación — se filtran por `organization_id`, de modo que los datos de una organización no son visibles para otra.

## Modelo de datos

### OrganizationResponse

```json
{
  "id": 2,
  "name": "Acme Corp",
  "is_active": true,
  "created_at": "2026-04-01T09:00:00Z",
  "updated_at": "2026-04-01T09:00:00Z",
  "ruc": "20123456789",
  "address": "Av. Javier Prado 1234, Lima",
  "company_type": "Sociedad Anónima",
  "objeto_social": "Prestacion de servicios de consultoria",
  "legal_rep_name": "Carlos Mendoza",
  "legal_rep_dni": "46543218",
  "jurisdiction": "Lima",
  "city": "Lima",
  "autorizacion_entidad": "SUNAT",
  "autorizacion_fecha": "2020-01-15",
  "autorizacion_emitida_por": "SUNAT",
  "email": "contacto@acme.com",
  "phone": "+51 1 234 5678"
}
```

## Endpoints de Organizaciones

### Listar organizaciones

`GET /organizations`

Lista todas las organizaciones registradas. Solo accesible por **administradores**. Soporta filtros y paginación.

**Parámetros de query:**

| Parámetro | Tipo | Descripción |
|----------|------|-------------|
| `is_active` | `boolean` | Filtrar por estado activo. |
| `name` | `string` | Filtrar por nombre (búsqueda parcial). |
| `ruc` | `string` | Filtrar por RUC exacto. |
| `limit` | `integer` | Máximo de resultados (default: 1000, max: 1000). |
| `offset` | `integer` | Número de resultados a omitir para paginación. |

**Respuesta `200`:**

```json
[
  {
    "id": 2,
    "name": "Acme Corp",
    "is_active": true,
    "created_at": "2026-04-01T09:00:00Z",
    "updated_at": "2026-04-01T09:00:00Z",
    "ruc": "20123456789",
    "address": "Av. Javier Prado 1234, Lima",
    "company_type": "Sociedad Anónima",
    "objeto_social": null,
    "legal_rep_name": "Carlos Mendoza",
    "legal_rep_dni": "46543218",
    "jurisdiction": "Lima",
    "city": "Lima",
    "autorizacion_entidad": null,
    "autorizacion_fecha": null,
    "autorizacion_emitida_por": null,
    "email": "contacto@acme.com",
    "phone": "+51 1 234 5678"
  }
]
```

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `401` | No autenticado. |
| `403` | No autorizado. Se requiere rol de administrador. |

---

### Crear organización

`POST /organizations`

Crea una nueva organización en el sistema. Solo accesible por **administradores**. El nombre debe ser único; si ya existe una organización con el mismo nombre, retorna error 400.

**Request:**

```json
{
  "name": "Acme Corp",
  "ruc": "20123456789",
  "address": "Av. Javier Prado 1234, Lima",
  "company_type": "Sociedad Anónima",
  "objeto_social": "Prestación de servicios de consultoría",
  "legal_rep_name": "Carlos Mendoza",
  "legal_rep_dni": "46543218",
  "jurisdiction": "Lima",
  "city": "Lima",
  "email": "contacto@acme.com",
  "phone": "+51 1 234 5678"
}
```

Solo `name` es requerido. Los demás campos son opcionales.

**Respuesta `201`:**

```json
{
  "id": 2,
  "name": "Acme Corp",
  "is_active": true,
  "created_at": "2026-04-01T09:00:00Z",
  "updated_at": "2026-04-01T09:00:00Z",
  "ruc": "20123456789",
  "address": "Av. Javier Prado 1234, Lima",
  "company_type": "Sociedad Anónima",
  "objeto_social": "Prestación de servicios de consultoría",
  "legal_rep_name": "Carlos Mendoza",
  "legal_rep_dni": "46543218",
  "jurisdiction": "Lima",
  "city": "Lima",
  "autorizacion_entidad": null,
  "autorizacion_fecha": null,
  "autorizacion_emitida_por": null,
  "email": "contacto@acme.com",
  "phone": "+51 1 234 5678"
}
```

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos inválidos o nombre de organización duplicado. |
| `401` | No autenticado. |
| `403` | No autorizado. Se requiere rol de administrador. |

---

### Obtener organización

`GET /organizations/{organization_id}`

Obtiene los detalles de una organización específica. Los **administradores** pueden acceder a cualquier organización; los usuarios **no administradores** solo pueden acceder a su propia organización.

**Respuesta `200`:** `OrganizationResponse` completo.

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `401` | No autenticado. |
| `403` | No autorizado para acceder a esta organización. |
| `404` | Organización no encontrada. |

---

### Actualizar organización

`PATCH /organizations/{organization_id}`

Actualiza los datos de una organización. Todos los campos son opcionales (semántica PATCH: solo se actualizan los campos incluidos en el payload). Solo accesible por **administradores**.

**Request:**

```json
{
  "name": "Acme Corp Actualizada",
  "phone": "+51 1 987 6543",
  "is_active": false
}
```

**Respuesta `200`:** `OrganizationResponse` actualizado.

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos inválidos o nombre duplicado. |
| `401` | No autenticado. |
| `403` | No autorizado. Se requiere rol de administrador. |
| `404` | Organización no encontrada. |

---

### Eliminar organización

`DELETE /organizations/{organization_id}`

Elimina (desactiva) una organización. La eliminación es un **soft delete**: `is_active` cambia a `false`. No se eliminan los datos asociados. Solo accesible por **administradores**.

**Respuesta `204`:** Sin contenido.

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `401` | No autenticado. |
| `403` | No autorizado. Se requiere rol de administrador. |
| `404` | Organización no encontrada. |

---

## Gestión de Miembros

Los miembros de una organización son usuarios registrados en el sistema que pertenecen a esa organización. Cada miembro tiene un rol funcional que determina sus permisos de acceso.

### Listar miembros

`GET /organizations/me/members`

Lista todos los usuarios que pertenecen a la organización del usuario autenticado.

**Respuesta `200`:**

```json
[
  {
    "id": 19,
    "organization_id": 2,
    "supabase_user_id": "7d7c0d7e-4d4f-4e6f-9c08-6f20b4f17d4c",
    "email": "ana@empresa.com",
    "full_name": "Ana Torres",
    "avatar_url": null,
    "role": "ADMIN",
    "receives_notifications": true,
    "is_active": true,
    "created_at": "2026-04-05T10:00:00Z",
    "updated_at": "2026-04-05T10:00:00Z"
  }
]
```

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `401` | No autenticado. |
| `403` | No autorizado para administrar miembros. |

---

### Agregar miembro

`POST /organizations/me/members`

Agrega un nuevo miembro a la organización actual o reactiva un usuario pendiente existente.

**Request:**

```json
{
  "email": "nuevo@empresa.com",
  "role": "WORKER"
}
```

**Reglas:**
- Si el usuario **ya existe** en otra organización → error `409 Conflict`.
- Si el usuario **ya fue agregado** a esta organización y está activo → error `409 Conflict`.
- Si el usuario **existe pero está inactivo** → se reactiva con el rol especificado.

**Respuesta `201`:**

```json
{
  "id": 25,
  "organization_id": 2,
  "supabase_user_id": null,
  "email": "nuevo@empresa.com",
  "full_name": null,
  "avatar_url": null,
  "role": "WORKER",
  "receives_notifications": true,
  "is_active": true,
  "created_at": "2026-04-20T14:30:00Z",
  "updated_at": "2026-04-20T14:30:00Z"
}
```

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `401` | No autenticado. |
| `403` | No autorizado para administrar miembros. |
| `409` | El usuario ya pertenece a otra organización o ya fue agregado. |

---

### Actualizar rol de miembro

`PATCH /organizations/me/members/{member_id}/role`

Cambia el rol de un miembro existente dentro de la organización. Solo **administradores** pueden ejecutar esta acción.

**Request:**

```json
{
  "role": "MANAGER"
}
```

**Respuesta `200`:** `OrganizationMemberResponse` actualizado.

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `401` | No autenticado. |
| `403` | No autorizado para administrar miembros. |
| `404` | El usuario no existe en la organización actual. |

---

### Actualizar notificaciones de miembro

`PATCH /organizations/me/members/{member_id}/notifications`

Controla si un miembro recibe alertas de vencimiento de contratos. Solo **administradores** pueden ejecutar esta acción.

**Request:**

```json
{
  "receives_notifications": false
}
```

**Respuesta `200`:** `OrganizationMemberResponse` actualizado.

**Respuestas de error:**

| Código | Descripción |
|--------|-------------|
| `401` | No autenticado. |
| `403` | No autorizado para administrar miembros. |
| `404` | El usuario no existe en la organización actual. |

---

## Roles y Permisos

### Roles disponibles

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Administración completa de la organización, incluyendo CRUD de organizaciones. |
| `HR` | Gestión de contratos laborales y carpetas de RRHH. |
| `MANAGER` | Gestión de contratos empresariales y carpetas de gestión contractual. |
| `WORKER` | Consulta de contratos empresariales, sin capacidad de escritura contractual. |

### Matriz de acceso por tipo documental

| Rol | Contratos COMPANY | Contratos LABOR |
|-----|-------------------|-----------------|
| `ADMIN` | Lectura + Escritura | Lectura + Escritura |
| `HR` | Sin acceso | Lectura + Escritura |
| `MANAGER` | Lectura + Escritura | Sin acceso |
| `WORKER` | Lectura | Sin acceso |

### Permisos de la API de Organizaciones

| Operación | ADMIN | HR | MANAGER | WORKER |
|-----------|-------|-----|---------|--------|
| Listar organizaciones | ✅ | ❌ | ❌ | ❌ |
| Crear organización | ✅ | ❌ | ❌ | ❌ |
| Obtener organización | ✅ (cualquiera) | ❌ | ❌ | ❌ |
| Actualizar organización | ✅ | ❌ | ❌ | ❌ |
| Eliminar organización | ✅ | ❌ | ❌ | ❌ |
| Gestionar miembros | ✅ | ❌ | ❌ | ❌ |

---

## Ejemplo de flujo completo

### 1. Crear organización

Un administrador crea la organización para su empresa:

```http
POST /organizations
```

```json
{
  "name": "Tech Solutions S.A.C.",
  "ruc": "20654321",
  "company_type": "Sociedad Anónima Cerrada",
  "legal_rep_name": "María López",
  "legal_rep_dni": "87654321",
  "email": "admin@techsolutions.com",
  "phone": "+51 1 555 0100"
}
```

Respuesta: `201 Created` con `OrganizationResponse` para la nueva org (id: 5).

### 2. Agregar miembros

El mismo administrador agrega a sus colegas:

```http
POST /organizations/me/members
```

```json
{
  "email": "rrhh@techsolutions.com",
  "role": "HR"
}
```

```json
{
  "email": "gerente@techsolutions.com",
  "role": "MANAGER"
}
```

### 3. Asignar notificaciones

El administrador desactiva alertas para un usuario inactivo:

```http
PATCH /organizations/me/members/28/notifications
```

```json
{
  "receives_notifications": false
}
```

---

## Eliminación (Soft Delete)

La operación `DELETE /organizations/{id}` no elimina datos de la base de datos. En su lugar, cambia `is_active` a `false`. Esto significa que:

- La organización deja de aparecer en listados por defecto.
- Los usuarios de la organización siguen teniendo acceso a sus recursos.
- Un administrador podría volver a activar la organización con `PATCH /organizations/{id}` configurando `is_active: true`.

---

## Referencias cruzadas

| Documento | Contenido |
|-----------|-----------|
| [Modelo de dominio](/es/dominio/04-usuarios-y-organizaciones) | Concepto de organización como tenant y modelo de miembros |
| [Contratos API](/es/backend/01-contratos-api) | Referencia técnica de todos los endpoints |
| [Base de datos](/es/base-datos/03-tablas-del-dominio) | Esquema de la tabla `organizations` en Supabase |
| [Administración](/es/producto/06-administracion) | Panel de administración y gestión de miembros desde la UI |