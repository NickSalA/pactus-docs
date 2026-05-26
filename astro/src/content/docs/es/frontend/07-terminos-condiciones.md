---
title: "Páginas Legales"
description: "Páginas de términos de servicio, política de privacidad y enlaces desde el login."
---

ContractIA incluye páginas legales para cumplir con requisitos legales y de transparencia: Términos de Servicio y Política de Privacidad.

## Páginas Disponibles

| Ruta | Título | Descripción |
|-----|--------|-------------|
| `/terms-of-service` | Términos de Servicio | Condiciones de uso de la plataforma |
| `/privacy-policy` | Política de Privacidad | Manejo de datos personales |

## Términos de Servicio

### Ubicación

**Directorio Legal:** Los archivos de texto correspondientes a los términos de servicio se encuentran alojados en la sección pública y aislada de la plataforma, garantizando que cualquiera pueda leerlos sin necesidad de tener una cuenta.

### Contenido

Los términos incluyen:

1. **Descripción del servicio**: Funcionalidades de ContractIA
2. **Uso permitido**: Normas de uso legal
3. **Cuentas**: Responsabilidades del usuario
4. **Datos y contenido**: Propiedad del usuario
5. **Integración con Google**: Permisos y revocación
6. **Servicios de terceros**: Limitaciones
7. **Limitación de responsabilidad**: Garantías y responsabilidades
8. **Terminación**: Causas de suspensión
9. **Cambios en el servicio**: Modificaciones
10. **Legislación aplicable**: Leyes de Perú
11. **Contacto**: Email de soporte

### Metadata

**Configuración SEO y Pestaña del Navegador:** Es una etiqueta de configuración invisible que le dice al navegador de internet qué título exacto mostrar en la pestaña superior (por ejemplo: "Términos de Servicio | ContractAI"). También provee una breve descripción oficial que plataformas como Google o WhatsApp utilizarán si alguien comparte el enlace.

### Fecha de Actualización

Última actualización: **17/04/2026**

## Política de Privacidad

### Ubicación

**Directorio Legal:** Al igual que los términos de servicio, la política de privacidad reside en una carpeta de acceso público directo, separada del panel de control privado de los usuarios.

Similar estructura a Términos de Servicio, enfocándose en:
- Recopilación de datos
- Uso de información
- Cookies y almacenamiento
- Derechos del usuario

## Route Group (legal)

Ambas páginas utilizan el route group `(legal)` que no incluye el layout con Sidebar/Header, permitiendo un diseño limpio sin navegación:

**Entorno de Lectura Aislado:**
El sistema agrupa automáticamente todas las páginas legales en un "entorno limpio". Esto significa que la plataforma sabe que, al entrar aquí, el usuario viene a leer documentos extensos. Por lo tanto, el sistema apaga e invisibiliza intencionalmente el menú lateral interactivo y la barra superior de usuario, evitando cualquier distracción visual.

## Enlaces desde Login

Las páginas legales tienen enlaces accesibles desde la página de login:

**Accesos Rápidos de Confianza:**
En la parte inferior de la pantalla de inicio de sesión, el sistema provee enlaces de conexión directa. Estos no son enlaces web tradicionales que recargan toda la página; son conexiones internas optimizadas que transportan al usuario al documento legal de manera instantánea, sin tiempos de carga en blanco.

## Estilo de las Páginas

Las páginas legales siguen un estilo consistente:

**Plantilla Visual de Lectura Óptima:**
La plataforma aplica un molde estricto de diseño editorial enfocado en que los textos legales, que suelen ser muy largos, no cansen la vista del usuario. Para lograrlo, el sistema automáticamente:
- Centra todo el contenido en medio de la pantalla y le pone un límite de ancho máximo, evitando que el ojo del usuario tenga que viajar excesivamente de izquierda a derecha en monitores grandes.
- Añade un espacio de respiro generoso entre los títulos y los párrafos.
- Pinta el texto de un color gris oscuro muy sutil (en lugar de un negro puro) para reducir el contraste brusco con el fondo blanco y evitar la fatiga visual.

| Elemento | Clase |
|---------|-------|
| Contenedor | `mx-auto max-w-3xl` |
| Espaciado | `space-y-8` |
| Título | `text-4xl font-bold` |
| Subtítulo | `text-2xl font-semibold` |
| Texto | `text-slate-700` |

## Metadata Global

Ambas páginas exportan metadata para SEO:

**Estandarización de Identidad Digital:**
Asegura que, sin importar a cuál de las páginas legales entre el usuario, el motor de búsqueda siempre rec