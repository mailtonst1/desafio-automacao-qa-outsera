package br.com.outsera.mobile.driver;

import br.com.outsera.mobile.configuracao.ConfiguracaoMobile;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;

import java.time.Duration;

public final class GerenciadorDeDriver {
    public AndroidDriver criar() {
        UiAutomator2Options opcoes = new UiAutomator2Options()
                .setPlatformName("Android")
                .setAutomationName("UiAutomator2")
                .setDeviceName(ConfiguracaoMobile.dispositivo())
                .setApp(ConfiguracaoMobile.app())
                .setAppPackage(ConfiguracaoMobile.PACKAGE)
                .setAppActivity(ConfiguracaoMobile.ACTIVITY)
                .setNoReset(ConfiguracaoMobile.semReset())
                .setFullReset(ConfiguracaoMobile.resetCompleto())
                .setUiautomator2ServerInstallTimeout(Duration.ofSeconds(60));
        if (!ConfiguracaoMobile.versaoDaPlataforma().isBlank()) opcoes.setPlatformVersion(ConfiguracaoMobile.versaoDaPlataforma());
        if (!ConfiguracaoMobile.udid().isBlank()) opcoes.setUdid(ConfiguracaoMobile.udid());

        AndroidDriver driver = new AndroidDriver(ConfiguracaoMobile.urlDoAppium(), opcoes);
        driver.manage().timeouts().implicitlyWait(Duration.ZERO);
        return driver;
    }

    public void finalizar(AndroidDriver driver) {
        if (driver != null) driver.quit();
    }
}
