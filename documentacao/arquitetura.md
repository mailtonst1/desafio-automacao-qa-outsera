# Architecture

The repository is organized as a monorepo with independent modules and shared root scripts.

## Modules

- `api-tests`: Maven project for API automation.
- `web-e2e`: Node project for Cypress automation.
- `mobile-tests`: Maven project for Appium automation.
- `performance-tests`: k6 assets and reports.
- `scripts`: cross-module diagnostics, bootstrap, and run wrappers.
- `docs`: project documentation.

## Services

ServeRest runs from Docker Compose using `paulogoncalvesbh/serverest:3.2.0`.

Host URL:

```text
http://localhost:3000
```

Container network URL:

```text
http://serverest:3000
```

