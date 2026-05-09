---
title: "Visión General"
description: "Marco de pruebas del backend: frameworks, cobertura y propósito."
---

Las pruebas del backend de **ContractIA** constituyen un pilar fundamental para garantizar la calidad, estabilidad y correcta evolución del sistema. Este módulo documenta cómo se estructuran las pruebas, qué frameworks se utilizan y cuál es el objetivo de cada capa de testing.

## Marco de Trabajo

El backend utiliza **pytest** como framework principal de testing. La elección de pytest responde a varias ventajas que se alinean con las necesidades del proyecto:

- **Simplicidad en la escritura**: La sintaxis declarativa de pytest permite escribir pruebas concisas y legibles, reduciendo la fricción al momento de crear nuevos casos de prueba.
- **Potentes fixtures**: El sistema de fixtures de pytest permite gestionar el setup y teardown de manera reutilizable, evitando código repetitivo en cada prueba.
- **Parametrización integrada**: Facilita la creación de pruebas con múltiples combinaciones de parámetros sin duplicar logique.
- **Extensibilidad**: Existe un ecosistema amplio de plugins que permiten expandir las capacidades de testing según lo requiera el proyecto.

## Cobertura Actual

El backend cuenta con más de **40 archivos de prueba** distribuidos en los distintos módulos del sistema. Esta cobertura abarca múltiples capas de la aplicación:

- **Domain**: Pruebas de entidades y reglas de negocio.
- **Application**: Pruebas de servicios y lógica de aplicación.
- **Infrastructure**: Pruebas de repositorios, servicios externos y integraciones.
- **API**: Pruebas de endpoints y routers.

La cobertura no es uniforme en todos los módulos, pero el objetivo es mantener una cobertura significativa en las áreas críticas del sistema, particularmente en aquellos flujos que implican interacción con datos sensibles o procesamiento de documentos legales.

## Propósito de las Pruebas

Las pruebas del backend cumplen varios objetivos dentro del ciclo de desarrollo:

### 1. Garantizar Correctitud

Cada prueba verifica que una parte específica del código funcione según lo esperado. Las pruebas de dominio validan que las entidades respeten las reglas de negocio, mientras que las pruebas de infraestructura verifican que la interacción con las bases de datos y servicios externos sea la correcta.

### 2. Prevenir Regression

Las pruebas existentes actúan como una red de seguridad ante cambios. Cuando se modifica una funcionalidad existente, las pruebas permiten detectar si el cambio introduce un comportamiento no deseado en otras partes del sistema.

### 3. Documentar el Comportamiento Esperado

Las pruebas funcionan como documentación ejecutable del sistema. Al leer una prueba, es posible entender qué comportamiento se espera de una entidad, servicio o endpoint. Esta forma de documentación siempre está sincronizada con el código, ya que las pruebas que fallan indican inmediatamente un desfasaje entre la documentación y la implementación.

### 4. Facilitar la Refactorización

Un conjunto sólido de pruebas permite refactorizar código con confianza. Si la refactorización es correcta, las pruebas deberían pasar; si fallan, indica que el comportamiento cambió inadvertidamente.

## Organización General

Las pruebas se encuentran en el directorio `ContractAI-Backend/tests/` y se organizan siguiendo la misma estructura de módulos que el código fuente:

```
tests/
├── users/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
├── documents/
├── templates/
├── chatbot/
├── organizations/
├── notifications/
├── integrations/
└── shared/
```

Esta organización permite localizar quickly las pruebas relacionadas con cada módulo del sistema, facilitando tanto el mantenimiento como la creación de nuevas pruebas.

## Relación con la Documentación

Las pruebas no son un elemento aislado. Se relacionan con otras partes de la documentación de las siguientes formas:

- **Backend**: Los contratos API definen el comportamiento esperado de los endpoints, y las pruebas de API verifican que el backend cumpla con esos contratos.
- **Base de datos**: Las pruebas de infraestructura que interactúan con PostgreSQL deben respetar el modelo de datos documentado en `base-datos`.
- **IA**: Las pruebas del módulo chatbot verifican que el comportamiento del agente conversacional sea el esperado según lo documentado en `ia`.

Esta intralink entre pruebas y documentación asegura coherencia en todo el sistema.