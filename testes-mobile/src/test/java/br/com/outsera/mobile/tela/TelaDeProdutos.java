package br.com.outsera.mobile.tela;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;

public final class TelaDeProdutos extends TelaBase {
    private static final String ID = "com.saucelabs.mydemoapp.android:id/";
    public TelaDeProdutos(AndroidDriver driver) { super(driver); }
    public boolean estaAberta() { return visivel(By.id(ID + "productTV")).getText().equals("Products"); }
    public String primeiroProduto() { return visivel(By.id(ID + "titleTV")).getText(); }
    public void abrirMenu() { tocar(By.id(ID + "menuIV")); }
    public void abrirPrimeiroProduto() { tocar(By.id(ID + "productIV")); }
}
