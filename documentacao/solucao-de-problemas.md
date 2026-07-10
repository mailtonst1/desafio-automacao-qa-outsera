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
