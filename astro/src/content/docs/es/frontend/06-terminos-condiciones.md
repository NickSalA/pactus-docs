---
title: "Páginas Legales"
description: "Páginas de términos de servicio, política de privacidad y enlaces desde el login."
---

ContractIA incluye páginas legales para cumplir con requisitos legales y de transparencia: Términos de Servicio y Política de Privacidad.

## Páginas Disponibles

| Ruta | Título | Descripción |
|-----|--------|-------------|
| `/terminos` | Términos de Servicio | Condiciones de uso de la plataforma |
| `/privacidad` | Política de Privacidad | Manejo de datos personales |

## Términos de Servicio

### Ubicación

```
src/app/(legal)/terms-of-service/page.tsx
```

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

### metadata

```typescript
export const metadata: Metadata = {
  title: "Términos de Servicio | ContractAI",
  description: "Términos de Servicio de ContractAI.",
};
```

### Fecha de Actualización

Última actualización: **17/04/2026**

## Política de Privacidad

### Ubicación

```
src/app/(legal)/privacy-policy/page.tsx
```

Similar estructura a Términos de Servicio, enfocándose en:
- Recopilación de datos
- Uso de información
- Cookies y almacenamiento
- Derechos del usuario

## Route Group (legal)

Ambas páginas utilizan el route group `(legal)` que no incluye el layout con Sidebar/Header, permitiendo un diseño limpio sin navegación:

```text
src/app/
├── (legal)/
│   ├── terms-of-service/
│   │   └── page.tsx
│   └── privacy-policy/
│       └── page.tsx
```

## Enlaces desde Login

Las páginas legales tienen enlaces accesibles desde la página de login:

```typescript
// En la página de login
<Link href="/terminos">Términos de Servicio</Link>
<Link href="/privacidad">Política de Privacidad</Link>
```

## Estilo de las Páginas

Las páginas legales siguen un estilo consistente:

```typescript
<article className="mx-auto max-w-3xl space-y-8 leading-7 text-slate-700">
  <header className="space-y-3 border-b border-slate-200 pb-8">
    <h1 className="text-4xl font-bold tracking-tight text-slate-950">Título</h1>
  </header>
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-slate-950">Sección</h2>
  </section>
</article>
```

| Elemento | Clase |
|---------|-------|
| Contenedor | `mx-auto max-w-3xl` |
| Espaciado | `space-y-8` |
| Título | `text-4xl font-bold` |
| Subtítulo | `text-2xl font-semibold` |
| Texto | `text-slate-700` |

## metadata Global

Ambas páginas exportan metadata para SEO:

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio | ContractAI",
  description: "Términos de Servicio de ContractAI.",
};
```

## Vínculos Legales

Desde otras páginas se puede enlazar:

```typescript
import Link from "next/link";

<Link href="/terminos">Términos de Servicio</Link>
<Link href="/privacidad">Política de Privacidad</Link>
```

## Consideraciones Legales

- **Fecha de actualización**: Actualizar whenever hay cambios
- **Jurisdicción**: Perú
- **Email de contacto**: `jmedina@cmtperu.pe`
- **Acceso**: Sin autenticación requerida