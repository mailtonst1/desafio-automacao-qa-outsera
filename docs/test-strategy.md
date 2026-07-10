# Test Strategy

## Purpose

Define the planned automation strategy for the Outsera QA Automation Challenge monorepo.

## Layers

- API: validate ServeRest endpoints through REST Assured and JUnit 5.
- Web E2E: validate critical user journeys on Automation Exercise through Cypress, TypeScript, and Cucumber.
- Mobile: validate Android journeys on Sauce Labs My Demo App through Appium, UiAutomator2, and JUnit 5.
- Performance: validate ServeRest availability and load behavior through k6.

## Execution Model

API, Web, and Performance should be Docker-friendly to reduce evaluator workstation requirements. Mobile will support local execution and CI execution with an Android emulator.

## Data

Test data should be deterministic, isolated per run where possible, and cleaned up when the target application exposes safe cleanup paths.

## Reports

Allure will be the standard report format for API, Web, and Mobile. k6 summary exports will be stored under `performance-tests/reports/`.

