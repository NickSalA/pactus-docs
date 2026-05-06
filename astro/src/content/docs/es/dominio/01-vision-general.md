---
title: Vision General del Dominio
description: Mapa simple de las entidades funcionales de ContractIA y su relacion con frontend, backend y OpenAPI.
---

El dominio de **ContractIA** se organiza alrededor de organizaciones, usuarios y contratos. Esta seccion explica las entidades como las usa la aplicacion, no como tablas SQL completas ni como schemas OpenAPI exhaustivos.

Las fuentes usadas para esta documentacion son:

- Tipos del frontend: `ContractAI-Frontend/src/types/api.types.ts`
- Clientes API del frontend: `ContractAI-Frontend/src/lib/api/*.ts`
- Reglas de permisos del frontend: `ContractAI-Frontend/src/lib/permissions.ts`
- Routers y servicios del backend: `ContractAI-Backend/src/contractai_backend/modules/**`
- Contrato HTTP: `openapi.bundle.yaml`
- Modelo persistente: `base-datos/03-tablas-del-dominio.md`

## Entidades Principales

| Entidad | Tipo principal | Para que sirve | Endpoints principales |
|---------|----------------|----------------|-----------------------|
| Usuario | `User` | Perfil funcional autenticado dentro de una organizacion | `GET /user/me` |
| Organizacion | `organization_id` en usuarios y recursos | Tenant que aisla usuarios, contratos, plantillas y reglas | `GET /organizations/me/members` |
| Contrato | `Document` | Registro contractual y referencia al archivo asociado | `/documents/`, `/documents/{document_id}` |
| Servicio | `ServiceCatalogItem` | Catalogo reutilizable para lineas economicas de contratos | `/services/`, `/services/{service_id}` |
| Carpeta | `DocumentFolder` | Agrupacion de contratos por rol propietario | `/folders/`, `/folders/{folder_id}` |
| Plantilla | `Template` | Modelo reutilizable para previsualizar y generar contratos | `/templates/`, `/templates/{template_id}` |
| Conversacion | `Conversation`, `ConversationWithContent` | Historial del chatbot por usuario | `/conversations/user/{user_id}`, `/conversations/{conversation_id}` |
| Notificacion | `Notification`, `NotificationRule` | Alertas de contratos proximos a vencer | `/notifications/`, `/notifications/rules` |

## Relacion Funcional

```text
Organizacion
  -> Usuarios
  -> Contratos
      -> Archivo almacenado
      -> Servicios asociados
      -> Carpeta opcional
      -> Reglas de notificacion opcionales
  -> Plantillas
      -> Formatos de plantilla
      -> Contratos generados
  -> Conversaciones IA
  -> Reglas y envios de notificacion
```

## Lectura Recomendada

1. Empieza por [Contratos](./02-contratos/) porque es la entidad central del producto.
2. Luego revisa [Usuarios y Organizaciones](./04-usuarios-y-organizaciones/) para entender roles y acceso.
3. Continua con [Plantillas](./03-plantillas/) si necesitas generacion documental.
4. Usa [Servicios y Carpetas](./05-servicios-y-carpetas/) para entender como se organizan y valorizan los contratos.
5. Cierra con [Notificaciones](./06-notificaciones/) y [Conversaciones IA](./07-conversaciones-ia/) para los flujos derivados.

## Que No Duplica Esta Seccion

Esta seccion no reemplaza:

- OpenAPI, que define rutas, request bodies y responses.
- Base de datos, que documenta columnas, relaciones y funciones SQL.
- Frontend, que implementa la experiencia de usuario.

Su objetivo es conectar esas tres vistas con lenguaje de dominio.
