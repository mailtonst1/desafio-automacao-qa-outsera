package br.com.outsera.mobile.tela;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;

public final class TelaDeCarrinho extends TelaBase {
    private static final String ID = "com.saucelabs.mydemoapp.android:id/";
    public TelaDeCarrinho(AndroidDriver driver) { super(driver); }
    public void acessar() { tocar(By.id(ID + "cartRL")); }
    public void iniciarCheckout() { tocar(By.id(ID + "cartBt")); }
}
