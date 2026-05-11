---
title: Dashboard
description: Panel principal de ContractIA con métricas, documentos recientes y acciones rápidas.
---

El **Dashboard** es el punto de entrada principal de ContractIA tras la autenticación. Proporciona una vista consolidada del estado de los contratos y accesos directos a las funcionalidades más importantes del sistema.

## Estructura del Dashboard

El Dashboard se organiza en tres secciones principales:

| Sección | Descripción |
|---------|-------------|
| **Bienvenida Personalizada** | Saludo con el nombre del usuario conectado |
| **Tabla de Documentos Recientes** | Últimos contratos modificados con acceso rápido |
| **Acciones Rápidas** | Botones para crear contrato o importar desde Google Drive |

## Documentos Recientes

La tabla de documentos recientes muestra los últimos contratos modificados en la organización:

| Columna | Descripción |
|--------|-------------|
| **Nombre** | Título del contrato |
| **Cliente** | Nombre del cliente o trabajador |
| **Tipo** | LABOR o COMPANY |
| **Estado** | Estado actual del contrato |
| **Fecha de Inicio** | Fecha de inicio del contrato |

## Acciones Rápidas

El Dashboard proporciona dos acciones rápidas principales:

| Acción | Descripción |
|--------|-------------|
| **Crear Nuevo Contrato** | Abre el formulario de creación de contrato con wizard de 4 pasos |
| **Importar desde Google Drive** | Abre el selector de archivos de Google Drive para importar contratos |

## Dashboards Ejecutivos

Para análisis executives profundos, el backend de ContractIA expone endpoints analíticos especializados que proporcionan:

- **Área de ingresos/gasto**: Gráficos de área para proyecciones de ingresos (empresa) o gasto de planilla (trabajador)
- **Centro de alertas**: Categorías de contratos próximos a vencer o en vigencia prolongada
- **Contratos recientes**: Lista de los últimos contratos actualizados
- **Top empresas**: Ranking de empresas contrapartes por volumen o valor
- **Top servicios**: Ranking de servicios más contratados

Las métricas operativas generales (total de contratos, próximos a vencer, activos, vencidos) no forman parte del módulo dashboard del backend actual.

Para análisis executives profundos, consulte los módulos de dashboards especializados:

| Módulo | Descripción | Destinado a |
|--------|-------------|-------------|
| [Dashboards de Empresa](/es/producto/07-dashboards-empresa) | Análisis de clientes B2B, ingresos proyectados y alertas | CFO, Director Comercial, CEO |
| [Dashboards de Trabajador](/es/producto/08-dashboards-trabajador) | Gestión de RRHH, gasto de planilla y alertas | Director RRHH, CFO, Gerente Legal |

Estos módulos proporcionan Ficha Técnica, Guía de Funcionalidad y Valor de Negocio para la toma de decisiones estratégicas.

## Flujo de Navegación

```
Login → Dashboard → [Acciones]
                      ↓
           ┌────────────┼────────────┐
           ↓            ↓            ↓
      Contratos    Agente IA    Administración
```

El Dashboard actúa como hub central desde el cual el usuario puede navegar a cualquier módulo del sistema mediante la barra lateral de navegación.