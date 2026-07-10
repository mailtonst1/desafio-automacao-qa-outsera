# Solucao de problemas

## ServeRest

Verifique a configuracao do Docker Compose:

```sh
docker compose config
```

Inicie o servico:

```sh
docker compose up -d serverest
```

Endpoint de health check:

```text
http://localhost:3000/status
```

## Mobile

Verifique as ferramentas Android:

```sh
adb devices
emulator -list-avds
appium driver list --installed
```

O driver UiAutomator2 deve ser instalado pelo Appium antes da execucao dos testes Mobile.

## Testes de API

Valide a configuração e o health check do ambiente:

```sh
docker compose config
docker compose up -d serverest
```

Execute a suíte Docker-first:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\executar-api.ps1 -GerarRelatorio
```

Se o health check não responder, consulte os logs com `docker compose logs serverest`. Para remover o ambiente manualmente, use `docker compose down --remove-orphans`.
