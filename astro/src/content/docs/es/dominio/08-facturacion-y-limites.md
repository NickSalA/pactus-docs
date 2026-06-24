---
title: Facturación y Límites
description: Suscripciones, estados de pago, planes y límites operativos por organización.
---

Pactus gestiona el acceso a sus funcionalidades mediante un sistema de suscripciones por organización. Cada organización tiene una suscripción asociada que determina su plan, estado de pago y límites operativos.

## Suscripciones

La suscripción es el registro que vincula una organización con un plan de servicio. Se almacena en `billing.subscriptions` y mantiene el estado de pago actual, el plan contratado y las fechas del período de facturación.

### Ciclo de vida de una suscripción

1. **Registro**: Al crearse una organización, se crea una suscripción en estado `PENDING` con plan `FREE`.
2. **Activación**: Al confirmar un pago (ej. vía PayPal), la suscripción pasa a `ACTIVE` y se actualiza el plan contratado.
3. **Vencimiento**: Si el pago no se renueva, la suscripción pasa a `PAST_DUE` durante un período de gracia.
4. **Cancelación**: El usuario puede cancelar la suscripción, pasando a `CANCELED`.
5. **Expiración**: Si el período de gracia se agota sin pago, la suscripción expira (`EXPIRED`).

```
PENDING ──> ACTIVE ──> PAST_DUE ──> EXPIRED
  │                     │
  └──> CANCELED         └──> ACTIVE (si se regulariza el pago)
```

### Planes disponibles

| Plan       | Descripción |
|------------|-------------|
| `FREE`     | Plan gratuito con funcionalidades básicas y límites reducidos. Ideal para prueba y organizaciones pequeñas. |
| `BASIC`    | Plan básico con mayores límites operativos. Acceso a funcionalidades estándar de gestión contractual. |
| `PRO`      | Plan profesional con funcionalidades completas, incluyendo agente IA y dashboard avanzado. |
| `ENTERPRISE` | Plan empresarial con límites personalizados y soporte prioritario. |

### Estados de pago

| Estado      | Significado |
|-------------|-------------|
| `PENDING`   | Suscripción creada pero el pago aún no ha sido confirmado. |
| `ACTIVE`    | Pago al día, suscripción vigente con acceso completo al plan. |
| `PAST_DUE`  | Pago vencido. La organización está en período de gracia con acceso limitado. |
| `CANCELED`  | Suscripción cancelada por el usuario o por PayPal. La organización conserva acceso hasta el fin del período pagado. |
| `EXPIRED`   | Suscripción expirada. La organización pierde acceso a funcionalidades premium. |

## Límites Operativos

Cada organización tiene límites operativos definidos en `billing.organization_limits`. Estos límites controlan el consumo de recursos del sistema y se asignan según el plan contratado.

### Límites por plan (valores por defecto)

| Límite                  | FREE    | BASIC   | PRO      | ENTERPRISE |
|-------------------------|---------|---------|----------|------------|
| Usuarios máximos        | 5       | 10      | 25       | Personalizado |
| Documentos máximos      | 50      | 200     | 1000     | Personalizado |
| Almacenamiento (MB)     | 100     | 500     | 2000     | Personalizado |
| Tamaño máx. por archivo | 5 MB    | 10 MB   | 25 MB    | Personalizado |
| Consultas IA / mes      | 100     | 500     | 2000     | Personalizado |

### Columnas de `billing.organization_limits`

| Columna                 | Descripción |
|-------------------------|-------------|
| `max_users`             | Número máximo de usuarios funcionales que puede tener la organización. |
| `max_documents`         | Número máximo de documentos contractuales permitidos. |
| `max_storage_mb`        | Almacenamiento total máximo en megabytes para archivos documentales. |
| `max_file_size_mb`      | Tamaño máximo permitido por cada archivo subido. |
| `max_monthly_ai_queries` | Consultas máximas al agente de IA por mes calendario. |
| `notify_at_percentage`  | Porcentaje de uso que, al alcanzarse, dispara una notificación al administrador. |

### Comportamiento ante límites

- **Usuarios**: Al alcanzar `max_users`, no se pueden crear nuevos usuarios hasta liberar cupo o mejorar el plan.
- **Documentos**: Al alcanzar `max_documents`, no se pueden crear nuevos contratos.
- **Almacenamiento**: Al alcanzar `max_storage_mb`, no se pueden subir nuevos archivos.
- **Archivos**: Al superar `max_file_size_mb`, el backend rechaza la subida del archivo.
- **Consultas IA**: Al alcanzar `max_monthly_ai_queries`, el agente IA responde con un mensaje informando que se alcanzó el límite mensual.

## Relación con PayPal

La integración con PayPal permite confirmar suscripciones aprobadas desde el checkout de PayPal. El flujo actual es:

1. El usuario completa el checkout en PayPal.
2. PayPal redirige al frontend con un `subscription_id`.
3. El frontend envía `POST /billing/paypal/subscriptions/confirm` con el `subscription_id` y el correo del usuario.
4. El backend valida la suscripción en PayPal, crea la organización y registra la suscripción.
5. La organización queda activa con el plan contratado.

El `paypal_subscription_id` se almacena tanto en `identity.organizations` como en `billing.subscriptions` para facilitar la consulta desde distintos puntos del sistema.

## Casos de Uso

### Consultar el estado de suscripción de mi organización

El administrador puede consultar la suscripción actual de su organización para conocer el plan, estado de pago y fechas del período.

### Ver límites actuales y uso

El administrador puede consultar los límites operativos de su organización junto con el consumo actual para planificar upgrades.

### Actualizar límites (SUPERADMIN)

Un SUPERADMIN puede actualizar los límites de una organización de forma manual, sin depender del plan contratado, para casos especiales o empresariales.

### Notificación por límite próximo

Cuando una organización alcanza el `notify_at_percentage` de consumo en algún recurso, el backend puede generar una alerta para que el administrador considere un upgrade de plan.
