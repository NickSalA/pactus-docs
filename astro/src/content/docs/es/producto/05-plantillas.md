---
title: Plantillas
description: Gestión de plantillas de contratos con campos dinámicos y generación de documentos PDF.
---

El módulo de **Plantillas** permite crear, gestionar y utilizar plantillas de contratos para estandarizar la documentación legal de la organización. Las plantillas soportan campos dinámicos, generación mediante IA y exportación a PDF.

## Estados de la Plantilla

| Estado | Descripción |
|--------|-------------|
| **DRAFT** | Borrador, editable, no disponible para uso |
| **PUBLISHED** | Publicada, disponible para generación de contratos |
| **ARCHIVED** | Archivada, inactiva pero conservada para referencia |

## Tipos de Documento

| Tipo | Código | Descripción |
|------|--------|-------------|
| **Contrato Laboral** | LABOR | Plantillas para contratos de trabajo |
| **Contrato Empresarial** | COMPANY | Plantillas para contratos entre empresas |

## Sistema de Campos Dinámicos

Las plantillas utilizan un sistema de campos que se sustituyen en el contenido del documento:

### Tipos de Campo

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| **text** | Textos cortos o párrafos | Nombre del cliente, dirección |
| **number** | Valores numéricos | Monto del servicio, horas semanales |
| **date** | Fechas | Fecha de inicio, fecha de fin |
| **time** | Horas específicas | Horario de trabajo, hora de reunión |
| **boolean** | Opciones sí/no | Incluye viáticos, requiere laptop |

### Estructura de Campo

Cada campo define:

| Propiedad | Descripción |
|-----------|-------------|
| **Código** | Identificador único (ej: `cliente_nombre`) |
| **Etiqueta** | Texto visible en el formulario (ej: "Nombre del Cliente") |
| **Tipo** | Tipo de dato del campo |
| **Requerido** | Si el campo es obligatorio |
| **Descripción** | Texto de ayuda para el usuario |

## Editor de Contenido

El editor de plantillas permite escribir el contenido en formato Markdown con marcadores de campo:

```markdown
# CONTRATO DE TRABAJO

Entre [EMPRESA_NOMBRE] (en adelante "EL EMPLEADOR")
y [TRABAJADOR_NOMBRE] (en adelante "EL TRABAJADOR")
identificado con DNI [TRABAJADOR_DNI]...

CLÁUSULA PRIMERA: DURACIÓN
El presente contrato tiene una duración de [CONTRATO_DURACION] meses,
comprendidos desde el [FECHA_INICIO] hasta el [FECHA_FIN].

CLÁUSULA SEGUNDA: REMUNERACIÓN
La remuneración mensual será de [MONTO] [MONEDA]...
```

Los marcadores `[CAMPO_CODIGO]` se sustituyen por los valores ingresados al generar el documento.

## Wizard de Creación

El proceso de creación de plantillas se organiza en 4 pasos:

### Paso 1: Tipo de Documento

| Campo | Descripción |
|-------|-------------|
| **Tipo de Documento** | LABOR o COMPANY |
| **Formato de Plantilla** | Código técnico, etiqueta descriptiva |

### Paso 2: Información Básica

| Campo | Descripción |
|-------|-------------|
| **Nombre** | Título de la plantilla |
| **Descripción** | Descripción breve del propósito |

### Paso 3: Editor de Contenido

| Elemento | Descripción |
|----------|-------------|
| **Editor Markdown** | Área de texto para escribir el contenido |
| **Insertar Campo** | Botón para agregar marcadores de campo |
| **Vista Previa** | Renderizado en tiempo real del contenido |

### Paso 4: Revisión y Guardado

| Elemento | Descripción |
|----------|-------------|
| **Resumen** | Vista consolidada de toda la configuración |
| **Campos Configurados** | Lista de todos los campos definidos |
| **Acciones** | Guardar como borrador o publicar |

## Campos Operacionales

Además de los campos visibles, existen campos operacionales requeridos por el backend:

| Campo | Descripción |
|-------|-------------|
| **Campo de Fecha Inicio** | Identificador del campo que representa la fecha de inicio |
| **Campo de Fecha Fin** | Identificador del campo que representa la fecha de fin |
| **Campos Extra** | Datos adicionales requeridos internamente |

## Generación de Borradores con IA

Pactus permite generar borradores de plantillas mediante **Gemini**:

### Desde Archivo PDF

| Paso | Descripción |
|------|-------------|
| 1. **Subir PDF** | Cargar un contrato existente como referencia |
| 2. **Análisis IA** | Gemini extrae estructura, cláusulas y campos |
| 3. **Generar Plantilla** | Se crea una plantilla con campos identificados |
| 4. **Revisión** | El usuario edita y ajusta la plantilla generada |

### Desde Descripción

| Paso | Descripción |
|------|-------------|
| 1. **Ingresar Descripción** | Describir el tipo de contrato deseado |
| 2. **Prompt a Gemini** | Se envía la descripción al modelo |
| 3. **Generar Contenido** | Gemini genera estructura y campos sugeridos |
| 4. **Personalización** | El usuario ajusta según necesidades |

## Renderizado y Generación de PDF

### Renderizado con Jinja2

El contenido de la plantilla se procesa mediante **Jinja2**:

1. **Sustitución de Variables**: Los marcadores `[CAMPO]` se reemplazan por valores
2. **Formateo de Fechas**: Las fechas se formatean según configuración regional
3. **Formato de Moneda**: Los montos se formatean con símbolo y decimales

### Conversión a PDF

El markdown renderizado se convierte a PDF mediante:

| Herramienta | Descripción |
|-------------|-------------|
| **gemma_pdf** | Conversión directa de markdown a PDF |
| **WeasyPrint** | Renderizado HTML/CSS a PDF |

## Gestión de Formatos

Cada plantilla puede definir formatos para los campos:

| Formato | Descripción |
|---------|-------------|
| **Código** | Identificador único del formato |
| **Etiqueta** | Nombre descriptivo |
| **Descripción** | Detalle adicional |

## Previsualización

Antes de generar un contrato, el sistema permite:

| Acción | Descripción |
|--------|-------------|
| **Preview de Plantilla** | Ver cómo se verá el documento final |
| **Preview de Campos** | Revisar los valores sustituidos |
| **Validación** | Verificar campos requeridos |

## Acceso y Permisos

| Rol | Acceso |
|-----|--------|
| **ADMIN** | Crear, editar, eliminar, publicar plantillas |
| **MANAGER** | Ver y usar plantillas COMPANY |
| **WORKER** | Ver y usar plantillas COMPANY |