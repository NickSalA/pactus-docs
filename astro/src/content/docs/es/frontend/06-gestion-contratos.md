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

**Configuración de la Barra de Acciones:**
Este es el "plano de construcción" para la barra superior que aparece al seleccionar contratos. Define las herramientas que la barra necesita para funcionar correctamente en pantalla: requiere saber cuántos elementos hay seleccionados en total, tener conectada la orden para deseleccionarlos todos de un golpe, la orden de eliminación, y un interruptor para cambiar su estado visual si el sistema se encuentra procesando una solicitud (cargando).

Funcionalidades:
- Muestra el conteo de elementos seleccionados
- Permite seleccionar todos los elementos
- Permite deseleccionar todos
- Confirmación antes de eliminar
- Soporte para estados de carga

### ContratosSelection

La tabla de contratos permite selección individual y masiva:

**Mecanismos de Selección:**
El sistema utiliza dos interruptores lógicos para manejar las casillas de verificación:
- **Selección Individual:** Actúa como un botón de encendido/apagado. Al hacer clic en un contrato, el sistema revisa su memoria; si el contrato ya estaba en la lista de seleccionados, lo saca; si no estaba, lo agrega.
- **Selección de todos:** Es un atajo de barrido. Toma los identificadores únicos (IDs) de todos los contratos que el usuario está viendo actualmente en la pantalla y los marca como seleccionados en un solo movimiento.

## Sistema de Filtros

### useContractsFilters

El hook `useContractsFilters` управula todos los filtros de la página de contratos:

**Centro de Control de Búsqueda:**
Esta es la "memoria de búsqueda" de la pantalla. Se encarga de guardar y recordar en todo momento las preferencias exactas del usuario: qué palabra escribió en el buscador superior, qué estado de contrato desea ver (todos, activos, vencidos), en qué página específica de la tabla se encuentra, cuántas filas pidió ver por página, si prefiere el orden de más recientes o más antiguos, y qué rango de fechas del calendario tiene seleccionado.

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

**Motor de Ordenamiento Cronológico:**
Es un proceso automático que toma toda la lista de contratos encontrados y los compara entre sí basándose estrictamente en su fecha de inicio. Dependiendo del filtro activo que haya elegido el usuario, reorganiza toda la lista de arriba hacia abajo para mostrar primero los contratos más nuevos, o invertirá completamente el orden para mostrar los más antiguos arriba.

| Orden | Descripción |
|-------|-------------|
| `newest` | Más recientes primero |
| `oldest` | Más antiguos primero |

### Filtro por Rango de Fechas

**Motor de Filtrado por Fechas:**
Funciona como un embudo estricto al consultar el calendario. Revisa la fecha de cada contrato uno por uno y se hace dos preguntas: "¿Esta fecha ocurre antes del día de inicio que puso el usuario?" (Si la respuesta es sí, oculta el contrato). "¿Esta fecha ocurre después del límite final del calendario?" (Si es sí, lo oculta). Solo los contratos que pasan exitosamente ambas pruebas se renderizan en la pantalla.

## Paginación

### Configuración

| Parámetro | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `currentPage` | 1 | Página actual |
| `itemsPerPage` | 9 | Elementos por página |
| `totalPages` | Calculado | Total de páginas |

### Cálculo de Páginas

**Matemática de Paginación:**
Es la calculadora interna de la tabla visual. Primero, toma el total de contratos filtrados y lo divide entre la cantidad que se permite mostrar por pantalla para saber con exactitud cuántas páginas existirán en total. Luego, hace un "corte exacto" en la lista de datos (por ejemplo, tomar del elemento 1 al 9, o del 10 al 18) para mostrarle al usuario únicamente el bloque de contratos que corresponde a la página que está visitando en ese segundo.

### Cambios de Página

**Controles de Navegación Segura:**
Son las reglas de tránsito para moverse entre las páginas de la tabla. 
- Una regla evita que el usuario navegue hacia páginas "fantasma" que no existen (como intentar ir a la página 0 o a una página mayor al límite final). 
- La otra regla asegura que, si el usuario decide cambiar repentinamente la cantidad de contratos que quiere ver por pantalla (de 9 a 20, por ejemplo), el sistema lo regrese automáticamente a la página 1. Esto evita errores visuales o que la tabla muestre espacios vacíos.

## Acciones Masivas

### ContractsActionsBar

El componente `ContractsActionsBar` permite realizar acciones sobre múltiples contratos seleccionados:

**Configuración de Botones Individuales:**
Establece las reglas para los tres botones de control que acompañan a cada contrato en la tabla. Asegura que funciones como "Ver", "Editar" o "Eliminar" no actúen a ciegas, sino que sepan con precisión milimétrica sobre qué identificador de contrato (ID) deben ejecutar su acción cuando el usuario hace clic.

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

**Proceso de Eliminación Simultánea:**
Es un flujo de trabajo de alta velocidad diseñado para ahorrar tiempo. Cuando el usuario confirma que desea borrar varios contratos, el sistema:
1. Enciende una señal visual indicando que está ocupado.
2. En lugar de borrar los contratos uno por uno de forma lenta, envía una orden de eliminación al servidor para todos los contratos *al mismo tiempo* (en paralelo).
3. Espera a que el servidor confirme que terminó de destruir el último archivo.
4. Refresca la tabla automáticamente para mostrar la lista limpia de contratos y apaga la señal de carga.

## Hook useContractsPage

El hook `useContractsPage` gestiona el estado completo de la página de contratos:

**Director General de la Página:**
Este es el controlador principal que orquesta todas las piezas del módulo. En lugar de que la tabla visual intente manejar por su cuenta las matemáticas de la paginación, los filtros del buscador y la comunicación con el servidor, este "director" organiza todo el trabajo pesado tras bambalinas. Simplemente le entrega a la pantalla los contratos ya procesados y listos para mostrar.

Proporciona:
- Estado de carga
- Manejo de errores
- Refresh de datos
- Actualización de tabla

## Estados de Interfaz

### Estado Vacío

Cuando no hay contratos:

**Visualización de Tabla Vacía:**
Es una regla de diseño amable. Si el sistema detecta que la base de datos de contratos está vacía (o que la palabra que escribió el usuario en el buscador no arrojó ninguna coincidencia), oculta la tabla y muestra un área limpia con un mensaje central diciendo "No hay contratos", evitando confusiones de carga.

### Estado de Carga

Durante operaciones:

**Señalizador de Trabajo en Progreso:**
Es una protección visual para el usuario. Durante operaciones delicadas que toman unos segundos de internet (como la eliminación), el sistema despliega un ícono animado giratorio acompañado del texto "Eliminando...". Esto comunica claramente que el sistema está trabajando en la solicitud y evita que el usuario frustrado haga clics repetidos.

## Mejores Prácticas

1. **Limitar selección**: Evitar seleccionar más de 100 elementos a la vez
2. **Confirmar acciones destructivas**: Siempre confirmar antes de eliminar
3. **Feedback inmediato**: Mostrar estados de carga
4. **Manejar errores**: Revertir estado en caso de error
5. **Paginación adecuada**: No mostrar más de 50 elementos por página