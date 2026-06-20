---
title: Landing Page
description: Estructura y componentes de la página de inicio pública de Pactus.
---

La Landing Page (`/`) es la puerta de entrada pública a la plataforma. Está construida como una página scrollable con una sola sección principal por componente.

## Estructura General

```
src/app/page.tsx  →  HomePage
  <main className="min-h-screen bg-white">
    <Navbar />
    <HeroSection />
    <AboutSection />
    <MissionVisionSection />
    <CapabilitiesSection />
    <RagAiSection />
    <FinalCtaSection />
    <ContactFooter />
  </main>
```

## Secciones

### Navbar

Barra de navegación fija (sticky) con:

- Logo + marca **Pactus**
- Enlaces de navegación con smooth-scroll a anclas:
  - `#quienes-somos`
  - `#mision-vision`
  - `#capacidades`
  - `#ia-rag`
  - `#contacto`
- Botón CTA **"Iniciar sesión"** que redirige a `/login`

### HeroSection

Sin ID de ancla. Dos columnas:

- **Columna izquierda**: `FeaturePill` con icono de IA contractual, headline principal ("Inteligencia para los Contratos Modernos" con branding), párrafo descriptivo, dos CTAs (`/login` y `#capacidades`), tres highlights en pills (Gestión contractual, Agente IA con RAG, Control por roles).
- **Columna derecha**: Mockup de laptop con imagen `/imagen-ContractAI-laptop.png`.

### AboutSection (`#quienes-somos`)

Dos columnas:

- **Izquierda**: Encabezado "Quiénes somos"
- **Derecha**: Párrafos descriptivos de la propuesta de valor

Debajo: tres `IconCard`:
| Título | Descripción |
|--------|-------------|
| Ciclo contractual completo | Desde ingesta documental hasta análisis y generación |
| Control organizacional | Datos separados por organización, permisos por rol |
| Enfoque empresarial | Diseñado para contratos laborales y empresariales |

### MissionVisionSection (`#mision-vision`)

Variante `dark` del contenedor `LandingSection`. Dos `IconCard`:

| Título | Descripción |
|--------|-------------|
| Misión | Simplificar y automatizar la gestión contractual con IA |
| Visión | Convertirse en plataforma confiable con precisión legal y análisis inteligente |

### CapabilitiesSection (`#capacidades`)

Header centrado + grid de 4 columnas con 8 `IconCard`:

| Icono | Título |
|-------|--------|
| BarChart3 | Dashboard ejecutivo |
| FileText | Gestión de contratos |
| Bot | Agente IA |
| FileStack | Plantillas inteligentes |
| UsersRound | Administración |
| BellRing | Alertas y notificaciones |
| ShieldCheck | Seguridad y roles |
| FolderSync | Google Drive |

### RagAiSection (`#ia-rag`)

Variante `blue` del contenedor `LandingSection`. Contenedor con:

- **Izquierda**: Descripción de RAG + IA
- **Derecha**: Flujo de 4 pasos (Pregunta → Búsqueda RAG → Contexto contractual → Respuesta fundamentada) con iconos y 6 `FeaturePill` con características:
  - Búsqueda semántica sobre contratos cargados
  - Respuestas contextualizadas y trazables
  - Citas o referencias a documentos fuente
  - Filtrado por permisos y rol del usuario
  - Memoria conversacional para mantener contexto
  - Visualizaciones dinámicas para datos estructurados

### FinalCtaSection

Sin ID de ancla. Card centrado con:

- Texto: "Moderniza la gestión contractual de tu organización"
- Dos CTAs (iniciar sesión y conocer capacidades)

### ContactFooter (`#contacto`)

Variante `dark`. Grid de 3 columnas:

- **Columna 1**: Logo + marca + descripción
- **Columna 2**: Datos de contacto (email, teléfono, ubicación, LinkedIn) definidos en `landingContent.ts`
- **Columna 3**: Enlaces del footer: Iniciar sesión, Política de Privacidad, Términos de Servicio

## Componentes Compartidos

Los componentes de la landing page viven en `src/components/home/` y `src/components/home/shared/`:

| Componente | Props | Variantes |
|------------|-------|-----------|
| `LandingSection` | `id`, `variant`, `children` | `white` (fondo blanco), `blue` (fondo azul claro), `dark` (fondo oscuro) |
| `SectionHeader` | `eyebrow`, `title`, `description`, `theme` | Soporta tema claro/oscuro |
| `IconCard` | `icon`, `title`, `description` | light, dark, hover |
| `FeaturePill` | `icon?`, `children`, `variant?` | pill estándar o con icono |
| `CtaButton` | `href`, `variant`, `showArrow?` | `primary` (relleno), `secondary` (borde) |
| `BrandMark` | - | Logo + texto "Pactus" |
| `useSmoothScroll` | - | Hook para scroll suave a anclas |

El contenido textual y de navegación está centralizado en `landingContent.ts`, que exporta: `navItems`, `heroHighlights`, `aboutHighlights`, `missionVisionItems`, `capabilities`, `ragFlow`, `ragFeatures`, `contactItems`, `footerLinks`.
