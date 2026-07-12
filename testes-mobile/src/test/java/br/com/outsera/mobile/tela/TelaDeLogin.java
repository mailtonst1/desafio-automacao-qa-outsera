package br.com.outsera.mobile.tela;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.By;

public final class TelaDeLogin extends TelaBase {
    private static final String ID = "com.saucelabs.mydemoapp.android:id/";
    public TelaDeLogin(AndroidDriver driver) { super(driver); }
    public void acessar() { tocar(AppiumBy.androidUIAutomator("new UiScrollable(new UiSelector().resourceId(\"" + ID + "menuRV\")).scrollIntoView(new UiSelector().text(\"Log In\"))")); }
    public void preencherUsuario(String usuario) { preencher(By.id(ID + "nameET"), usuario); }
    public void preencherSenha(String senha) { preencher(By.id(ID + "passwordET"), senha); }
    public void enviar() { tocar(By.id(ID + "loginBtn")); }
    public String mensagemDeSenha() { return visivel(By.id(ID + "passwordErrorTV")).getText(); }
    public String mensagemDeUsuario() { return visivel(By.id(ID + "nameErrorTV")).getText(); }
}
