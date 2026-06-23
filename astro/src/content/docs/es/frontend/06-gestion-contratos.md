---
title: "Gestión de Contratos"
description: "Gestión de contratos: wizard de creación, tabla con filtros, paginación y acciones."
---

La página de contratos permite gestionar el ciclo de vida completo de los contratos. Su ruta depende del rol del usuario: `/manager/contracts`, `/hr/contracts` o `/worker/contracts`.

## NewContractModal (Wizard)

Modal de creación de contratos con flujo de 5 pasos:

| Step | Flow | Descripción |
|------|------|-------------|
| 1 | `select-action` | Elegir entre Upload PDF o Usar Plantilla |
| 2 | `select-template` | Seleccionar tipo de documento y plantilla |
| 3 | `services` | Seleccionar servicios asociados |
| 4 | `folder` | Seleccionar carpeta de almacenamiento |
| 5 | `fill-template` | Llenar campos dinámicos + preview en vivo |

### useContractGeneration

Hook que gestiona el estado completo del wizard. Proporciona:
- `currentWizardStep` - paso actual del wizard
- `flow` - flujo activo (`select-action` | `select-template` | `services` | `folder` | `fill-template` | `upload`)
- `fieldValues` - valores de campos del formulario
- `generatedDocument` - documento generado para preview
- `previewUrl` - URL del preview del documento
- `submitState` - estado del submit (`idle` | `loading` | `success` | `error`)

## ContractsTable

Tabla principal de contratos located in `features/contracts/components/ui/ContractsTable.tsx`.

### useContractsFilters

Hook que gestiona filtros, búsqueda y paginación:

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `filter` | `DocumentFilterValue` | Estado del contrato |
| `search` | `string` | Texto de búsqueda |
| `sortOrder` | `'newest' \\| 'oldest'` | Ordenamiento por fecha |
| `dateRange` | `{ start, end }` | Filtro por rango de fechas |
| `currentPage` | `number` | Página actual |
| `itemsPerPage` | `number` (default: 9) | Elementos por página |
| `paginatedContracts` | `DocumentFlatten[]` | Contratos de la página actual |
| `totalPages` | `number` | Total de páginas |

### Estados de Filtro

| Estado | Descripción |
|--------|-------------|
| `all` | Todos los contratos |
| `DRAFT` | Contratos en borrador |
| `PENDING_SIGNATURE` | Pendientes de firma |
| `ACTIVE` | Contratos activos |
| `EXPIRING_SOON` | Próximos a vencer |
| `EXPIRED` | Contratos vencidos |

## ContractsFolderTabs

Tabs para filtrar contratos por carpeta. Ubicado en `features/contracts/components/ui/ContractsFolderTabs.tsx`.

## Acciones

### ContractsActionsBar

Botones de acción por contrato individual:

| Acción | Descripción |
|--------|-------------|
| Ver | Abre preview PDF del contrato |
| Editar | Abre `ContractFormModal` para editar |
| Eliminar | Abre `ContractDeleteModal` para confirmar |

### TableBulkActionBar

Barra de acciones masivas cuando se seleccionan múltiples contratos.

### Eliminación Masiva

1. Usuario selecciona contratos
2. Click en "Eliminar" en `TableBulkActionBar`
3. `ContractDeleteModal` muestra confirmación
4. Se eliminan todos los seleccionados
5. Tabla se actualiza automáticamente

## Modales

| Modal | Props | Descripción |
|-------|-------|-------------|
| `NewContractModal` | `open`, `onClose`, `onSubmit`, `availableFolders`, `defaultFolderId` | Wizard de creación |
| `ContractFormModal` | `open`, `onClose`, `contract` | Formulario de edición |
| `ContractPreviewModal` | `open`, `onClose`, `documentId` | Preview PDF |
| `ContractDeleteModal` | `open`, `onClose`, `onConfirm` | Confirmación de eliminación |

## Integración con API

La gestión de contratos usa endpoints de documentos a través de la capa de queries con TanStack Query.

| Query | Descripción |
|-------|-------------|
| `getDocuments()` | Lista todos los contratos |
| `uploadDocument(formData)` | Crea contrato con archivo |
| `updateDocument(id, formData)` | Actualiza contrato |
| `deleteDocument(id)` | Elimina contrato |
| `getDocumentFileUrl(id)` | Obtiene URL firmada del PDF |
