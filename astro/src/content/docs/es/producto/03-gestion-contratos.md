---
title: Gestión de Contratos
description: Funcionalidades completas para crear, editar, visualizar y gestionar contratos en Pactus.
---

El módulo de **Gestión de Contratos** es el núcleo operativo de Pactus. Permite administrar el ciclo de vida completo de los contratos legales mediante una interfaz intuitiva con tabla paginada, filtros avanzados y herramientas de importación.

## Tipos de Contrato

Pactus soporta dos tipos fundamentales de contratos:

| Tipo | Código | Descripción | Roles con Acceso |
|------|--------|-------------|------------------|
| **Laboral** | LABOR | Contratos de trabajo individuales | ADMIN, WORKER |
| **Empresarial** | COMPANY | Contratos entre empresas | ADMIN, MANAGER |

## Estados del Contrato

Cada contrato atraviesa diferentes estados a lo largo de su ciclo de vida:

| Estado | Descripción |
|--------|-------------|
| **DRAFT** | Borrador, en proceso de creación |
| **PENDING_SIGNATURE** | Pendiente de firma |
| **ACTIVE** | Contrato vigente |
| **EXPIRING** | Próximo a vencer (30 días antes del fin) |
| **EXPIRED** | Contrato cuya fecha de fin ya pasó |
| **CANCELLED** | Contrato cancelado |
| **SUSPENDED** | Contrato suspendido temporalmente |

## Gestión de Carpetas

Los contratos se organizan en carpetas que corresponden a los roles de los usuarios:

| Carpeta | Rol | Descripción |
|---------|-----|-------------|
| **Contratos Admin** | ADMIN | Carpeta principal para administradores |
| **Contratos Manager** | MANAGER | Carpeta para contratos empresariales |
| **Contratos Worker** | WORKER | Carpeta para contratos laborales |

### Operaciones de Carpeta

| Operación | Descripción |
|-----------|-------------|
| **Crear carpeta** | Crear nueva carpeta para organizar contratos |
| **Renombrar carpeta** | Cambiar el nombre de una carpeta existente |
| **Eliminar carpeta** | Eliminar carpeta vacía |

## Formulario de Contrato (Wizard)

El formulario de creación y edición de contratos se organiza en 4 pasos:

### Paso 1: Datos Generales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Nombre** | texto | Título o nombre del contrato |
| **Cliente** | texto | Nombre del cliente o trabajador |
| **Tipo de Documento** | select | LABOR o COMPANY |
| **Fecha de Inicio** | fecha | Fecha de inicio del contrato |
| **Fecha de Fin** | fecha | Fecha de fin del contrato (opcional) |

### Paso 2: Documento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Archivo PDF** | file | Archivo del contrato (opcional) |
| **URL del documento** | texto | URL del archivo en Supabase Storage |

### Paso 3: Servicios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Servicios** | lista | Items de servicio con descripción, valor y moneda |
| **Moneda** | select | PEN, USD, EUR |
| **Validación** | automática | Verifica alineación de monedas y períodos |

### Paso 4: Resumen

| Sección | Descripción |
|---------|-------------|
| **Resumen de Campos** | Vista consolidada de todos los datos ingresados |
| **Edición inline** | Posibilidad de volver a cualquier paso |

## Extracción Inteligente con IA

Al subir un PDF, el sistema utiliza **Gemini** para extraer automáticamente:

| Campo | Descripción |
|-------|-------------|
| **Nombre del cliente/trabajador** | Extraído del texto del contrato |
| **Fechas del contrato** | Fecha de inicio y fin detectadas |
| **Montos y moneda** | Valores monetarios identificados |
| **Tipo de contrato** | Clasificación automática |
| **Servicios incluidos** | Items de servicio detectados |

## Importación desde Google Drive

Pactus permite importar contratos directamente desde Google Drive:

### Flujo de Importación

1. **Autenticación**: Popup OAuth de Google (Google Identity Services)
2. **Selector de Archivos**: Google Picker muestra archivos disponibles
3. **Selección**: Usuario selecciona archivos PDF de Drive
4. **Envío al Backend**: Archivos y metadata se envían a `POST /integrations/drive/import`
5. **Proceso en Segundo Plano**: El backend descarga, procesa e indexa
6. **Seguimiento en Tiempo Real**: Eventos SSE muestran progreso (PENDING → DATABASE → KNOWLEDGE_BASE → COMPLETED)

### Estados de Importación

| Estado | Descripción |
|--------|-------------|
| **Cargando** | El archivo se está descargando de Drive |
| **Procesando** | Se está parseando y extrayendo información |
| **Éxito** | Contrato importado correctamente |
| **Error** | Fallo en la importación (archivo corrupto, no soportado) |

## Operaciones de Contrato

### Tabla de Contratos

| Característica | Descripción |
|----------------|-------------|
| **Paginación** | Navegación por páginas de 10, 25, 50 registros |
| **Búsqueda** | Filtrado por nombre o cliente |
| **Filtros de Estado** | Filtrado rápido por estado del contrato |
| **Filtro de Fechas** | Filtrado por rango de fechas |
| **Ordenamiento** | Orden por cualquier columna |

### Acciones Disponibles

| Acción | Descripción |
|--------|-------------|
| **Crear** | Abrir wizard de nuevo contrato |
| **Editar** | Modificar datos y archivo del contrato |
| **Vista Previa** | Ver contenido del contrato en modal |
| **Eliminar** | Eliminar contrato individual |
| **Bulk Delete** | Eliminar múltiples contratos seleccionados |

## Almacenamiento de Archivos

Los archivos PDF se almacenan en **Supabase Storage** con:

| Característica | Descripción |
|----------------|-------------|
| **Rutas por Organización** | `organizations/{org_id}/documents/{doc_id}/file.pdf` |
| **URLs Firmadas** | Acceso temporal seguro a los archivos |
| **Extracción de Texto** | Conversión a Markdown mediante LlamaParser |