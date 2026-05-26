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

El proceso de comunicación sigue una línea directa y estandarizada:
1. **Componente Visual:** La pantalla o botón que el usuario está utilizando solicita información (ej. "quiero ver mis contratos").
2. **Cliente API:** Nuestra herramienta centralizada toma esa petición, le pone nuestro sello de seguridad y la envía por internet.
3. **Backend:** El servidor recibe la petición, la procesa en la base de datos y prepara la respuesta.
4. **Respuesta:** La información vuelve a la pantalla del usuario en un formato ordenado y listo para leerse.

## Configuración del Cliente

### Variable de Entorno

El sistema utiliza un "directorio central" (una variable maestra) para saber automáticamente a qué servidor debe conectarse. Si los programadores están haciendo pruebas, el sistema apunta a la computadora local; pero si la aplicación está en vivo, apunta automáticamente a los servidores oficiales de producción.

### Timeouts por Operación

| Tipo | Timeout | Uso |
|------|---------|-----|
| `AUTH` | 10,000 ms (10 seg) | Login/logout |
| `DEFAULT` | 30,000 ms (30 seg) | Operaciones CRUD y Métricas de Dashboard |
| `UPLOAD` | 60,000 ms (60 seg) | Subida de archivos PDF |
| `AI` | 120,000 ms (2 min) | Interacciones con chatbot |

El sistema tiene un reloj interno para cancelar operaciones automáticamente si tardan demasiado. Esto protege a la plataforma de quedarse "congelada". Asigna tiempos cortos (10 segundos) para accesos rápidos como el login, y otorga tiempos más largos (hasta 2 minutos) para tareas complejas como hablar con la Inteligencia Artificial o procesar archivos PDF pesados.

## Función Fetch Base

Esta es la "antena de comunicación central" de ContractIA. Cada vez que la plataforma necesita enviar o recibir datos, pasa por este conducto. Sus responsabilidades automáticas son:
- **Seguridad:** Adjunta la "credencial digital" (token) del usuario a cada mensaje para demostrar que tiene permiso para ver esa información.
- **Clasificación:** Le avisa al servidor si lo que le estamos enviando es un texto simple, un formulario o un archivo pesado.
- **Control de tiempos:** Activa el temporizador (timeout) para abortar la misión si el servidor no responde a tiempo.
- **Traducción de Errores:** Si algo sale mal (ej. "el servidor está caído" o "no tienes permisos"), captura el código de error informático y lo prepara para que la pantalla pueda mostrar un mensaje amigable al usuario.

## Endpoints Implementados

### Autenticación

La autenticación principal del frontend ya no se resuelve mediante un `POST /login` contra FastAPI. El flujo actual vive en **Supabase Auth** y el backend participa a través del token Bearer que recibe en cada request protegido.

Desde la perspectiva del consumo HTTP, el endpoint relevante para la capa de frontend es:

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/user/me` | Obtener perfil autenticado | AUTH |

Estas son las herramientas operativas para la sesión: una se encarga de ir al servidor y traer la "ficha completa" del usuario que acaba de entrar, y la otra se encarga de destruir la llave de acceso de la computadora cuando el usuario presiona "Cerrar sesión", asegurando que nadie más pueda entrar.

### Usuarios

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/user/me` | Obtener usuario autenticado | AUTH |

Utilidad específica que le pregunta al servidor de forma segura: "¿Cuáles son los datos actualizados del dueño de esta sesión?" para poder mostrar su nombre y avatar en la cabecera superior.

### Chatbot

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/chatbot` | Enviar mensaje | AI |

Es el canal de comunicación directa con la IA. Toma el texto que el usuario escribió en la caja de chat, lo empaqueta y se lo envía al cerebro del bot, esperando pacientemente la respuesta procesada para mostrarla en pantalla.

### Conversaciones

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| GET | `/conversations/user/{user_id}` | Listar conversaciones del usuario | DEFAULT |
| GET | `/conversations/{conversation_id}` | Obtener historial | DEFAULT |

Estas funciones operan como "buscadores de archivos históricos": la primera le pide al servidor la lista general de todas las conversaciones pasadas del usuario para armar el menú lateral. La segunda, entra en acción cuando el usuario hace clic en una conversación específica, pidiendo al servidor que le devuelva todo el hilo de mensajes (preguntas y respuestas) de ese día.

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

Aquí se definen las "plantillas estrictas" que el servidor debe respetar al enviar datos para los gráficos. Exigen que la información llegue en un formato específico para que los gráficos funcionen sin romperse: coordenadas exactas para las líneas de tendencia, avisos sobre qué datos son proyecciones a futuro (líneas punteadas), y estructuras ordenadas de rankings que separen el volumen de contratos del dinero generado.

### Documentos

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| POST | `/documents` | Crear documento | UPLOAD |
| GET | `/documents` | Listar todos | DEFAULT |
| GET | `/documents/{id}` | Obtener por ID | DEFAULT |
| GET | `/documents/{id}/file-url` | URL firmada del archivo | DEFAULT |
| PATCH | `/documents/{id}` | Actualizar | UPLOAD |
| DELETE | `/documents/{id}` | Eliminar | AUTH |

Este es el panel de control completo para los archivos. Contiene las instrucciones exactas para realizar cualquier operación sobre un contrato:
- **Subir/Crear:** Empaqueta un documento físico junto con todos sus datos (fechas, clientes, tipo) y lo envía a la base de datos.
- **Listar:** Trae todo el catálogo de contratos de la empresa para armar las tablas.
- **Leer PDF:** Solicita al servidor un enlace web especial, seguro y de un solo uso, para que el usuario pueda ver el PDF en pantalla.
- **Modificar y Borrar:** Envían la orden de guardar los cambios que el usuario hizo en un formulario o destruir definitivamente un registro.

## Caché de Documentos

El sistema implementa una "memoria a corto plazo" inteligente (Caché). Para no saturar al servidor pidiéndole exactamente la misma lista de contratos cada vez que el usuario cambia de pestaña rápidamente, la plataforma guarda una copia fotográfica temporal de los contratos durante 15 segundos. 
Si el sistema necesita mostrar los contratos antes de que acaben esos 15 segundos, usa la copia guardada instantáneamente. Además, si el sistema detecta que ya hay una petición "en viaje" hacia el servidor, evita mandar otra idéntica al mismo tiempo.

## Tipos TypeScript

Este es el "Diccionario Oficial y Legal" de la plataforma. Para que la pantalla de la aplicación y el servidor no se confundan al hablar entre ellos, este bloque establece las reglas de negocio inflexibles:
- Define exactamente cómo se compone un mensaje de chat (si lo dice el "usuario" o el "asistente").
- Enumera los únicos estados que un contrato puede tener en toda la plataforma: Borrador, Pendiente de Firma, Activo, Próximo a Vencer, Vencido o Terminado.
- Dicta qué tipos de moneda son válidos (Soles, Dólares o Euros).
- Establece qué datos son obligatorios y cuáles son opcionales al momento de armar la ficha técnica de un nuevo contrato.

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

Al igual que con los contratos, el "Diccionario Oficial" se expande para la consola de administración. Aquí se dictan las leyes para la creación de plantillas de contratos: cuáles son sus estados permitidos (Borrador, Publicada o Archivada), qué tipo de datos se pueden exigir a la hora de llenarlas (si es un número, un texto, o una fecha) y cómo debe comportarse el motor de la IA a la hora de procesarlas.

## Manejo de Estados en la UI

Cada petición debe reflejar su estado en la interfaz:

| Estado | Indicador Visual | Comportamiento                                 |
|--------|------------------|------------------------------------------------|
| `idle` | Ninguno | Estado inicial, UI lista                       |
| `loading` | Skeletons especializados para gráficos | Carga visual progresiva de widgets analíticos  |
| `success` | Toast verde | Mostrar datos                                  |
| `error` | Toast rojo / Banner | Mostrar mensaje, permitir reintentar           |

Este es el mecanismo traductor. Su objetivo es convertir los procesos invisibles de comunicación con el servidor en elementos visuales que la persona entienda. Vigila en qué "fase" está cada acción y le dice a la pantalla qué mostrar: las cajas grises parpadeantes mientras los datos cargan (loading), el aviso verde flotante cuando todo salió bien (success), o la alerta roja con botón de reintento si algo falló en internet (error).

## Manejo de Errores HTTP

| Código | Acción en UI | Mensaje |
|--------|--------------|---------|
| 400 | Mostrar error de validación | "Por favor verifica los datos ingresados" |
| 401 | Redirigir a login | "Tu sesión ha expirado" |
| 403 | Mostrar mensaje | "No tienes permisos para esta acción" |
| 404 | Mostrar mensaje | "El recurso no fue encontrado" |
| 500 | Mostrar error con reintento | "Error del servidor, intenta de nuevo" |
| Timeout | Mostrar error con reintento | "La petición excedió el tiempo límite" |