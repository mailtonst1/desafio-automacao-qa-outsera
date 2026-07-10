# Outsera QA Automation Challenge

Foundation for a QA automation monorepo targeting API, Web E2E, Mobile, and Performance test suites.

This phase creates only the repository baseline: documentation, initial module configuration, diagnostic scripts, bootstrap scripts, and local service configuration. Functional test implementation will be added in later phases.

## Scope

- `api-tests`: Java, Maven, REST Assured, JUnit 5, Allure, ServeRest local.
- `web-e2e`: Cypress, TypeScript, Cucumber/Gherkin, Page Object Pattern, Allure, Automation Exercise.
- `mobile-tests`: Java, Maven, Appium, UiAutomator2, JUnit 5, Screen Object Pattern, Allure, Sauce Labs My Demo App Android.
- `performance-tests`: k6, ServeRest local, smoke scenario, load scenario with 500 VUs.

## Applications

- ServeRest local: `http://localhost:3000`
- ServeRest container network URL: `http://serverest:3000`
- ServeRest health endpoint: `http://localhost:3000/status`
- Automation Exercise: `https://automationexercise.com`
- Sauce Labs My Demo App Android:
  - Planned app version: `2.2.0`
  - Repository: https://github.com/saucelabs/my-demo-app-android
  - Releases: https://github.com/saucelabs/my-demo-app-android/releases

The APK is not downloaded or versioned in this phase.

## Folder Structure

```text
.github/workflows/
api-tests/
web-e2e/
mobile-tests/
  apps/
  config/devices/
  config/capabilities/
  scripts/
performance-tests/
  scenarios/
  config/
  reports/
scripts/
docs/
reports/
```

## Docker

Start ServeRest:

```powershell
docker compose up -d serverest
```

Linux/macOS:

```sh
docker compose up -d serverest
```

Validate configuration:

```powershell
docker compose config
```

## Local Diagnostics

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\doctor.ps1
```

Linux/macOS:

```sh
chmod +x scripts/*.sh
./scripts/doctor.sh
```

The doctor scripts are read-only. They check Git, Docker, Docker Compose, Java, Maven, Node, npm, Android SDK, adb, emulator, Appium, UiAutomator2, and k6.

## Bootstrap

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
```

Linux/macOS:

```sh
./scripts/bootstrap.sh
```

Bootstrap installs only project dependencies and copies example files to local files ignored by Git. It does not silently install Docker, Android Studio, Java, or modify system environment variables.

## Run Scripts

Windows:

```powershell
.\scripts\run-api.ps1
.\scripts\run-web.ps1
.\scripts\run-mobile.ps1
.\scripts\run-performance.ps1
.\scripts\run-all.ps1
```

Linux/macOS:

```sh
./scripts/run-api.sh
./scripts/run-web.sh
./scripts/run-mobile.sh
./scripts/run-performance.sh
./scripts/run-all.sh
```

These scripts are intentionally conservative in this phase. They validate module readiness and call standard tool commands only when module files exist.

## Data Strategy

API and performance data will target ServeRest local. Later phases should isolate generated data per run and avoid relying on mutable shared state. Web and mobile flows should prefer deterministic setup and teardown through API helpers where possible.

## Reports

Reports will be written under `reports/` and module-specific report folders. Allure result folders are ignored by Git.

## CI/CD Plan

CI/CD is documented but not implemented in this phase. Future workflow design should run API, Web, and Performance through Docker-friendly jobs and Mobile through a configured Android emulator on GitHub Actions.

## Mobile Limitations

Mobile execution requires Android SDK, platform tools, emulator, Appium, UiAutomator2 driver, and a local APK path. Physical-device execution will require `UDID`, USB debugging, and compatible platform versions.

## Secrets Policy

Do not commit real `.env` files, credentials, tokens, APKs, or generated reports. Use `.env.example` and module example files as templates.

## Version Policy

Pinned versions are recorded in `versions.properties`. Do not use `latest` tags.

