# Testes Mobile

Suite de testes Android para o Sauce Labs My Demo App com Java 17, JUnit 5, Appium, UiAutomator2, Screen Object e Allure.

## Aplicativo validado

- Versao: `2.2.0` (`mda-2.2.0-25.apk`)
- Origem oficial: `https://github.com/saucelabs/my-demo-app-android/releases/tag/2.2.0`
- SHA-256: `318EF64BDCAFF18E576D962AB1F557E0A2683B9B5210A6BB6B25CB0CAEEF62B4`
- Pacote: `com.saucelabs.mydemoapp.android`
- Activity: `com.saucelabs.mydemoapp.android.view.activities.SplashActivity`

O APK nao e versionado. Baixe e valide-o com `scripts/baixar-aplicativo.ps1` ou `scripts/baixar-aplicativo.sh`; o checksum tambem esta em `apps/checksums.txt`.

## Pre-requisitos

Java 17, Android SDK com `adb` e emulador ou dispositivo conectado, Appium 3.1.2 e driver UiAutomator2 6.7.9. O diagnostico do driver e executado pelo script raiz.

Variaveis opcionais: `APPIUM_HOST`, `APPIUM_PORT`, `APP_PATH`, `DEVICE_NAME`, `PLATFORM_VERSION`, `UDID`, `NO_RESET` e `FULL_RESET`.

## Execucao

No Windows:

```powershell
.\scripts\executar-mobile.ps1
```

No Linux/macOS:

```sh
./scripts/executar-mobile.sh
```

O script valida o APK, exige um dispositivo Android conectado, inicia o Appium apenas quando a porta configurada estiver livre, executa `mvnw test allure:report` e encerra apenas o processo Appium iniciado por ele. Os resultados ficam em `target/allure-results` e o HTML em `target/site/allure-maven-plugin`.

## Cobertura

- abertura do catalogo;
- login valido;
- bloqueio de login invalido;
- abertura do primeiro produto;
- preenchimento do formulario de checkout;
- validacao de nome obrigatorio no checkout.

## Limitacoes

A execucao requer infraestrutura Android local. O cenario negativo do checkout valida a mensagem real da versao 2.2.0: `Please provide your full name.`

## Arquitetura, evidencias e CI

`configuracao` le ambiente e capabilities; `driver` cria/encerra a sessao; `tela` aplica Screen Object; `fabrica` centraliza dados; `fluxo` compoe jornadas; `evidencia` anexa screenshot e dispositivo ao final e, em falha, page source, logcat e Appium log. Cada teste cria sua propria sessao.

O job `testes-mobile` usa Ubuntu com KVM, emulador API 34 x86_64 em 1080x2400/densidade 420, instala o APK e executa Appium 3.1.2 com UiAutomator2 6.7.9. Localmente, a configuracao pode usar `APPIUM_HOST`, `APPIUM_PORT`, `APP_PATH`, `DEVICE_NAME`, `PLATFORM_VERSION`, `UDID`, `NO_RESET` e `FULL_RESET`.

Para `device not found`, confira `adb devices`; para APK ausente, rode o script de download; para Appium indisponivel, confirme a porta 4723 e `appium driver list --installed`; para timeout, confira versao/package/activity e os logs em `target/`. Resultados ficam em `target/allure-results`, Surefire em `target/surefire-reports` e o HTML Maven em `target/site/allure-maven-plugin`.
