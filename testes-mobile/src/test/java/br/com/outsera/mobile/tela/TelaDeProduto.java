package br.com.outsera.mobile.tela;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;

public final class TelaDeProduto extends TelaBase {
    private static final String ID = "com.saucelabs.mydemoapp.android:id/";
    public TelaDeProduto(AndroidDriver driver) { super(driver); }
    public void adicionarAoCarrinho() { tocar(By.id(ID + "cartBt")); }
}
