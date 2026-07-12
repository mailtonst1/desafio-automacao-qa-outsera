package br.com.outsera.mobile.tela;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

abstract class TelaBase {
    protected final AndroidDriver driver;
    private final WebDriverWait espera;

    TelaBase(AndroidDriver driver) {
        this.driver = driver;
        this.espera = new WebDriverWait(driver, Duration.ofSeconds(12));
    }

    protected WebElement visivel(By locator) { return espera.until(ExpectedConditions.visibilityOfElementLocated(locator)); }
    protected void tocar(By locator) { espera.until(ExpectedConditions.elementToBeClickable(locator)).click(); }
    protected void tocarAposRolar(String id) { driver.findElement(AppiumBy.androidUIAutomator("new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceId(\"" + id + "\"))")).click(); }
    protected void preencher(By locator, String valor) { WebElement campo = visivel(locator); campo.clear(); campo.sendKeys(valor); }
}
