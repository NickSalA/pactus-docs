---
title: "Visión General"
description: "Marco de pruebas del backend: frameworks, cobertura y propósito."
---

Las pruebas del backend de **Pactus** constituyen un pilar fundamental para garantizar la calidad, estabilidad y correcta evolución del sistema. Este módulo documenta cómo se estructuran las pruebas, qué framework se utiliza y cuál es el objetivo de cada capa de testing.

## Marco de Trabajo

El backend utiliza **pytest** como framework principal de testing. La elección de pytest responde a varias ventajas que se alinean con las necesidades del proyecto:

- **Simplicidad en la escritura**: La sintaxis declarativa de pytest permite escribir pruebas concisas y legibles, reduciendo la fricción al momento de crear nuevos casos de prueba.
- **Potentes fixtures**: El sistema de fixtures de pytest permite gestionar el setup y teardown de manera reutilizable, evitando código repetitivo en cada prueba.
- **Parametrización integrada**: Facilita la creación de pruebas con múltiples combinaciones de parámetros sin duplicar lógica.
- **Extensibilidad**: Existe un ecosistema amplio de plugins que permiten expandir las capacidades de testing según lo requiera el proyecto.

## Cobertura Actual

El backend cuenta con decenas de archivos de prueba distribuidos en los distintos módulos del sistema. Esta cobertura abarca múltiples capas de la aplicación:

- **Domain**: Pruebas de entidades, value objects, reglas de negocio y políticas de acceso.
- **Application**: Pruebas de servicios y lógica de aplicación.
- **Infrastructure**: Pruebas de repositorios, servicios externos e integraciones, generalmente con dependencias simuladas mediante mocks.
- **API**: Pruebas de endpoints, routers, parámetros HTTP y manejo de errores.
- **Integration**: Pruebas controladas contra dependencias reales de prueba, como PostgreSQL temporal para los modelos de lectura del dashboard.

La cobertura no es uniforme en todos los módulos, pero el objetivo es mantener una cobertura significativa en las áreas críticas del sistema, particularmente en aquellos flujos que implican interacción con datos sensibles, procesamiento de documentos legales, control de permisos o generación de respuestas analíticas.

## Propósito de las Pruebas

Las pruebas del backend cumplen varios objetivos dentro del ciclo de desarrollo:

### 1. Garantizar Correctitud

Cada prueba verifica que una parte específica del código funcione según lo esperado. Las pruebas de dominio validan que las entidades respeten las reglas de negocio, mientras que las pruebas de infraestructura y aplicación verifican que los servicios, repositorios y dependencias colaboren correctamente.

### 2. Prevenir Regresiones

Las pruebas existentes actúan como una red de seguridad ante cambios. Cuando se modifica una funcionalidad existente, las pruebas permiten detectar si el cambio introduce un comportamiento no deseado en otras partes del sistema.

### 3. Documentar el Comportamiento Esperado

Las pruebas funcionan como documentación ejecutable del sistema. Al leer una prueba, es posible entender qué comportamiento se espera de una entidad, servicio, repositorio o endpoint. Esta forma de documentación se mantiene sincronizada con el código porque una prueba fallida indica inmediatamente una diferencia entre el comportamiento esperado y la implementación actual.

### 4. Facilitar la Refactorización

Un conjunto sólido de pruebas permite refactorizar código con confianza. Si la refactorización conserva el comportamiento esperado, las pruebas deberían pasar; si fallan, indican que el comportamiento cambió inadvertidamente.

## Organización General

Las pruebas se encuentran en el directorio `Pactus-Backend/tests/` y se organizan siguiendo la misma estructura de módulos que el código fuente:

```text
tests/
├── conftest.py
├── test_app_setup.py
├── test_chatbot_prompt.py
├── users/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── documents/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── templates/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── chatbot/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── dashboard/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── integration/
│   └── api/
├── organizations/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── notifications/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── integrations/
│   ├── application/
│   ├── infrastructure/
│   └── api/
└── shared/
    └── infrastructure/
```

Esta organización permite localizar rápidamente las pruebas relacionadas con cada módulo del sistema, facilitando tanto el mantenimiento como la creación de nuevos casos de prueba.

## Relación con la Documentación

Las pruebas no son un elemento aislado. Se relacionan con otras partes de la documentación de las siguientes formas:

- **Backend**: Los contratos API definen el comportamiento esperado de los endpoints, y las pruebas de API verifican que el backend cumpla con esos contratos.
- **Base de datos**: Las pruebas de infraestructura que construyen consultas o interactúan con PostgreSQL deben respetar el modelo de datos documentado en `base-datos`.
- **IA**: Las pruebas del módulo chatbot verifican que el comportamiento del agente conversacional y sus herramientas sea consistente con lo documentado en `ia`.
- **Dashboard**: Las pruebas del dashboard validan reglas de acceso, endpoints, parámetros HTTP, agregaciones, rankings y modelos de lectura. Algunas pruebas pueden ejecutarse contra una base PostgreSQL temporal levantada con Docker.

Esta relación entre pruebas y documentación ayuda a mantener coherencia en todo el sistema y facilita detectar diferencias entre lo documentado, lo esperado y lo implementado.
