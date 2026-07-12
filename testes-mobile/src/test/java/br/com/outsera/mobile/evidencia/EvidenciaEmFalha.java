package br.com.outsera.mobile.evidencia;

import io.appium.java_client.android.AndroidDriver;
import io.qameta.allure.Allure;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.OutputType;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.function.Supplier;

public final class EvidenciaEmFalha implements TestWatcher {
    private final Supplier<AndroidDriver> fornecedor;
    public EvidenciaEmFalha(Supplier<AndroidDriver> fornecedor) { this.fornecedor = fornecedor; }

    @Override
    public void testFailed(ExtensionContext contexto, Throwable causa) {
        AndroidDriver driver = fornecedor.get();
        if (driver == null) return;
        Allure.addAttachment("Screenshot em falha", "image/png", new ByteArrayInputStream(driver.getScreenshotAs(OutputType.BYTES)), ".png");
        Allure.addAttachment("Page source em falha", "application/xml", new ByteArrayInputStream(driver.getPageSource().getBytes(StandardCharsets.UTF_8)), ".xml");
    }
}
