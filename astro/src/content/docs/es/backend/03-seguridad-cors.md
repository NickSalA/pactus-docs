---
title: Seguridad y CORS
description: Cómo se autentica el backend, qué endpoints son públicos y cuál es el estado real de la configuración CORS.
---

La seguridad HTTP del backend de **Pactus** se apoya en dos mecanismos distintos:

- autenticación Bearer JWT para la mayor parte de la API
- validación por secreto de cron en un endpoint operativo específico

## Autenticación Principal

La dependencia global de seguridad vive en:

- `Pactus-Backend/src/pactus_backend/shared/api/dependencies/security.py`

El flujo es el siguiente:

1. FastAPI extrae el token Bearer desde el request.
2. `get_current_user()` delega la validación al servicio de autenticación.
3. El backend valida el token contra Supabase.
4. El usuario autenticado se sincroniza o recupera en la base de datos del dominio.
5. El router recibe una instancia de `UserTable` como `current_user`.

Este diseño permite que la API trabaje con el usuario funcional del producto, no solo con el token crudo.

## Endpoints Públicos y Endpoints Protegidos

La mayoría de rutas requiere JWT. Sin embargo, no todas las operaciones siguen esa regla.

### Públicos

Actualmente se comportan como endpoints públicos:

- `GET /integrations/drive/auth-url`
- `GET /integrations/drive/callback`

Estas rutas forman parte del flujo OAuth con Google Drive y no usan la dependencia `CurrentUserDep`.

### Protegidos con JWT

La mayor parte de los routers del sistema usa autenticación Bearer, incluyendo:

- documentos
- servicios
- carpetas
- chatbot
- conversaciones
- organizaciones
- notificaciones de usuario
- plantillas

### Protegido con secreto por header

`POST /notifications/cron/send-emails` no usa JWT. Su protección real es el header:

```text
X-Cron-Secret
```

Ese endpoint está pensado para ser invocado por un job programado y valida el secreto contra `settings.CRON_SECRET`.

## Autorización de Negocio

Validar la identidad no es suficiente para esta aplicación. Varias rutas aplican controles adicionales de negocio mediante:

- `organization_id`
- `role`
- `receives_notifications`
- reglas específicas por módulo

Ejemplos concretos:

- un usuario no puede listar conversaciones de otro usuario
- solo ciertos roles pueden crear o administrar carpetas
- solo administradores pueden enviar alertas manuales por correo
- las reglas de notificación se gestionan con permisos administrativos

## Estado Actual de CORS

La configuración efectiva de CORS se define hoy en `factory.py` tomando los orígenes desde `settings.CORS_ORIGINS`:

- `allow_origins` = `settings.CORS_ORIGINS`
- `allow_methods=["*"]`
- `allow_headers=["*"]`

Los orígenes configurados actualmente son:

```text
http://localhost:8000
http://localhost:3000
http://localhost:9002
https://contractia-kappa.vercel.app
http://127.0.0.1:3000
```

La lista se define en la clase `Settings` de `shared/config.py` y puede ajustarse por entorno sin modificar código.

## Middleware de Trazabilidad

Además de CORS y autenticación, la app añade `LoguruMiddleware`, que:

- genera o reutiliza `X-Request-ID`
- incorpora contexto estructurado al log
- mide duración por request
- devuelve `X-Request-ID` en la respuesta

Este punto no reemplaza la seguridad, pero sí mejora la trazabilidad operativa y el diagnóstico de errores.

## Criterio Documental

Cuando se documente la seguridad del backend de Pactus, conviene separar siempre tres niveles:

1. cómo se autentica el request
2. cómo se autoriza la operación en términos de negocio
3. qué excepciones existen para flujos técnicos u operativos

Ese enfoque evita que la documentación reduzca toda la seguridad del sistema a “usar JWT”, cuando en realidad el comportamiento es más específico.
