---
title: Autenticación y Estado del Cliente
description: Sistema de autenticación con Supabase OAuth y gestión de estado global con Zustand
---

ContractIA implementa autenticación mediante **Supabase Auth** con Google OAuth como proveedor principal, y gestiona el estado global de la aplicación con **Zustand**.

## Sistema de Autenticación

### Proveedor de Autenticación

El sistema utiliza Supabase Auth con OAuth 2.0 de Google:

Esta configuración establece la conexión segura entre nuestra plataforma y el servidor de seguridad (Supabase). Se encarga de tres cosas fundamentales de manera automática:
- **Persistencia:** Recuerda al usuario para que no tenga que iniciar sesión cada vez que recarga la página.
- **Renovación:** Actualiza automáticamente las credenciales de seguridad en segundo plano para que la sesión no expire abruptamente.
- **Detección:** Es capaz de leer enlaces especiales (como correos de recuperación) directamente desde la barra de direcciones del navegador.

### Flujo de Autenticación

1. Usuario hace click en "Continuar con Google" en `/login`
2. Supabase inicia el flujo OAuth con Google
3. Usuario autoriza la aplicación en Google
4. Google redirige a `/auth/callback` con código de autorización
5. `exchangeCodeForSession()` intercambia código por sesión
6. Redirección dinámica según el rol del usuario (ADMIN, MANAGER o HR) con sesión activa

### Página de Login

El botón de inicio de sesión acciona un mecanismo que abre la ventana segura de Google. Le indica al sistema que, una vez que el usuario elija su cuenta de correo y se valide correctamente, debe enviarlo de regreso a una "puerta de recepción" en nuestra plataforma (el callback) para dejarlo entrar. Si ocurre algún problema durante este proceso (como cancelar la ventana o un error de red), el sistema lo detecta y muestra un mensaje de alerta.

### Callback de Autenticación

Esta es la "puerta de recepción" inteligente del sistema. Funciona así:
1. Recibe al usuario que viene de Google y toma el "ticket de entrada" (código) que trae consigo.
2. Intercambia ese ticket por una credencial oficial y permanente para navegar por la plataforma.
3. Revisa la etiqueta de esa credencial para saber quién es la persona:
   - Si es **ADMINISTRADOR**, le abre las puertas a la consola de administración.
   - Si es **MANAGER**, lo dirige al panel comercial y de métricas gerenciales.
   - Si es **HR** (Recursos Humanos), lo lleva a su panel de gestión de personal.
4. Si por alguna razón el ticket es inválido, devuelve a la persona a la pantalla de inicio de sesión.

## Gestión de Estado Global

### Auth Store

Estado de autenticación gestionado con Zustand:

Esta es la "memoria principal" de la plataforma respecto a la identidad de la persona. Una vez que alguien entra, este espacio guarda y recuerda sus datos en todo momento (su ID, nombre, correo, foto de perfil y su rol en la empresa). 
Además, provee dos interruptores principales que el sistema puede usar en cualquier momento: uno para "guardar los datos del usuario" al entrar, y otro para "borrar todos los datos" al salir, asegurando que la información no quede expuesta.

### Sidebar Store

Estado del sidebar (colapsado/expandido):

Esta es una "memoria visual" más pequeña enfocada exclusivamente en la comodidad del usuario. Su único trabajo es recordar si el usuario prefiere tener el menú lateral abierto (expandido) o cerrado (colapsado). Así, a medida que la persona navega de una pantalla a otra, el menú no cambia de tamaño bruscamente y respeta su preferencia.

### Exportación Centralizada

El sistema agrupa las dos memorias anteriores (la de identidad y la del menú) en un solo punto de distribución. De esta forma, cualquier botón, pantalla o gráfico de la plataforma que necesite saber quién es el usuario o cómo está el menú, sabe exactamente a dónde ir a preguntar sin generar desorden en la estructura.

## Mapeo de Usuario

Utilidades para transformar el usuario de Supabase al formato de la aplicación:

La información que Google y el servidor de seguridad nos entregan suele venir desordenada o con datos innecesarios. Esta herramienta funciona como un "filtro organizador":
- Toma los datos crudos y extrae únicamente lo que nos importa: el correo, el rol y la foto.
- Si el usuario no tiene un rol asignado por defecto, el sistema lo protege asignándole el rol de Recursos Humanos (`HR`) como medida de seguridad.
- Incluye herramientas de limpieza de texto, asegurándose de que los nombres se lean bien (por ejemplo, eliminando espacios dobles o separando correctamente el nombre del apellido para mostrar un saludo amigable en la pantalla).

## Sincronización de Sesión

El Header sincroniza automáticamente el estado con Supabase:

Este es un vigilante invisible que vive en la barra superior de la pantalla. En el mismo instante en que se carga la página, verifica si hay alguien conectado. Pero no solo eso: se queda escuchando continuamente. Si el usuario decide cerrar sesión desde otra pestaña del navegador, o si su tiempo de acceso expira de forma natural, este vigilante se da cuenta inmediatamente y cierra la plataforma para proteger la información confidencial.

## Cierre de Sesión

El botón de salir ejecuta un proceso de limpieza en tres pasos:
1. Le avisa al servidor de seguridad central que destruya el acceso activo.
2. En caso de error, deja un registro interno para los desarrolladores.
3. Vacía por completo la "memoria principal" (Auth Store) para que no queden rastros del nombre o correo del usuario en la computadora, y lo expulsa hacia la página pública de inicio.

## Tipos TypeScript

### Tipos de Usuario

Este es el "libro de reglas" de la plataforma. Establece leyes estrictas que el sistema no puede romper:
- Dictamina que solo existen cuatro roles posibles en todo el sistema: `ADMIN`, `MANAGER`, `HR` o `user`. Nadie puede inventar un rol diferente.
- Define exactamente qué información es obligatoria cuando se crea un nuevo usuario o cuando se quiere actualizar uno existente (exigiendo siempre, por ejemplo, que haya un formato de correo válido).

### Tipos de Autenticación

Este es el molde estricto para los formularios de entrada. Asegura que el sistema siempre exija un correo y una contraseña para intentar entrar. A cambio, garantiza que una respuesta exitosa siempre devolverá una "llave digital" (token de acceso) y la ficha completa con los datos de la persona.

## Variables de Entorno

Variables necesarias para la autenticación:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | API Key pública de Supabase |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |