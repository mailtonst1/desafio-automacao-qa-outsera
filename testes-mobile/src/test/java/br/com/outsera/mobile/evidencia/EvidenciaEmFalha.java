package br.com.outsera.mobile.evidencia;

import io.appium.java_client.android.AndroidDriver;
import io.qameta.allure.Allure;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.OutputType;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

public final class EvidenciaEmFalha implements TestWatcher {
    private final Supplier<AndroidDriver> fornecedor;
    public EvidenciaEmFalha(Supplier<AndroidDriver> fornecedor) { this.fornecedor = fornecedor; }

    @Override
    public void testSuccessful(ExtensionContext contexto) {
        anexarEstadoFinal(contexto, "Estado final");
    }

    @Override
    public void testFailed(ExtensionContext contexto, Throwable causa) {
        anexarEstadoFinal(contexto, "Estado em falha");
        anexarArquivo("Appium log - " + contexto.getDisplayName(), Path.of("target", "appium.log"));
        anexarLogcat(contexto);
    }

    private void anexarEstadoFinal(ExtensionContext contexto, String etapa) {
        AndroidDriver driver = fornecedor.get();
        if (driver == null) return;
        String nome = etapa + " - " + contexto.getDisplayName();
        Allure.addAttachment("Screenshot - " + nome, "image/png", new ByteArrayInputStream(driver.getScreenshotAs(OutputType.BYTES)), ".png");
        Allure.addAttachment("Tela e dispositivo - " + nome, "text/plain", descricaoDoDispositivo(driver));
        if (etapa.equals("Estado em falha")) {
            Allure.addAttachment("Page source - " + nome, "application/xml", new ByteArrayInputStream(driver.getPageSource().getBytes(StandardCharsets.UTF_8)), ".xml");
        }
    }

    private String descricaoDoDispositivo(AndroidDriver driver) {
        return "platformName=" + driver.getCapabilities().getCapability("platformName") + "\n"
                + "platformVersion=" + driver.getCapabilities().getCapability("platformVersion") + "\n"
                + "deviceName=" + driver.getCapabilities().getCapability("deviceName") + "\n"
                + "udid=" + driver.getCapabilities().getCapability("udid") + "\n"
                + "currentPackage=" + driver.getCurrentPackage();
    }

    private void anexarLogcat(ExtensionContext contexto) {
        try {
            Process processo = new ProcessBuilder("adb", "logcat", "-d", "-t", "400")
                    .redirectErrorStream(true)
                    .start();
            processo.waitFor(10, TimeUnit.SECONDS);
            Allure.addAttachment("Logcat - " + contexto.getDisplayName(), "text/plain", new String(processo.getInputStream().readAllBytes(), StandardCharsets.UTF_8));
        } catch (InterruptedException excecao) {
            Thread.currentThread().interrupt();
            Allure.addAttachment("Logcat indisponivel - " + contexto.getDisplayName(), "text/plain", excecao.toString());
        } catch (IOException excecao) {
            Allure.addAttachment("Logcat indisponivel - " + contexto.getDisplayName(), "text/plain", excecao.toString());
        }
    }

    private void anexarArquivo(String nome, Path caminho) {
        try {
            if (Files.exists(caminho)) {
                Allure.addAttachment(nome, "text/plain", Files.readString(caminho));
            }
        } catch (IOException excecao) {
            Allure.addAttachment(nome + " indisponivel", "text/plain", excecao.toString());
        }
    }
}
