---
title: "Gestión de Contratos"
description: "Gestión avanzada de contratos: selección múltiple, filtros, acciones masivas y paginación."
---

La gestión de contratos en ContractIA evolucionó para incluir capacidades avanzadas de selección múltiple, filtros por fecha, ordenamiento y acciones masivas sobre múltiples documentos.

## Componentes Principales

El sistema de gestión de contratos se compone de varios componentes que trabajan juntos:

- `TableBulkActionBar`: Barra de acciones masivas
- `ContractsTable`: Tabla con selección múltiple (ajusta su contenido dinámicamente según el rol: `COMPANY` para Manager, `LABOR` para HR).
- `ContractsActionsBar`: Acciones sobre contratos
- `AddContractWizard`: Formulario modal asistido para crear contratos a partir de plantillas con vista previa del PDF.
- `useContractsFilters`: Hook de filtros y paginación
- `useContractsPage`: Hook de gestión de página

## Selección Múltiple

### TableBulkActionBar

El componente `TableBulkActionBar` permite realizar acciones sobre múltiples elementos seleccionados simultáneamente:

```typescript
// src/components/ui/TableBulkActionBar.tsx
type TableBulkActionBarProps = {
  isDeleting?: boolean;
  itemLabel?: string;
  onDelete: () => Promise<void>;
  onDeselectAll: () => void;
  onSelectAll?: () => void;
  selectedCount: number;
  totalCount?: number;
};
```

Funcionalidades:
- Muestra el conteo de elementos seleccionados
- Permite seleccionar todos los elementos
- Permite deseleccionar todos
- Confirmación antes de eliminar
- Soporte para estados de carga

### ContratosSelection

La tabla de contratos permite selección individual y masiva:

```typescript
// Selección individual
const handleSelect = (id: number) => {
  setSelectedIds(prev =>
    prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]
  );
};

// Selección de todos
const handleSelectAll = () => {
  setSelectedIds(contracts.map(c => c.id));
};
```

## Sistema de Filtros

### useContractsFilters

El hook `useContractsFilters` управula todos los filtros de la página de contratos:

```typescript
// src/features/contracts/hooks/use-contracts-filters.ts
export type SortOrder = "newest" | "oldest";
export type DateRange = { end: string | null; start: string | null };

export function useContractsFilters(activeContracts: Document[]) {
  const [filter, setFilter] = useState<DocumentFilterValue>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [dateRange, setDateRange] = useState<DateRange>({ end: null, start: null });
}
```

### Tipos de Filtro

| Filtro | Descripción |
|-------|-------------|
| `all` | Mostrar todos los contratos |
| `DRAFT` | Contratos en borrador |
| `PENDING_SIGNATURE` | Contratos pendientes de firma |
| `ACTIVE` | Contratos activos |
| `EXPIRING_SOON` | Contratos próximos a vencer |
| `EXPIRED` | Contratos vencidos |

### Ordenamiento

El sistema permite ordenar por fecha de inicio:

```typescript
result = [...result].sort((a, b) => {
  const cmp = a.start_date.localeCompare(b.start_date);
  return sortOrder === "newest" ? -cmp : cmp;
});
```

| Orden | Descripción |
|-------|-------------|
| `newest` | Más recientes primero |
| `oldest` | Más antiguos primero |

### Filtro por Rango de Fechas

```typescript
const filteredByDate = contracts.filter((contract) => {
  const date = contract.start_date;
  if (dateRange.start && date < dateRange.start) return false;
  if (dateRange.end && date > dateRange.end) return false;
  return true;
});
```

## Paginación

### Configuración

| Parámetro | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `currentPage` | 1 | Página actual |
| `itemsPerPage` | 9 | Elementos por página |
| `totalPages` | Calculado | Total de páginas |

### Cálculo de Páginas

```typescript
const totalPages = Math.max(1, Math.ceil(filteredContracts.length / itemsPerPage));
const startIndex = (safeCurrentPage - 1) * itemsPerPage;
const paginatedContracts = filteredContracts.slice(startIndex, startIndex + itemsPerPage);
```

### Cambios de Página

```typescript
const changePage = useCallback((page: number) => {
  setCurrentPage(Math.max(1, Math.min(page, totalPages)));
}, [totalPages]);

const changeItemsPerPage = useCallback((value: number) => {
  setItemsPerPage(value);
  setCurrentPage(1);
}, []);
```

## Acciones Masivas

### ContractsActionsBar

El componente `ContractsActionsBar` permite realizar acciones sobre múltiples contratos seleccionados:

```typescript
type ContractsActionsBarProps = {
  selectedCount: number;
  onDeselectAll: () => void;
  onDelete: (ids: number[]) => Promise<void>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
};
```

| Acción | Descripción |
|--------|-------------|
| Ver | Abrir documento PDF |
| Editar | Abrir modal de edición |
| Eliminar | Confirmar y eliminar en lote |

### Flujo de Eliminación Masiva

1. Usuario selecciona múltiples contratos
2. Hace click en "Eliminar"
3. Sistema muestra modal de confirmación
4. Usuario confirma
5. Sistema elimina cada contrato
6. Actualiza la tabla

## Creación de Contratos (Wizard)

El flujo de creación de contratos se ha modernizado. Además de la subida tradicional de archivos PDF, los usuarios ahora utilizan un flujo asistido (**Wizard**) integrado con el sistema de plantillas:

1. **Selección de Plantilla:** El usuario elige una plantilla predefinida y activa.
2. **Llenado de Datos:** Se renderiza un formulario dinámico basado en los campos requeridos por la plantilla (ej. nombre, montos, fechas).
3. **Previsualización:** El sistema genera una vista previa del documento en tiempo real antes de confirmarlo.
4. **Generación:** Al guardar, se envía el `template_id` y el `form_data` al backend para crear el contrato estructurado.

## Integración con la API

### Endpoints Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/documents` | Lista de documentos  |
| `POST` | `/documents` | Crear documento |
| `PATCH` | `/documents/{id}` | Actualizar documento |
| `DELETE` | `/documents/{id}` | Eliminar documento |

### Ejemplo de Eliminación Masiva

```typescript
const handleBulkDelete = async (ids: number[]) => {
  setIsDeleting(true);
  try {
    await Promise.all(
      ids.map(id => fetch(`/documents/${id}`, { method: "DELETE" }))
    );
    await refresh();
  } finally {
    setIsDeleting(false);
  }
};
```

## Hook useContractsPage

El hook `useContractsPage` gestiona el estado completo de la página de contratos:

```typescript
// src/features/contracts/hooks/use-contracts-page.ts
export function useContractsPage(contracts: Document[]) {
  const filters = useContractsFilters(contracts);
  // ... estado adicional
}
```

Proporciona:
- Estado de carga
- Manejo de errores
- Refresh de datos
- Actualización de tabla

## Estados de Interfaz

### Estado Vacío

Cuando no hay contratos:

```typescript
if (isEmpty) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">No hay contratos</p>
    </div>
  );
}
```

### Estado de Carga

Durante operaciones:

```typescript
{isDeleting && (
  <div className="flex items-center gap-2">
    <Spinner />
    <span>Eliminando...</span>
  </div>
)}
```

## Mejores Prácticas

1. **Limitar selección**: Evitar seleccionar más de 100 elementos a la vez
2. **Confirmar acciones destructivas**: Siempre confirmar antes de eliminar
3. **Feedback inmediato**: Mostrar estados de carga
4. **Manejar errores**: Revertir estado en caso de error
5. **Paginación adecuada**: No mostrar más de 50 elementos por página
