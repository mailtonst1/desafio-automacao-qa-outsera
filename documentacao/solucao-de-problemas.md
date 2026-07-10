# Troubleshooting

## ServeRest

Check Docker Compose configuration:

```sh
docker compose config
```

Start the service:

```sh
docker compose up -d serverest
```

Health endpoint:

```text
http://localhost:3000/status
```

## Mobile

Verify Android tooling:

```sh
adb devices
emulator -list-avds
appium driver list --installed
```

The UiAutomator2 driver must be installed through Appium before mobile tests can run.

