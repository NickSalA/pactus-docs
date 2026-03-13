# ContractIA Docs

Este repositorio es exclusivamente de documentacion para ContractIA.

## Contenido

- OpenAPI: [docs/openapi.yaml](docs/openapi.yaml)
- Modulos OpenAPI: [docs/modules](docs/modules)
- Esquema global de errores: [docs/schemas/errors.yaml](docs/schemas/errors.yaml)
- Sitio de documentacion (Starlight): [astro](astro)

## Desarrollo local

Desde la raiz del repo:

```bash
cd astro
npm install
npm run dev
```

## Convenciones de commits

- fix: Aumenta la version en 0.0.1 (Correccion de bugs).
- feat: Aumenta la version en 0.1.0 (Nueva funcionalidad).
- feat!: Aumenta la version a 1.0.0 (Cambio de arquitectura que rompe la compatibilidad).
- style: Cambios en el formato o estilo del codigo.
- docs: Cambios en la documentacion.
- refactor: Refactorizacion del codigo.
- chore: Tareas relacionadas a CI/CD o mantenimiento.
- test: Alteraciones o adicion de pruebas.
